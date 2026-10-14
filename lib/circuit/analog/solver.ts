import { LED_COLORS, LED_MAX_CURRENT, LED_ON_RESISTANCE, PART_DEFS, type AnalogPart, type Wire } from "./parts";

// Nodal analysis over a circuit where every element is a conductance with an
// internal source voltage: i(a→b) = g · (V(a) − V(b) − e).
//   resistor, bulb   g = 1/R              e = 0
//   battery          g = 1/r_internal     e = V   (Thevenin source)
//   capacitor        g = C/dt             e = v(previous step)   (backward Euler)
//   LED              off: g ≈ 0;  on: g = 1/R_on, e = V_forward   (piecewise linear)
//   switch, wire     closed: g = 1 kS (1 mΩ);  open: g ≈ 0
// Wires are tiny resistors rather than merged nodes so each one gets its own
// current (and direction) for display.

const WIRE_CONDUCTANCE = 1e3;
const OPEN_CONDUCTANCE = 1e-12;
// Ties floating nodes weakly to the reference so they don't make the system
// singular.
const GMIN = 1e-9;
const BATTERY_INTERNAL_RESISTANCE = 0.01;
export const SHORT_CIRCUIT_CURRENT = 10;
const MAX_LED_ITERATIONS = 25;

export interface SimState {
    capacitorVoltages: Record<string, number>;
    ledOn: Record<string, boolean>;
}

export const initialSimState = (): SimState => ({ capacitorVoltages: {}, ledOn: {} });

export interface PartReading {
    /** V(a) − V(b): across a battery, its terminal voltage. */
    voltage: number;
    /** Current through the part from a to b. For a battery: the current it delivers out of its + terminal. */
    current: number;
    /** Power absorbed by the part. For a battery: power delivered. */
    power: number;
    /** LED only: whether it conducts. */
    on?: boolean;
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
    const node = (part: AnalogPart, terminal: "a" | "b") => index.get(`${part.id}:${terminal}`) ?? REFERENCE;
    const ledOn: Record<string, boolean> = { ...previous.ledOn };

    const branchFor = (part: AnalogPart): Branch | null => {
        const a = node(part, "a");
        const b = node(part, "b");
        switch (part.kind) {
            case "battery":
                return { a, b, g: 1 / BATTERY_INTERNAL_RESISTANCE, e: part.value };
            case "resistor":
            case "bulb":
                return { a, b, g: 1 / Math.max(part.value, 1e-6), e: 0 };
            case "switch":
                return { a, b, g: part.closed ? WIRE_CONDUCTANCE : OPEN_CONDUCTANCE, e: 0 };
            case "capacitor":
                return { a, b, g: Math.max(part.value, 1e-15) / dt, e: previous.capacitorVoltages[part.id] ?? 0 };
            case "led":
                return ledOn[part.id]
                    ? { a, b, g: 1 / LED_ON_RESISTANCE, e: LED_COLORS[part.color ?? "red"].forwardVoltage }
                    : { a, b, g: OPEN_CONDUCTANCE, e: 0 };
            case "ground":
                return null;
        }
    };

    // --- Solve, re-solving while any LED's assumed on/off state was wrong.
    let voltages: number[] = new Array(size).fill(0);
    for (let iteration = 0; iteration < MAX_LED_ITERATIONS; iteration++) {
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
        const branches: Branch[] = [];
        for (const part of parts) {
            const branch = branchFor(part);
            if (branch) branches.push(branch);
        }
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
            if (part.kind !== "led") continue;
            const v = at(voltages, node(part, "a")) - at(voltages, node(part, "b"));
            const forward = LED_COLORS[part.color ?? "red"].forwardVoltage;
            const shouldConduct = ledOn[part.id] ? v >= forward : v > forward;
            if (shouldConduct !== Boolean(ledOn[part.id])) {
                ledOn[part.id] = shouldConduct;
                changed = true;
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
        const branch = branchFor(part);
        if (!branch) {
            readings[part.id] = { voltage: 0, current: 0, power: 0 };
            continue;
        }
        const voltage = at(voltages, branch.a) - at(voltages, branch.b);
        const throughAtoB = snap(branch.g * (voltage - branch.e));
        if (part.kind === "battery") {
            // "+ 0" turns -0 into 0 for a battery delivering nothing.
            const delivered = -throughAtoB + 0;
            readings[part.id] = { voltage, current: delivered, power: voltage * delivered };
            if (Math.abs(delivered) > SHORT_CIRCUIT_CURRENT) shortCircuit = true;
        } else {
            readings[part.id] = { voltage, current: throughAtoB, power: voltage * throughAtoB };
        }
        if (part.kind === "capacitor") capacitorVoltages[part.id] = voltage;
        if (part.kind === "led") {
            readings[part.id].on = Boolean(ledOn[part.id]);
            if (throughAtoB > LED_MAX_CURRENT) overloadedLeds.push(part.id);
        }
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
        state: { capacitorVoltages, ledOn },
    };
}

function at(voltages: number[], i: number) {
    return i === REFERENCE ? 0 : voltages[i];
}

// Nodes not connected to the reference through any real conductor (open
// switches and off LEDs don't count).
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
