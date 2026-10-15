import {
    AC_DEFAULT_FREQUENCY,
    AC_MAX_FREQUENCY,
    AC_MIN_FREQUENCY,
    LED_COLORS,
    PART_DEFS,
    type AnalogKind,
    type AnalogPart,
    type LedColor,
    type Rotation,
    type Terminal,
    type Wire,
} from "./parts";
import { DEFAULT_TIME_PER_DIV, TIME_PER_DIV_OPTIONS, VOLTS_PER_DIV_OPTIONS } from "./scope";

export interface PlacedPart extends AnalogPart {
    x: number;
    y: number;
    rotation: Rotation;
    /** Oscilloscope display settings (not part of the electrical model). */
    timePerDiv?: number;
    voltsPerDiv?: number;
}

export interface CircuitDocument {
    parts: PlacedPart[];
    wires: Wire[];
}

export const CIRCUIT_FILE_VERSION = 1;

// Accepts a parsed .json file (or a stored draft) and returns a clean
// document, or throws with a message that can be shown to the user.
export function parseCircuitDocument(input: unknown): CircuitDocument {
    if (!input || typeof input !== "object") throw new Error("The file doesn't contain a circuit.");
    const { parts, wires } = input as { parts?: unknown; wires?: unknown };
    if (!Array.isArray(parts) || !Array.isArray(wires)) throw new Error("The file doesn't contain a circuit (missing parts or wires).");

    const ids = new Set<string>();
    const cleanParts: PlacedPart[] = parts.map((raw, i) => {
        const part = raw as Partial<PlacedPart>;
        if (typeof part.id !== "string" || !part.id || ids.has(part.id)) throw new Error(`Part ${i + 1} has a missing or duplicate id.`);
        if (!part.kind || !(part.kind in PART_DEFS)) throw new Error(`Part "${part.id}" has an unknown type.`);
        ids.add(part.id);
        const def = PART_DEFS[part.kind as AnalogKind];
        const value = typeof part.value === "number" && Number.isFinite(part.value) ? part.value : def.defaultValue;
        const rotation = ([0, 90, 180, 270] as const).includes(part.rotation as Rotation) ? (part.rotation as Rotation) : 0;
        const clean: PlacedPart = {
            id: part.id,
            kind: part.kind as AnalogKind,
            value: Math.min(def.max ?? Infinity, Math.max(def.min ?? -Infinity, value)),
            x: Number.isFinite(part.x) ? Number(part.x) : 0,
            y: Number.isFinite(part.y) ? Number(part.y) : 0,
            rotation,
        };
        if (part.kind === "switch") clean.closed = Boolean(part.closed);
        if (part.kind === "ac") {
            const frequency = Number.isFinite(part.frequency) ? Number(part.frequency) : AC_DEFAULT_FREQUENCY;
            clean.frequency = Math.min(AC_MAX_FREQUENCY, Math.max(AC_MIN_FREQUENCY, frequency));
        }
        if (part.kind === "oscilloscope") {
            clean.timePerDiv = TIME_PER_DIV_OPTIONS.includes(Number(part.timePerDiv)) ? Number(part.timePerDiv) : DEFAULT_TIME_PER_DIV;
            if (VOLTS_PER_DIV_OPTIONS.includes(Number(part.voltsPerDiv))) clean.voltsPerDiv = Number(part.voltsPerDiv);
        }
        if (part.kind === "potentiometer") {
            const position = Number.isFinite(part.position) ? Number(part.position) : 0.5;
            clean.position = Math.min(1, Math.max(0, position));
        }
        if (part.kind === "led") clean.color = part.color && part.color in LED_COLORS ? (part.color as LedColor) : "red";
        return clean;
    });

    const terminalExists = (ref: unknown) => {
        if (typeof ref !== "string") return false;
        const [id, terminal] = ref.split(":");
        const part = cleanParts.find((p) => p.id === id);
        return Boolean(part && PART_DEFS[part.kind].terminals.includes(terminal as Terminal));
    };
    const cleanWires: Wire[] = wires
        .map((raw) => raw as Partial<Wire>)
        .filter((wire) => terminalExists(wire.from) && terminalExists(wire.to))
        .map((wire, i) => ({ id: typeof wire.id === "string" && wire.id ? wire.id : `w${i + 1}`, from: wire.from as string, to: wire.to as string }));

    return { parts: cleanParts, wires: cleanWires };
}

const part = (id: string, kind: AnalogKind, x: number, y: number, rotation: Rotation, extra: Partial<AnalogPart> = {}): PlacedPart => ({
    id,
    kind,
    value: PART_DEFS[kind].defaultValue,
    x,
    y,
    rotation,
    ...extra,
});
const wire = (id: string, from: string, to: string): Wire => ({ id, from, to });

export interface AnalogExample {
    id: string;
    label: string;
    description: string;
    circuit: CircuitDocument;
}

export const ANALOG_EXAMPLES: AnalogExample[] = [
    {
        id: "led",
        label: "LED with resistor",
        description: "A resistor limits the LED's current to about 21 mA.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 120, 90),
                part("r1", "resistor", 160, 0, 0, { value: 330 }),
                part("led1", "led", 320, 120, 90, { color: "red" }),
            ],
            wires: [wire("w1", "bat1:a", "r1:a"), wire("w2", "r1:b", "led1:a"), wire("w3", "led1:b", "bat1:b")],
        },
    },
    {
        id: "divider",
        label: "Voltage divider",
        description: "Two equal resistors split 9 V into 4.5 V, measured against ground.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 120, 90),
                part("r1", "resistor", 240, 40, 90, { value: 10_000 }),
                part("r2", "resistor", 240, 200, 90, { value: 10_000 }),
                part("gnd1", "ground", 0, 320, 0),
            ],
            wires: [
                wire("w1", "bat1:a", "r1:a"),
                wire("w2", "r1:b", "r2:a"),
                wire("w3", "r2:b", "bat1:b"),
                wire("w4", "bat1:b", "gnd1:a"),
            ],
        },
    },
    {
        id: "bulbs",
        label: "Parallel bulbs with a switch",
        description: "Flip the switch: both bulbs get the full battery voltage.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 120, 90),
                part("sw1", "switch", 160, 0, 0, { closed: true }),
                part("b1", "bulb", 320, 120, 90),
                part("b2", "bulb", 460, 120, 90),
            ],
            wires: [
                wire("w1", "bat1:a", "sw1:a"),
                wire("w2", "sw1:b", "b1:a"),
                wire("w3", "sw1:b", "b2:a"),
                wire("w4", "b1:b", "bat1:b"),
                wire("w5", "b2:b", "bat1:b"),
            ],
        },
    },
    {
        id: "rc",
        label: "Capacitor charging (RC)",
        description: "Close the switch and watch the capacitor charge over about 5 seconds (τ = RC = 1 s).",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 120, 90),
                part("sw1", "switch", 140, 0, 0, { closed: false }),
                part("r1", "resistor", 300, 0, 0, { value: 1000 }),
                part("c1", "capacitor", 460, 120, 90, { value: 1e-3 }),
            ],
            wires: [
                wire("w1", "bat1:a", "sw1:a"),
                wire("w2", "sw1:b", "r1:a"),
                wire("w3", "r1:b", "c1:a"),
                wire("w4", "c1:b", "bat1:b"),
            ],
        },
    },
    {
        id: "meters",
        label: "Measuring with meters",
        description: "An ammeter in series reads the current; a voltmeter across the lower resistor reads its voltage.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 140, 90),
                part("am1", "ammeter", 160, 0, 0),
                part("r1", "resistor", 340, 60, 90, { value: 1000 }),
                part("r2", "resistor", 340, 220, 90, { value: 2000 }),
                part("vm1", "voltmeter", 500, 220, 90),
            ],
            wires: [
                wire("w1", "bat1:a", "am1:a"),
                wire("w2", "am1:b", "r1:a"),
                wire("w3", "r1:b", "r2:a"),
                wire("w4", "r2:b", "bat1:b"),
                wire("w5", "r2:a", "vm1:a"),
                wire("w6", "r2:b", "vm1:b"),
            ],
        },
    },
    {
        id: "zener",
        label: "Zener voltage regulator",
        description: "The Zener holds about 5.1 V across the load even when you change the battery voltage.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 140, 90, { value: 12 }),
                part("r1", "resistor", 160, 0, 0, { value: 470 }),
                part("dz1", "zener", 340, 140, 270, { value: 5.1 }),
                part("r2", "resistor", 480, 140, 90, { value: 2200 }),
                part("vm1", "voltmeter", 620, 140, 90),
            ],
            wires: [
                wire("w1", "bat1:a", "r1:a"),
                wire("w2", "r1:b", "dz1:b"),
                wire("w3", "dz1:a", "bat1:b"),
                wire("w4", "r1:b", "r2:a"),
                wire("w5", "r2:b", "bat1:b"),
                wire("w6", "r2:a", "vm1:a"),
                wire("w7", "r2:b", "vm1:b"),
            ],
        },
    },
    {
        id: "dimmer",
        label: "Potentiometer dimmer",
        description: "Turn the potentiometer with its + and − buttons to dim the bulb.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 140, 90),
                part("rv1", "potentiometer", 160, 0, 0, { value: 200, position: 0.2 }),
                part("lamp1", "bulb", 340, 140, 90, { value: 50 }),
            ],
            wires: [wire("w1", "bat1:a", "rv1:a"), wire("w2", "rv1:w", "lamp1:a"), wire("w3", "lamp1:b", "bat1:b")],
        },
    },
    {
        id: "fuse",
        label: "Fuse protection",
        description: "Hold the button to short the bulb: the 0.5 A fuse blows and cuts the circuit. Stop and Run to replace it.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 140, 90),
                part("fu1", "fuse", 160, 0, 0, { value: 0.5 }),
                part("lamp1", "bulb", 340, 140, 90),
                part("btn1", "button", 480, 140, 90),
            ],
            wires: [
                wire("w1", "bat1:a", "fu1:a"),
                wire("w2", "fu1:b", "lamp1:a"),
                wire("w3", "lamp1:b", "bat1:b"),
                wire("w4", "fu1:b", "btn1:a"),
                wire("w5", "btn1:b", "bat1:b"),
            ],
        },
    },
    {
        id: "motor",
        label: "Motor and buzzer",
        description: "A switch runs a DC motor and a buzzer in parallel; the motor spins faster with more current.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 140, 90, { value: 6 }),
                part("sw1", "switch", 160, 0, 0, { closed: true }),
                part("m1", "motor", 340, 140, 90),
                part("bz1", "buzzer", 480, 140, 90),
            ],
            wires: [
                wire("w1", "bat1:a", "sw1:a"),
                wire("w2", "sw1:b", "m1:a"),
                wire("w3", "sw1:b", "bz1:a"),
                wire("w4", "m1:b", "bat1:b"),
                wire("w5", "bz1:b", "bat1:b"),
            ],
        },
    },
    {
        id: "ac-lamp",
        label: "AC lamp",
        description: "A 1 Hz AC source: the current reverses every half second and the lamp flickers with the power.",
        circuit: {
            parts: [part("ac1", "ac", 0, 140, 90, { value: 9, frequency: 1 }), part("lamp1", "bulb", 220, 140, 90)],
            wires: [wire("w1", "ac1:a", "lamp1:a"), wire("w2", "lamp1:b", "ac1:b")],
        },
    },
    {
        id: "rectifier",
        label: "Half-wave rectifier (scope)",
        description: "A diode passes only the positive half of the AC input; the scope shows input (A) and output (B).",
        circuit: {
            parts: [
                part("ac1", "ac", 0, 160, 90, { value: 10, frequency: 2 }),
                part("d1", "diode", 160, 20, 0),
                part("r1", "resistor", 340, 160, 90, { value: 1000 }),
                part("gnd1", "ground", 0, 340, 0),
                { ...part("osc1", "oscilloscope", 520, 80, 0), timePerDiv: 0.1 },
            ],
            wires: [
                wire("w1", "ac1:a", "d1:a"),
                wire("w2", "d1:b", "r1:a"),
                wire("w3", "r1:b", "ac1:b"),
                wire("w4", "ac1:b", "gnd1:a"),
                wire("w5", "ac1:a", "osc1:a"),
                wire("w6", "r1:a", "osc1:b"),
            ],
        },
    },
    {
        id: "rc-filter",
        label: "RC low-pass filter (scope)",
        description: "The capacitor smooths a 5 Hz input: the output (B) is smaller and lags the input (A).",
        circuit: {
            parts: [
                part("ac1", "ac", 0, 160, 90, { value: 5, frequency: 5 }),
                part("r1", "resistor", 160, 20, 0, { value: 1000 }),
                part("c1", "capacitor", 340, 160, 90, { value: 100e-6 }),
                part("gnd1", "ground", 0, 340, 0),
                { ...part("osc1", "oscilloscope", 520, 80, 0), timePerDiv: 0.05 },
            ],
            wires: [
                wire("w1", "ac1:a", "r1:a"),
                wire("w2", "r1:b", "c1:a"),
                wire("w3", "c1:b", "ac1:b"),
                wire("w4", "ac1:b", "gnd1:a"),
                wire("w5", "ac1:a", "osc1:a"),
                wire("w6", "c1:a", "osc1:b"),
            ],
        },
    },
    {
        id: "rl",
        label: "Inductor with flyback diode",
        description: "Close the switch: current through the 1 H inductor builds up over about half a second. Open it: the diode carries the inductor's current as it dies away.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 140, 90),
                part("sw1", "switch", 140, 0, 0, { closed: false }),
                part("r1", "resistor", 300, 0, 0, { value: 10 }),
                part("l1", "inductor", 460, 140, 90, { value: 1 }),
                part("d1", "diode", 600, 140, 270),
                part("am1", "ammeter", 300, 280, 180),
            ],
            wires: [
                wire("w1", "bat1:a", "sw1:a"),
                wire("w2", "sw1:b", "r1:a"),
                wire("w3", "r1:b", "l1:a"),
                wire("w4", "l1:b", "am1:a"),
                wire("w5", "am1:b", "bat1:b"),
                wire("w6", "l1:b", "d1:a"),
                wire("w7", "d1:b", "l1:a"),
            ],
        },
    },
    {
        id: "series",
        label: "Bulbs in series",
        description: "The same current flows through both bulbs, so each gets half the voltage and glows dimmer.",
        circuit: {
            parts: [
                part("bat1", "battery", 0, 120, 90),
                part("b1", "bulb", 160, 0, 0),
                part("b2", "bulb", 320, 120, 90),
            ],
            wires: [wire("w1", "bat1:a", "b1:a"), wire("w2", "b1:b", "b2:a"), wire("w3", "b2:b", "bat1:b")],
        },
    },
];
