import {
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
//   capacitor                        g = C/dt             e = v(previous step)   (backward Euler)
//   LED, diode, Zener                piecewise linear: off ≈ open; on: g = 1/R_on, e = V_forward;
//                                    Zener breakdown: g = 1/R_z, e = −V_z
//   switch, button, wire, ammeter    closed: g = 1 kS (1 mΩ);  open: g ≈ 0
//   fuse                             0.05 Ω until the current exceeds its rating, then open for good
//   voltmeter                        10 MΩ
// Wires are tiny resistors rather than merged nodes so each one gets its own
// current (and direction) for display.

const WIRE_CONDUCTANCE = 1e3;
const OPEN_CONDUCTANCE = 1e-12;
// Ties floating nodes weakly to the reference so they don't make the system
// singular.
const GMIN = 1e-9;
const BATTERY_INTERNAL_RESISTANCE = 0.01;
export const SHORT_CIRCUIT_CURRENT = 10;
const MAX_ITERATIONS = 40;

export type JunctionState = "off" | "on" | "reverse";

export interface SimState {
    capacitorVoltages: Record<string, number>;
    /** Conduction state of each LED, diode and Zener. */
    junctions: Record<string, JunctionState>;
    /** Fuses stay blown until the simulation is restarted or the fuse replaced. */
    blownFuses: Record<string, true>;
}

export const initialSimState = (): SimState => ({ capacitorVoltages: {}, junctions: {}, blownFuses: {} });

export interface PartReading {
    /** V(a) − V(b): across a battery, its terminal voltage. */
    voltage: number;
    /**
     * Current through the part from a to b (potentiometer: into terminal a).
     * For a battery: the current it delivers out of its + terminal.
     */
    current: number;
    /** Power absorbed by the part. For a battery: power delivered. */
    power: number;
    /** LEDs and diodes: whether they conduct (forward or, for a Zener, in breakdown). */
    on?: boolean;
    /** Zener only: conducting in reverse breakdown. */
    breakdown?: boolean;
    /** Potentiometer only: wiper voltage relative to terminal b. */
    wiperVoltage?: number;
    /** Fuse only. */
    blown?: boolean;
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

const REFERENCE = -1;
const isJunction = (part: AnalogPart) => part.kind === "led" || part.kind === "diode" || part.kind === "zener";

function forwardModel(part: AnalogPart) {
    return part.kind === "led"
        ? { voltage: LED_COLORS[part.color ?? "red"].forwardVoltage, resistance: LED_ON_RESISTANCE }
        : { voltage: DIODE_FORWARD_VOLTAGE, resistance: DIODE_ON_RESISTANCE };
}

export function solveCircuit(parts: AnalogPart[], wires: Wire[], previous: SimState, dt: number): SolveResult {
    // --- Number the terminals; ground (or a fallback) is the 0 V reference.
    const index = new Map<string, number>();
    const hasGround = parts.some((part) => part.kind === "ground");
    const fallbackReference = hasGround
        ? null
        : (() => {
              const battery = parts.find((part) => part.kind === "battery");
              if (battery) return `${battery.id}:b`;
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

    const branchesFor = (part: AnalogPart): Branch[] => {
        const a = node(part, "a");
        const b = node(part, "b");
        switch (part.kind) {
            case "battery":
                return [{ a, b, g: 1 / BATTERY_INTERNAL_RESISTANCE, e: part.value }];
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
            case "ground":
                return [];
        }
    };

    const branchCurrent = ({ a, b, g, e }: Branch, voltages: number[]) => g * (at(voltages, a) - at(voltages, b) - e);

    // --- Solve, re-solving while any diode's assumed state was wrong or a
    // fuse blew.
    let voltages: number[] = new Array(size).fill(0);
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
                if (state === "on" && current < 0) next = "off";
                else if (state === "reverse" && current > 0) next = "off";
                else if (state === "off" && v > forwardModel(part).voltage) next = "on";
                else if (state === "off" && part.kind === "zener" && v < -part.value) next = "reverse";
                if (next !== state) {
                    junctions[part.id] = next;
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
    let shortCircuit = false;
    const overloadedLeds: string[] = [];

    for (const part of parts) {
        const branches = branchesFor(part);
        if (branches.length === 0) {
            readings[part.id] = { voltage: 0, current: 0, power: 0 };
            continue;
        }
        const voltage = at(voltages, node(part, "a")) - at(voltages, node(part, "b"));
        const throughAtoB = snap(branchCurrent(branches[0], voltages));
        const power = branches.reduce((sum, branch) => {
            const v = at(voltages, branch.a) - at(voltages, branch.b);
            return sum + v * snap(branchCurrent(branch, voltages));
        }, 0);

        if (part.kind === "battery") {
            // "+ 0" turns -0 into 0 for a battery delivering nothing.
            const delivered = -throughAtoB + 0;
            readings[part.id] = { voltage, current: delivered, power: voltage * delivered };
            if (Math.abs(delivered) > SHORT_CIRCUIT_CURRENT) shortCircuit = true;
            continue;
        }

        const reading: PartReading = { voltage, current: throughAtoB, power };
        if (part.kind === "capacitor") capacitorVoltages[part.id] = voltage;
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
        state: { capacitorVoltages, junctions, blownFuses },
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
