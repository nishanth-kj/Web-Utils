// Digital logic simulation: inputs (switches, push buttons, clocks) drive
// gates and edge-triggered flip-flops, which drive LEDs, logic probes and
// 7-segment displays. Signals are booleans; an unconnected input reads as 0.

export type GateKind = "and" | "or" | "not" | "buffer" | "nand" | "nor" | "xor" | "xnor";
export type FlipFlopKind = "dff" | "jkff" | "tff";
export type LogicKind = "switch" | "button" | "clock" | "led" | "probe" | "seg7" | GateKind | FlipFlopKind;

export type InputHandle = "in0" | "in1" | "in2" | "in3";
export type OutputHandle = "out" | "outn";

export const GATE_KINDS: GateKind[] = ["and", "or", "not", "buffer", "nand", "nor", "xor", "xnor"];
export const FLIP_FLOP_KINDS: FlipFlopKind[] = ["dff", "jkff", "tff"];

export interface LogicPart {
    id: string;
    kind: LogicKind;
    /** Switch position, or whether a push button is held. */
    on?: boolean;
    /** Clock: full period in seconds. */
    period?: number;
    /** Name shown for inputs and outputs, and used in the truth table and timing diagram. */
    label?: string;
}

export interface LogicWire {
    id: string;
    /** "<partId>:out" or, for a flip-flop's Q̄, "<partId>:outn" */
    from: string;
    /** "<partId>:in0" … "<partId>:in3" */
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

interface Pin<Id> {
    id: Id;
    label: string;
    /** Edge-triggered clock input (drawn with a ▷ marker). */
    clock?: boolean;
}

const OUT: Pin<OutputHandle>[] = [{ id: "out", label: "" }];
const ONE_INPUT: Pin<InputHandle>[] = [{ id: "in0", label: "" }];
const TWO_INPUTS: Pin<InputHandle>[] = [
    { id: "in0", label: "" },
    { id: "in1", label: "" },
];
const Q_OUTPUTS: Pin<OutputHandle>[] = [
    { id: "out", label: "Q" },
    { id: "outn", label: "Q̄" },
];

/** Input and output pins of each kind of part, top to bottom. */
export const PINS: Record<LogicKind, { inputs: Pin<InputHandle>[]; outputs: Pin<OutputHandle>[] }> = {
    switch: { inputs: [], outputs: OUT },
    button: { inputs: [], outputs: OUT },
    clock: { inputs: [], outputs: OUT },
    led: { inputs: ONE_INPUT, outputs: [] },
    probe: { inputs: ONE_INPUT, outputs: [] },
    seg7: {
        inputs: [
            { id: "in0", label: "1" },
            { id: "in1", label: "2" },
            { id: "in2", label: "4" },
            { id: "in3", label: "8" },
        ],
        outputs: [],
    },
    not: { inputs: ONE_INPUT, outputs: OUT },
    buffer: { inputs: ONE_INPUT, outputs: OUT },
    and: { inputs: TWO_INPUTS, outputs: OUT },
    or: { inputs: TWO_INPUTS, outputs: OUT },
    nand: { inputs: TWO_INPUTS, outputs: OUT },
    nor: { inputs: TWO_INPUTS, outputs: OUT },
    xor: { inputs: TWO_INPUTS, outputs: OUT },
    xnor: { inputs: TWO_INPUTS, outputs: OUT },
    dff: {
        inputs: [
            { id: "in0", label: "D" },
            { id: "in1", label: "CLK", clock: true },
        ],
        outputs: Q_OUTPUTS,
    },
    jkff: {
        inputs: [
            { id: "in0", label: "J" },
            { id: "in1", label: "CLK", clock: true },
            { id: "in2", label: "K" },
        ],
        outputs: Q_OUTPUTS,
    },
    tff: {
        inputs: [
            { id: "in0", label: "T" },
            { id: "in1", label: "CLK", clock: true },
        ],
        outputs: Q_OUTPUTS,
    },
};

const GATE_FUNCS: Record<GateKind, (a: boolean, b: boolean) => boolean> = {
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    not: (a) => !a,
    buffer: (a) => a,
    nand: (a, b) => !(a && b),
    nor: (a, b) => !(a || b),
    xor: (a, b) => a !== b,
    xnor: (a, b) => a === b,
};

export const isGate = (kind: LogicKind): kind is GateKind => (GATE_KINDS as string[]).includes(kind);
export const isFlipFlop = (kind: LogicKind): kind is FlipFlopKind => (FLIP_FLOP_KINDS as string[]).includes(kind);
export const isInput = (kind: LogicKind) => kind === "switch" || kind === "button" || kind === "clock";
/** Parts the truth table and timing diagram read as outputs. */
export const isIndicator = (kind: LogicKind) => kind === "led" || kind === "probe";

export const inputsOf = (kind: LogicKind): InputHandle[] => PINS[kind].inputs.map((pin) => pin.id);
export const outputsOf = (kind: LogicKind): OutputHandle[] => PINS[kind].outputs.map((pin) => pin.id);
export const hasOutput = (kind: LogicKind) => outputsOf(kind).length > 0;

export interface FlipFlopMemory {
    q: boolean;
    /** Clock input level at the last update, to detect rising edges. */
    clock: boolean;
}

export interface LogicResult {
    /** Value of every output pin, keyed "<partId>:out" / "<partId>:outn". */
    outputs: Record<string, boolean>;
    /** Value at each LED's and logic probe's input. */
    leds: Record<string, boolean>;
    /** Number shown on each 7-segment display (0–15, shown in hex). */
    displays: Record<string, number>;
    /** Value carried by each wire. */
    wires: Record<string, boolean>;
    /** Flip-flop state carried into the next update. */
    memory: Record<string, FlipFlopMemory>;
    /** False when feedback never settles (e.g. a NOT gate feeding itself). */
    stable: boolean;
}

export const POWERED_OFF: LogicResult = { outputs: {}, leds: {}, displays: {}, wires: {}, memory: {}, stable: true };

const MAX_PASSES = 64;
const MAX_FLIP_FLOP_ROUNDS = 16;

/**
 * Settles the circuit starting from the previous result, so latches and
 * flip-flops keep their state. `clockValues` gives each clock's current level.
 */
export function simulateLogic(
    parts: LogicPart[],
    wires: LogicWire[],
    clockValues: Record<string, boolean> = {},
    previous: Pick<LogicResult, "outputs" | "memory"> = POWERED_OFF
): LogicResult {
    const driver = new Map<string, string>();
    for (const wire of wires) driver.set(wire.to, wire.from);

    const memory: Record<string, FlipFlopMemory> = { ...previous.memory };
    const outputs: Record<string, boolean> = {};
    for (const part of parts) {
        const out = `${part.id}:out`;
        if (part.kind === "switch" || part.kind === "button") outputs[out] = Boolean(part.on);
        else if (part.kind === "clock") outputs[out] = Boolean(clockValues[part.id]);
        else if (isGate(part.kind)) outputs[out] = Boolean(previous.outputs[out]);
        else if (isFlipFlop(part.kind)) {
            const q = Boolean(memory[part.id]?.q);
            outputs[out] = q;
            outputs[`${part.id}:outn`] = !q;
        }
    }
    const input = (id: string, handle: InputHandle) => {
        const source = driver.get(`${id}:${handle}`);
        return source ? Boolean(outputs[source]) : false;
    };

    const gates = parts.filter((part) => isGate(part.kind));
    const settle = () => {
        for (let pass = 0; pass < MAX_PASSES; pass++) {
            let changed = false;
            for (const gate of gates) {
                const value = GATE_FUNCS[gate.kind as GateKind](input(gate.id, "in0"), input(gate.id, "in1"));
                if (value !== outputs[`${gate.id}:out`]) {
                    outputs[`${gate.id}:out`] = value;
                    changed = true;
                }
            }
            if (!changed) return true;
        }
        return false;
    };

    // Flip-flops sample their inputs on a rising clock edge; their new
    // outputs can clock further flip-flops (ripple counters), so repeat until
    // nothing changes.
    let stable = settle();
    const flipFlops = parts.filter((part) => isFlipFlop(part.kind));
    for (let round = 0; round < MAX_FLIP_FLOP_ROUNDS; round++) {
        let changed = false;
        for (const ff of flipFlops) {
            const clock = input(ff.id, "in1");
            const before = memory[ff.id];
            // A flip-flop seen for the first time (power-up, or just added)
            // takes its clock level as-is: an input that is already high
            // isn't a rising edge.
            if (!before) {
                memory[ff.id] = { q: false, clock };
                continue;
            }
            let q = before.q;
            if (clock && !before.clock) {
                if (ff.kind === "dff") q = input(ff.id, "in0");
                else if (ff.kind === "tff") q = input(ff.id, "in0") ? !q : q;
                else {
                    const j = input(ff.id, "in0");
                    const k = input(ff.id, "in2");
                    q = j && k ? !q : j ? true : k ? false : q;
                }
            }
            memory[ff.id] = { q, clock };
            if (q !== outputs[`${ff.id}:out`]) {
                outputs[`${ff.id}:out`] = q;
                outputs[`${ff.id}:outn`] = !q;
                changed = true;
            }
        }
        if (!changed) break;
        stable = settle();
    }

    const leds: Record<string, boolean> = {};
    const displays: Record<string, number> = {};
    for (const part of parts) {
        if (isIndicator(part.kind)) leds[part.id] = input(part.id, "in0");
        if (part.kind === "seg7") {
            displays[part.id] = inputsOf("seg7").reduce((sum, handle, bit) => sum + (input(part.id, handle) ? 1 << bit : 0), 0);
        }
    }
    const wireValues: Record<string, boolean> = {};
    for (const wire of wires) wireValues[wire.id] = Boolean(outputs[wire.from]);

    return { outputs, leds, displays, wires: wireValues, memory, stable };
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
 * Truth table over the switches and push buttons (inputs) and LEDs and logic
 * probes (outputs), or the reason one can't be made for this circuit.
 */
export function truthTable(parts: LogicPart[], wires: LogicWire[]): TruthTable | { reason: string } {
    const inputs = parts.filter((part) => part.kind === "switch" || part.kind === "button");
    const indicators = parts.filter((part) => isIndicator(part.kind));
    if (parts.some((part) => part.kind === "clock")) return { reason: "Truth tables aren't shown for circuits with a clock." };
    if (parts.some((part) => isFlipFlop(part.kind))) {
        return { reason: "Flip-flops remember earlier inputs, so outputs depend on history. Use the timing diagram instead." };
    }
    if (inputs.length === 0 || indicators.length === 0) return { reason: "Add at least one switch and one LED to see a truth table." };
    if (inputs.length > MAX_TRUTH_TABLE_INPUTS) return { reason: `Truth tables are shown for up to ${MAX_TRUTH_TABLE_INPUTS} switches.` };
    if (hasFeedback(parts, wires)) return { reason: "This circuit has feedback (like a latch), so its outputs depend on its history, not just its inputs." };

    const name = (part: LogicPart) => part.label || part.id;
    const rows = Array.from({ length: 2 ** inputs.length }, (_, row) => {
        const values = inputs.map((_, i) => Boolean((row >> (inputs.length - 1 - i)) & 1));
        const set = parts.map((part) => (inputs.includes(part) ? { ...part, on: values[inputs.indexOf(part)] } : part));
        const result = simulateLogic(set, wires);
        return { inputs: values, outputs: indicators.map((indicator) => result.leds[indicator.id]) };
    });
    return { inputs: inputs.map(name), outputs: indicators.map(name), rows };
}

const LOGIC_KINDS = Object.keys(PINS) as LogicKind[];
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
        if (part.kind === "button") clean.on = false;
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
        if (!fromKind || !toKind || !outputsOf(fromKind).includes(fromHandle as OutputHandle)) return;
        if (!inputsOf(toKind).includes(toHandle as InputHandle) || used.has(wire.to)) return;
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

// Wire from a flip-flop's Q̄ output.
const wn = (id: string, from: string, to: string): LogicWire => ({ id, from: `${from}:outn`, to });

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
        id: "d-flip-flop",
        label: "D flip-flop",
        description: "Set D, then press CLK: Q copies D on the rising edge and holds it until the next press.",
        circuit: {
            parts: [
                { id: "d", kind: "switch", label: "D", x: 0, y: 40 },
                { id: "clk", kind: "button", label: "CLK", x: 0, y: 180 },
                { id: "ff1", kind: "dff", label: "FF1", x: 200, y: 80 },
                { id: "q", kind: "led", label: "Q", x: 420, y: 70 },
                { id: "qn", kind: "led", label: "Q̄", x: 420, y: 170 },
            ],
            wires: [w("w1", "d", "ff1:in0"), w("w2", "clk", "ff1:in1"), w("w3", "ff1", "q:in0"), wn("w4", "ff1", "qn:in0")],
        },
    },
    {
        id: "counter",
        label: "4-bit counter (7-segment)",
        description: "A clock ripples through four T flip-flops; the display counts 0 to F. Turn EN off to hold the count.",
        circuit: {
            parts: [
                { id: "en", kind: "switch", label: "EN", on: true, x: 0, y: 40 },
                { id: "clk", kind: "clock", label: "CLK", period: 0.5, x: 0, y: 240 },
                { id: "ff1", kind: "tff", label: "FF1", x: 200, y: 120 },
                { id: "ff2", kind: "tff", label: "FF2", x: 380, y: 120 },
                { id: "ff3", kind: "tff", label: "FF3", x: 560, y: 120 },
                { id: "ff4", kind: "tff", label: "FF4", x: 740, y: 120 },
                { id: "disp", kind: "seg7", label: "COUNT", x: 960, y: 100 },
            ],
            wires: [
                w("w1", "en", "ff1:in0"),
                w("w2", "en", "ff2:in0"),
                w("w3", "en", "ff3:in0"),
                w("w4", "en", "ff4:in0"),
                w("w5", "clk", "ff1:in1"),
                wn("w6", "ff1", "ff2:in1"),
                wn("w7", "ff2", "ff3:in1"),
                wn("w8", "ff3", "ff4:in1"),
                w("w9", "ff1", "disp:in0"),
                w("w10", "ff2", "disp:in1"),
                w("w11", "ff3", "disp:in2"),
                w("w12", "ff4", "disp:in3"),
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
