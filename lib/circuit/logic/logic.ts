// Digital logic simulation: switches and clocks drive gates, gates drive
// LEDs. Signals are booleans; an unconnected input reads as 0.

export type GateKind = "and" | "or" | "not" | "nand" | "nor" | "xor" | "xnor";
export type LogicKind = "switch" | "clock" | "led" | GateKind;

export const GATE_KINDS: GateKind[] = ["and", "or", "not", "nand", "nor", "xor", "xnor"];

export interface LogicPart {
    id: string;
    kind: LogicKind;
    /** Switch: its position. */
    on?: boolean;
    /** Clock: full period in seconds. */
    period?: number;
    /** Name shown for switches and LEDs, and used in the truth table. */
    label?: string;
}

export interface LogicWire {
    id: string;
    /** "<partId>:out" */
    from: string;
    /** "<partId>:in0" or "<partId>:in1" */
    to: string;
}

export interface PlacedLogicPart extends LogicPart {
    x: number;
    y: number;
}

export interface LogicDocument {
    parts: PlacedLogicPart[];
    wires: LogicWire[];
}

const GATE_FUNCS: Record<GateKind, (a: boolean, b: boolean) => boolean> = {
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    not: (a) => !a,
    nand: (a, b) => !(a && b),
    nor: (a, b) => !(a || b),
    xor: (a, b) => a !== b,
    xnor: (a, b) => a === b,
};

export const isGate = (kind: LogicKind): kind is GateKind => (GATE_KINDS as string[]).includes(kind);

/** Input handles a part accepts. */
export function inputsOf(kind: LogicKind): ("in0" | "in1")[] {
    if (kind === "switch" || kind === "clock") return [];
    if (kind === "not" || kind === "led") return ["in0"];
    return ["in0", "in1"];
}

export const hasOutput = (kind: LogicKind) => kind !== "led";

export interface LogicResult {
    /** Output value of every switch, clock and gate. */
    outputs: Record<string, boolean>;
    /** Value at each LED's input. */
    leds: Record<string, boolean>;
    /** Value carried by each wire. */
    wires: Record<string, boolean>;
    /** False when feedback never settles (e.g. a NOT gate feeding itself). */
    stable: boolean;
}

const MAX_PASSES = 64;

/**
 * Settles the circuit from the previous outputs, so latches keep their state.
 * `clockValues` gives each clock's current level.
 */
export function simulateLogic(
    parts: LogicPart[],
    wires: LogicWire[],
    clockValues: Record<string, boolean> = {},
    previous: Record<string, boolean> = {}
): LogicResult {
    const driver = new Map<string, string>();
    for (const wire of wires) driver.set(wire.to, wire.from.split(":")[0]);

    const outputs: Record<string, boolean> = {};
    for (const part of parts) {
        if (part.kind === "switch") outputs[part.id] = Boolean(part.on);
        else if (part.kind === "clock") outputs[part.id] = Boolean(clockValues[part.id]);
        else if (isGate(part.kind)) outputs[part.id] = Boolean(previous[part.id]);
    }
    const input = (id: string, handle: string) => {
        const source = driver.get(`${id}:${handle}`);
        return source ? Boolean(outputs[source]) : false;
    };

    const gates = parts.filter((part) => isGate(part.kind));
    let stable = false;
    for (let pass = 0; pass < MAX_PASSES && !stable; pass++) {
        stable = true;
        for (const gate of gates) {
            const value = GATE_FUNCS[gate.kind as GateKind](input(gate.id, "in0"), input(gate.id, "in1"));
            if (value !== outputs[gate.id]) {
                outputs[gate.id] = value;
                stable = false;
            }
        }
    }

    const leds: Record<string, boolean> = {};
    for (const part of parts) if (part.kind === "led") leds[part.id] = input(part.id, "in0");
    const wireValues: Record<string, boolean> = {};
    for (const wire of wires) wireValues[wire.id] = Boolean(outputs[wire.from.split(":")[0]]);

    return { outputs, leds, wires: wireValues, stable };
}

/** True when some gate's output feeds back into its own inputs. */
export function hasFeedback(parts: LogicPart[], wires: LogicWire[]): boolean {
    const next = new Map<string, string[]>();
    for (const wire of wires) {
        const from = wire.from.split(":")[0];
        next.set(from, [...(next.get(from) ?? []), wire.to.split(":")[0]]);
    }
    const state = new Map<string, "visiting" | "done">();
    const visit = (id: string): boolean => {
        if (state.get(id) === "visiting") return true;
        if (state.get(id) === "done") return false;
        state.set(id, "visiting");
        const cyclic = (next.get(id) ?? []).some(visit);
        state.set(id, "done");
        return cyclic;
    };
    return parts.some((part) => visit(part.id));
}

export const MAX_TRUTH_TABLE_INPUTS = 6;

export interface TruthTable {
    inputs: string[];
    outputs: string[];
    rows: { inputs: boolean[]; outputs: boolean[] }[];
}

/**
 * Truth table over the switches (inputs) and LEDs (outputs), or the reason
 * one can't be made for this circuit.
 */
export function truthTable(parts: LogicPart[], wires: LogicWire[]): TruthTable | { reason: string } {
    const switches = parts.filter((part) => part.kind === "switch");
    const leds = parts.filter((part) => part.kind === "led");
    if (parts.some((part) => part.kind === "clock")) return { reason: "Truth tables aren't shown for circuits with a clock." };
    if (switches.length === 0 || leds.length === 0) return { reason: "Add at least one switch and one LED to see a truth table." };
    if (switches.length > MAX_TRUTH_TABLE_INPUTS) return { reason: `Truth tables are shown for up to ${MAX_TRUTH_TABLE_INPUTS} switches.` };
    if (hasFeedback(parts, wires)) return { reason: "This circuit has feedback (like a latch), so its outputs depend on its history, not just its inputs." };

    const name = (part: LogicPart) => part.label || part.id;
    const rows = Array.from({ length: 2 ** switches.length }, (_, row) => {
        const values = switches.map((_, i) => Boolean((row >> (switches.length - 1 - i)) & 1));
        const set = parts.map((part) => (part.kind === "switch" ? { ...part, on: values[switches.indexOf(part)] } : part));
        const result = simulateLogic(set, wires);
        return { inputs: values, outputs: leds.map((led) => result.leds[led.id]) };
    });
    return { inputs: switches.map(name), outputs: leds.map(name), rows };
}

const LOGIC_KINDS: LogicKind[] = ["switch", "clock", "led", ...GATE_KINDS];
export const MIN_CLOCK_PERIOD = 0.1;
export const MAX_CLOCK_PERIOD = 10;

export function parseLogicDocument(input: unknown): LogicDocument {
    if (!input || typeof input !== "object") throw new Error("The file doesn't contain a circuit.");
    const { parts, wires } = input as { parts?: unknown; wires?: unknown };
    if (!Array.isArray(parts) || !Array.isArray(wires)) throw new Error("The file doesn't contain a circuit (missing parts or wires).");

    const ids = new Set<string>();
    const cleanParts: PlacedLogicPart[] = parts.map((raw, i) => {
        const part = raw as Partial<PlacedLogicPart>;
        if (typeof part.id !== "string" || !part.id || ids.has(part.id)) throw new Error(`Part ${i + 1} has a missing or duplicate id.`);
        if (!part.kind || !LOGIC_KINDS.includes(part.kind)) throw new Error(`Part "${part.id}" has an unknown type.`);
        ids.add(part.id);
        const clean: PlacedLogicPart = {
            id: part.id,
            kind: part.kind,
            x: Number.isFinite(part.x) ? Number(part.x) : 0,
            y: Number.isFinite(part.y) ? Number(part.y) : 0,
        };
        if (typeof part.label === "string") clean.label = part.label.slice(0, 12);
        if (part.kind === "switch") clean.on = Boolean(part.on);
        if (part.kind === "clock") {
            const period = Number.isFinite(part.period) ? Number(part.period) : 1;
            clean.period = Math.min(MAX_CLOCK_PERIOD, Math.max(MIN_CLOCK_PERIOD, period));
        }
        return clean;
    });

    const kindOf = new Map(cleanParts.map((part) => [part.id, part.kind]));
    const used = new Set<string>();
    const cleanWires: LogicWire[] = [];
    wires.forEach((raw, i) => {
        const wire = raw as Partial<LogicWire>;
        if (typeof wire.from !== "string" || typeof wire.to !== "string") return;
        const [fromId, fromHandle] = wire.from.split(":");
        const [toId, toHandle] = wire.to.split(":");
        const fromKind = kindOf.get(fromId);
        const toKind = kindOf.get(toId);
        if (!fromKind || !toKind || fromHandle !== "out" || !hasOutput(fromKind)) return;
        if (!inputsOf(toKind).includes(toHandle as "in0" | "in1") || used.has(wire.to)) return;
        used.add(wire.to);
        cleanWires.push({ id: typeof wire.id === "string" && wire.id ? wire.id : `w${i + 1}`, from: wire.from, to: wire.to });
    });

    return { parts: cleanParts, wires: cleanWires };
}

const w = (id: string, from: string, to: string): LogicWire => ({ id, from: `${from}:out`, to });

export interface LogicExample {
    id: string;
    label: string;
    description: string;
    circuit: LogicDocument;
}

export const LOGIC_EXAMPLES: LogicExample[] = [
    {
        id: "and",
        label: "AND gate",
        description: "The LED lights only when both switches are on.",
        circuit: {
            parts: [
                { id: "a", kind: "switch", label: "A", x: 0, y: 0 },
                { id: "b", kind: "switch", label: "B", x: 0, y: 120 },
                { id: "g1", kind: "and", x: 200, y: 50 },
                { id: "y", kind: "led", label: "Y", x: 400, y: 60 },
            ],
            wires: [w("w1", "a", "g1:in0"), w("w2", "b", "g1:in1"), w("w3", "g1", "y:in0")],
        },
    },
    {
        id: "half-adder",
        label: "Half adder",
        description: "Adds two bits: XOR gives the sum, AND gives the carry.",
        circuit: {
            parts: [
                { id: "a", kind: "switch", label: "A", x: 0, y: 40 },
                { id: "b", kind: "switch", label: "B", x: 0, y: 200 },
                { id: "x1", kind: "xor", x: 220, y: 20 },
                { id: "n1", kind: "and", x: 220, y: 200 },
                { id: "s", kind: "led", label: "Sum", x: 440, y: 30 },
                { id: "c", kind: "led", label: "Carry", x: 440, y: 210 },
            ],
            wires: [
                w("w1", "a", "x1:in0"),
                w("w2", "b", "x1:in1"),
                w("w3", "a", "n1:in0"),
                w("w4", "b", "n1:in1"),
                w("w5", "x1", "s:in0"),
                w("w6", "n1", "c:in0"),
            ],
        },
    },
    {
        id: "full-adder",
        label: "Full adder",
        description: "Adds two bits plus a carry-in; chain these to add whole numbers.",
        circuit: {
            parts: [
                { id: "a", kind: "switch", label: "A", x: 0, y: 0 },
                { id: "b", kind: "switch", label: "B", x: 0, y: 120 },
                { id: "cin", kind: "switch", label: "Cin", x: 0, y: 260 },
                { id: "x1", kind: "xor", x: 200, y: 40 },
                { id: "x2", kind: "xor", x: 420, y: 100 },
                { id: "n1", kind: "and", x: 420, y: 240 },
                { id: "n2", kind: "and", x: 200, y: 340 },
                { id: "o1", kind: "or", x: 620, y: 290 },
                { id: "s", kind: "led", label: "Sum", x: 640, y: 110 },
                { id: "cout", kind: "led", label: "Cout", x: 820, y: 300 },
            ],
            wires: [
                w("w1", "a", "x1:in0"),
                w("w2", "b", "x1:in1"),
                w("w3", "x1", "x2:in0"),
                w("w4", "cin", "x2:in1"),
                w("w5", "x1", "n1:in0"),
                w("w6", "cin", "n1:in1"),
                w("w7", "a", "n2:in0"),
                w("w8", "b", "n2:in1"),
                w("w9", "n1", "o1:in0"),
                w("w10", "n2", "o1:in1"),
                w("w11", "x2", "s:in0"),
                w("w12", "o1", "cout:in0"),
            ],
        },
    },
    {
        id: "sr-latch",
        label: "SR latch (memory)",
        description: "Two cross-coupled NOR gates remember one bit: S sets Q, R resets it.",
        circuit: {
            parts: [
                { id: "s", kind: "switch", label: "S", x: 0, y: 0 },
                { id: "r", kind: "switch", label: "R", x: 0, y: 220 },
                { id: "g1", kind: "nor", x: 220, y: 0 },
                { id: "g2", kind: "nor", x: 220, y: 200 },
                { id: "q", kind: "led", label: "Q", x: 440, y: 210 },
                { id: "qn", kind: "led", label: "Q̄", x: 440, y: 10 },
            ],
            wires: [
                w("w1", "s", "g1:in0"),
                w("w2", "r", "g2:in1"),
                w("w3", "g1", "g2:in0"),
                w("w4", "g2", "g1:in1"),
                w("w5", "g2", "q:in0"),
                w("w6", "g1", "qn:in0"),
            ],
        },
    },
    {
        id: "blinker",
        label: "Clock and inverter",
        description: "A clock blinks one LED while a NOT gate lights the other on the opposite beat.",
        circuit: {
            parts: [
                { id: "clk", kind: "clock", label: "CLK", period: 1, x: 0, y: 80 },
                { id: "n1", kind: "not", x: 220, y: 160 },
                { id: "y1", kind: "led", label: "Y1", x: 420, y: 20 },
                { id: "y2", kind: "led", label: "Y2", x: 420, y: 170 },
            ],
            wires: [w("w1", "clk", "y1:in0"), w("w2", "clk", "n1:in0"), w("w3", "n1", "y2:in0")],
        },
    },
];
