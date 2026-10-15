import {
    BJT_RBE,
    BJT_RCE_SAT,
    BJT_VBE,
    BJT_VCE_SAT,
    DIODE_FORWARD_VOLTAGE,
    DIODE_ON_RESISTANCE,
    FUSE_RESISTANCE,
    LED_COLORS,
    LED_MAX_CURRENT,
    LED_ON_RESISTANCE,
    PART_DEFS,
    VOLTMETER_RESISTANCE,
    ZENER_RESISTANCE,
    type AnalogPart,
    type Terminal,
    type Wire,
} from "./parts";

// Nodal analysis over a circuit where every element is a conductance with an
// internal source voltage: i(a→b) = g · (V(a) − V(b) − e).
//   resistor, bulb, motor, buzzer   g = 1/R              e = 0
//   potentiometer                    two resistors meeting at the wiper
//   battery                          g = 1/r_internal     e = V   (Thevenin source)
//   AC source                        g = 1/r_internal     e = V_peak · sin(2π f t)
//   capacitor                        g = C/dt             e = v(previous step)   (backward Euler)
//   inductor                         g = dt/L             e = −i(previous step)/g   (backward Euler)
//   LED, diode, Zener                piecewise linear: off ≈ open; on: g = 1/R_on, e = V_forward;
//                                    Zener breakdown: g = 1/R_z, e = −V_z
//   switch, button, wire, ammeter    closed: g = 1 kS (1 mΩ);  open: g ≈ 0
//   fuse                             0.05 Ω until the current exceeds its rating, then open for good
//   voltmeter                        10 MΩ
//   oscilloscope                     ideal probe: no branch, it only reads node voltages
//   NPN / PNP transistor             piecewise linear: cutoff (open); active: base-emitter
//                                    junction plus a collector current source β·Ib;
//                                    saturation: base-emitter junction plus V_CE(sat) = 0.2 V
// Wires are tiny resistors rather than merged nodes so each one gets its own
// current (and direction) for display.

const WIRE_CONDUCTANCE = 1e3;
// Open switches, off diodes and blown fuses: small enough that their leakage
// stays under the 1 nV / 100 pA display floor even at hundreds of volts.
const OPEN_CONDUCTANCE = 1e-15;
// Ties floating nodes weakly to the reference so they don't make the system
// singular.
const GMIN = 1e-9;
const BATTERY_INTERNAL_RESISTANCE = 0.01;
export const SHORT_CIRCUIT_CURRENT = 10;
const MAX_ITERATIONS = 40;
// A diode only counts as conducting if real current flows; a forward
// voltage across it with no return path (e.g. in series with an open
// switch or a cut-off transistor) isn't enough.
const MIN_CONDUCTION_CURRENT = 1e-9;

export type JunctionState = "off" | "on" | "reverse";
export type TransistorState = "cutoff" | "active" | "saturation";

export interface SimState {
    capacitorVoltages: Record<string, number>;
    inductorCurrents: Record<string, number>;
    /** Conduction state of each LED, diode and Zener. */
    junctions: Record<string, JunctionState>;
    /** Fuses stay blown until the simulation is restarted or the fuse replaced. */
    blownFuses: Record<string, true>;
    transistors: Record<string, TransistorState>;
}

export const initialSimState = (): SimState => ({ capacitorVoltages: {}, inductorCurrents: {}, junctions: {}, blownFuses: {}, transistors: {} });

export interface PartReading {
    /** V(a) − V(b): across a battery, its terminal voltage. */
    voltage: number;
    /**
     * Current through the part from a to b (potentiometer: into terminal a).
     * For a battery or AC source: the current it delivers out of terminal a.
     */
    current: number;
    /** Power absorbed by the part. For a battery or AC source: power delivered. */
    power: number;
    /** LEDs and diodes: whether they conduct (forward or, for a Zener, in breakdown). */
    on?: boolean;
    /** Zener only: conducting in reverse breakdown. */
    breakdown?: boolean;
    /** Potentiometer only: wiper voltage relative to terminal b. */
    wiperVoltage?: number;
    /** Fuse only. */
    blown?: boolean;
    /** Transistors only: base current (into the base for NPN, out of it for PNP). */
    baseCurrent?: number;
    transistorState?: TransistorState;
}

export interface SolveResult {
    terminalVoltages: Record<string, number>;
    readings: Record<string, PartReading>;
    /** Current along each wire from its `from` terminal to its `to` terminal. */
    wireCurrents: Record<string, number>;
    shortCircuit: boolean;
    overloadedLeds: string[];
    state: SimState;
}

interface Branch {
    a: number;
    b: number;
    g: number;
    e: number;
}

// Voltage-controlled current source: a current gm·(V(cp) − V(cn)) + i0
// leaves node p and enters node q.
interface ControlledSource {
    p: number;
    q: number;
    cp: number;
    cn: number;
    gm: number;
    i0: number;
}

const REFERENCE = -1;
const isJunction = (part: AnalogPart) => part.kind === "led" || part.kind === "diode" || part.kind === "zener";

function forwardModel(part: AnalogPart) {
    return part.kind === "led"
        ? { voltage: LED_COLORS[part.color ?? "red"].forwardVoltage, resistance: LED_ON_RESISTANCE }
        : { voltage: DIODE_FORWARD_VOLTAGE, resistance: DIODE_ON_RESISTANCE };
}

/** `time` is the simulated time in seconds, used by AC sources. */
export function solveCircuit(parts: AnalogPart[], wires: Wire[], previous: SimState, dt: number, time = 0): SolveResult {
    // --- Number the terminals; ground (or a fallback) is the 0 V reference.
    const index = new Map<string, number>();
    const hasGround = parts.some((part) => part.kind === "ground");
    const fallbackReference = hasGround
        ? null
        : (() => {
              // A source's − terminal, as you'd ground it on a bench.
              const source = parts.find((part) => part.kind === "battery" || part.kind === "ac");
              if (source) return `${source.id}:b`;
              return parts.length > 0 ? `${parts[0].id}:a` : null;
          })();

    let size = 0;
    for (const part of parts) {
        for (const terminal of PART_DEFS[part.kind].terminals) {
            const key = `${part.id}:${terminal}`;
            if (part.kind === "ground" || key === fallbackReference) index.set(key, REFERENCE);
            else index.set(key, size++);
        }
    }

    const connectedWires = wires.filter((wire) => index.has(wire.from) && index.has(wire.to) && wire.from !== wire.to);
    const node = (part: AnalogPart, terminal: Terminal) => index.get(`${part.id}:${terminal}`) ?? REFERENCE;
    const junctions: Record<string, JunctionState> = { ...previous.junctions };
    const blownFuses: Record<string, true> = { ...previous.blownFuses };
    const transistors: Record<string, TransistorState> = { ...previous.transistors };

    // Transistor terminals ordered so the same equations serve NPN and PNP:
    // "forward" is base→emitter for NPN and emitter→base for PNP.
    const bjtNodes = (part: AnalogPart) => {
        const b = node(part, "b");
        const c = node(part, "c");
        const e = node(part, "e");
        return part.kind === "npn" ? { b, c, e, sign: 1 } : { b, c, e, sign: -1 };
    };
    const baseBranch = (part: AnalogPart): Branch => {
        const { b, e, sign } = bjtNodes(part);
        return sign > 0 ? { a: b, b: e, g: 1 / BJT_RBE, e: BJT_VBE } : { a: e, b, g: 1 / BJT_RBE, e: BJT_VBE };
    };
    const saturationBranch = (part: AnalogPart): Branch => {
        const { c, e, sign } = bjtNodes(part);
        return sign > 0 ? { a: c, b: e, g: 1 / BJT_RCE_SAT, e: BJT_VCE_SAT } : { a: e, b: c, g: 1 / BJT_RCE_SAT, e: BJT_VCE_SAT };
    };
    const controlledFor = (part: AnalogPart): ControlledSource[] => {
        if ((part.kind !== "npn" && part.kind !== "pnp") || transistors[part.id] !== "active") return [];
        const { b, c, e, sign } = bjtNodes(part);
        const gm = part.value / BJT_RBE;
        // Collector current β·Ib with Ib = (V_be − 0.7) / R_be.
        return sign > 0
            ? [{ p: c, q: e, cp: b, cn: e, gm, i0: -gm * BJT_VBE }]
            : [{ p: e, q: c, cp: e, cn: b, gm, i0: -gm * BJT_VBE }];
    };

    const branchesFor = (part: AnalogPart): Branch[] => {
        const a = node(part, "a");
        const b = node(part, "b");
        switch (part.kind) {
            case "battery":
                return [{ a, b, g: 1 / BATTERY_INTERNAL_RESISTANCE, e: part.value }];
            case "ac":
                return [{ a, b, g: 1 / BATTERY_INTERNAL_RESISTANCE, e: part.value * Math.sin(2 * Math.PI * (part.frequency ?? 1) * time) }];
            case "resistor":
            case "bulb":
            case "motor":
            case "buzzer":
                return [{ a, b, g: 1 / Math.max(part.value, 1e-6), e: 0 }];
            case "potentiometer": {
                const w = node(part, "w");
                const position = Math.min(1, Math.max(0, part.position ?? 0.5));
                // Keep a sliver of resistance at the ends so the wiper never shorts.
                const total = Math.max(part.value, 1);
                return [
                    { a, b: w, g: 1 / Math.max(total * position, 1e-3), e: 0 },
                    { a: w, b, g: 1 / Math.max(total * (1 - position), 1e-3), e: 0 },
                ];
            }
            case "switch":
            case "button":
                return [{ a, b, g: part.closed ? WIRE_CONDUCTANCE : OPEN_CONDUCTANCE, e: 0 }];
            case "ammeter":
                return [{ a, b, g: WIRE_CONDUCTANCE, e: 0 }];
            case "voltmeter":
                return [{ a, b, g: 1 / VOLTMETER_RESISTANCE, e: 0 }];
            case "fuse":
                return [{ a, b, g: blownFuses[part.id] ? OPEN_CONDUCTANCE : 1 / FUSE_RESISTANCE, e: 0 }];
            case "capacitor":
                return [{ a, b, g: Math.max(part.value, 1e-15) / dt, e: previous.capacitorVoltages[part.id] ?? 0 }];
            case "inductor": {
                const g = dt / Math.max(part.value, 1e-12);
                return [{ a, b, g, e: -(previous.inductorCurrents[part.id] ?? 0) / g }];
            }
            case "led":
            case "diode":
            case "zener": {
                const state = junctions[part.id] ?? "off";
                if (state === "on") {
                    const forward = forwardModel(part);
                    return [{ a, b, g: 1 / forward.resistance, e: forward.voltage }];
                }
                if (state === "reverse") return [{ a, b, g: 1 / ZENER_RESISTANCE, e: -part.value }];
                return [{ a, b, g: OPEN_CONDUCTANCE, e: 0 }];
            }
            case "npn":
            case "pnp": {
                const state = transistors[part.id] ?? "cutoff";
                if (state === "cutoff") return [{ ...baseBranch(part), g: OPEN_CONDUCTANCE, e: 0 }];
                return state === "saturation" ? [baseBranch(part), saturationBranch(part)] : [baseBranch(part)];
            }
            case "ground":
            case "oscilloscope":
                return [];
        }
    };

    const branchCurrent = ({ a, b, g, e }: Branch, voltages: number[]) => g * (at(voltages, a) - at(voltages, b) - e);

    // --- Solve, re-solving while any diode's assumed state was wrong or a
    // fuse blew. Diodes switched off for lack of a current path aren't
    // re-tried in this solve, so they can't flip back and forth.
    let voltages: number[] = new Array(size).fill(0);
    const noPath = new Set<string>();
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));
        const rhs = new Array<number>(size).fill(0);
        const stamp = ({ a, b, g, e }: Branch) => {
            if (a >= 0) {
                matrix[a][a] += g;
                rhs[a] += g * e;
            }
            if (b >= 0) {
                matrix[b][b] += g;
                rhs[b] -= g * e;
            }
            if (a >= 0 && b >= 0) {
                matrix[a][b] -= g;
                matrix[b][a] -= g;
            }
        };
        const branches: Branch[] = parts.flatMap(branchesFor);
        for (const wire of connectedWires) {
            branches.push({ a: index.get(wire.from)!, b: index.get(wire.to)!, g: WIRE_CONDUCTANCE, e: 0 });
        }
        branches.forEach(stamp);
        for (const { p, q, cp, cn, gm, i0 } of parts.flatMap(controlledFor)) {
            for (const [row, sign] of [[p, 1], [q, -1]] as const) {
                if (row < 0) continue;
                if (cp >= 0) matrix[row][cp] += sign * gm;
                if (cn >= 0) matrix[row][cn] -= sign * gm;
                rhs[row] -= sign * i0;
            }
        }
        // Only nodes with no conducting path to the reference get GMIN;
        // adding it everywhere would show as phantom leakage current.
        for (const i of floatingNodes(size, branches)) matrix[i][i] += GMIN;
        voltages = solveLinear(matrix, rhs);

        let changed = false;
        for (const part of parts) {
            if (isJunction(part)) {
                const v = at(voltages, node(part, "a")) - at(voltages, node(part, "b"));
                const current = branchCurrent(branchesFor(part)[0], voltages);
                const state = junctions[part.id] ?? "off";
                let next: JunctionState = state;
                if (state === "on" && current < MIN_CONDUCTION_CURRENT) {
                    next = "off";
                    if (current >= 0) noPath.add(part.id);
                } else if (state === "reverse" && current > -MIN_CONDUCTION_CURRENT) {
                    next = "off";
                    if (current <= 0) noPath.add(part.id);
                } else if (state === "off" && !noPath.has(part.id)) {
                    if (v > forwardModel(part).voltage) next = "on";
                    else if (part.kind === "zener" && v < -part.value) next = "reverse";
                }
                if (next !== state) {
                    junctions[part.id] = next;
                    changed = true;
                }
            } else if (part.kind === "npn" || part.kind === "pnp") {
                const { c, e, sign } = bjtNodes(part);
                const state = transistors[part.id] ?? "cutoff";
                const vbe = branchCurrent({ ...baseBranch(part), g: 1, e: 0 }, voltages);
                const vce = sign * (at(voltages, c) - at(voltages, e));
                const ib = state === "cutoff" ? 0 : branchCurrent(baseBranch(part), voltages);
                let next: TransistorState = state;
                if (state === "cutoff" && vbe > BJT_VBE) next = "active";
                else if (state !== "cutoff" && ib < 0) next = "cutoff";
                else if (state === "active" && vce < BJT_VCE_SAT) next = "saturation";
                else if (state === "saturation" && branchCurrent(saturationBranch(part), voltages) > part.value * ib) next = "active";
                if (next !== state) {
                    transistors[part.id] = next;
                    changed = true;
                }
            } else if (part.kind === "fuse" && !blownFuses[part.id]) {
                if (Math.abs(branchCurrent(branchesFor(part)[0], voltages)) > part.value) {
                    blownFuses[part.id] = true;
                    changed = true;
                }
            }
        }
        if (!changed) break;
    }

    // --- Readings.
    const terminalVoltages: Record<string, number> = {};
    for (const [key, i] of index) terminalVoltages[key] = at(voltages, i);

    const readings: Record<string, PartReading> = {};
    const capacitorVoltages: Record<string, number> = {};
    const inductorCurrents: Record<string, number> = {};
    let shortCircuit = false;
    const overloadedLeds: string[] = [];

    for (const part of parts) {
        const branches = branchesFor(part);
        if (branches.length === 0) {
            readings[part.id] = { voltage: 0, current: 0, power: 0 };
            continue;
        }
        const voltage = difference(at(voltages, node(part, "a")), at(voltages, node(part, "b")));
        const throughAtoB = snap(branchCurrent(branches[0], voltages));
        const power = branches.reduce((sum, branch) => {
            const v = at(voltages, branch.a) - at(voltages, branch.b);
            return sum + v * snap(branchCurrent(branch, voltages));
        }, 0);

        if (part.kind === "npn" || part.kind === "pnp") {
            const { c, e } = bjtNodes(part);
            const state = transistors[part.id] ?? "cutoff";
            // Forward base-emitter voltage (positive when the junction is forward biased).
            const vbe = branchCurrent({ ...baseBranch(part), g: 1, e: 0 }, voltages);
            const ib = state === "cutoff" ? 0 : snap(branchCurrent(baseBranch(part), voltages));
            const ic =
                state === "saturation"
                    ? snap(branchCurrent(saturationBranch(part), voltages))
                    : state === "active"
                      ? snap((part.value / BJT_RBE) * (vbe - BJT_VBE))
                      : 0;
            const vce = difference(at(voltages, c), at(voltages, e));
            readings[part.id] = {
                voltage: vce,
                current: ic,
                power: Math.abs(vce * ic) + Math.abs(vbe * ib),
                baseCurrent: ib,
                transistorState: state,
            };
            continue;
        }

        if (part.kind === "battery" || part.kind === "ac") {
            // "+ 0" turns -0 into 0 for a battery delivering nothing.
            const delivered = -throughAtoB + 0;
            readings[part.id] = { voltage, current: delivered, power: voltage * delivered };
            if (Math.abs(delivered) > SHORT_CIRCUIT_CURRENT) shortCircuit = true;
            continue;
        }

        const reading: PartReading = { voltage, current: throughAtoB, power };
        if (part.kind === "capacitor") capacitorVoltages[part.id] = voltage;
        if (part.kind === "inductor") inductorCurrents[part.id] = branchCurrent(branches[0], voltages);
        if (part.kind === "potentiometer") reading.wiperVoltage = at(voltages, node(part, "w")) - at(voltages, node(part, "b"));
        if (part.kind === "fuse") reading.blown = Boolean(blownFuses[part.id]);
        if (isJunction(part)) {
            const state = junctions[part.id] ?? "off";
            reading.on = state !== "off";
            if (part.kind === "zener") reading.breakdown = state === "reverse";
            if (part.kind === "led" && throughAtoB > LED_MAX_CURRENT) overloadedLeds.push(part.id);
        }
        readings[part.id] = reading;
    }

    const wireCurrents: Record<string, number> = {};
    for (const wire of connectedWires) {
        wireCurrents[wire.id] = snap(WIRE_CONDUCTANCE * (at(voltages, index.get(wire.from)!) - at(voltages, index.get(wire.to)!)));
    }

    return {
        terminalVoltages,
        readings,
        wireCurrents,
        shortCircuit,
        overloadedLeds,
        state: { capacitorVoltages, inductorCurrents, junctions, blownFuses, transistors },
    };
}

// Voltages under a nanovolt are leakage through floating nodes, not real.
function at(voltages: number[], i: number) {
    if (i === REFERENCE) return 0;
    return Math.abs(voltages[i]) < 1e-9 ? 0 : voltages[i];
}

// Nodes not connected to the reference through any real conductor (open
// switches, off diodes and blown fuses don't count).
function floatingNodes(size: number, branches: Branch[]): number[] {
    const parent = Array.from({ length: size + 1 }, (_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const slot = (i: number) => (i === REFERENCE ? size : i);
    for (const { a, b, g } of branches) {
        if (g > OPEN_CONDUCTANCE * 10) parent[find(slot(a))] = find(slot(b));
    }
    const root = find(size);
    const floating: number[] = [];
    for (let i = 0; i < size; i++) if (find(i) !== root) floating.push(i);
    return floating;
}

// Rounding noise from subtracting two nearly equal node voltages.
function difference(a: number, b: number) {
    const diff = a - b;
    return Math.abs(diff) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) ? 0 : diff;
}

// Currents this small are numerical leakage, not real current.
const snap = (current: number) => (Math.abs(current) < 1e-10 ? 0 : current);

// Gaussian elimination with partial pivoting; circuits here are small.
export function solveLinear(matrix: number[][], rhs: number[]): number[] {
    const n = rhs.length;
    const a = matrix.map((row) => row.slice());
    const b = rhs.slice();

    for (let col = 0; col < n; col++) {
        let pivot = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
        }
        if (Math.abs(a[pivot][col]) < 1e-300) continue;
        [a[col], a[pivot]] = [a[pivot], a[col]];
        [b[col], b[pivot]] = [b[pivot], b[col]];
        for (let row = col + 1; row < n; row++) {
            const factor = a[row][col] / a[col][col];
            if (factor === 0) continue;
            for (let k = col; k < n; k++) a[row][k] -= factor * a[col][k];
            b[row] -= factor * b[col];
        }
    }

    const x = new Array<number>(n).fill(0);
    for (let row = n - 1; row >= 0; row--) {
        let sum = b[row];
        for (let k = row + 1; k < n; k++) sum -= a[row][k] * x[k];
        x[row] = Math.abs(a[row][row]) < 1e-300 ? 0 : sum / a[row][row];
    }
    return x;
}
