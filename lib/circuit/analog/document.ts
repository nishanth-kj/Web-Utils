import { LED_COLORS, PART_DEFS, type AnalogKind, type AnalogPart, type LedColor, type Rotation, type Wire } from "./parts";

export interface PlacedPart extends AnalogPart {
    x: number;
    y: number;
    rotation: Rotation;
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
        if (part.kind === "led") clean.color = part.color && part.color in LED_COLORS ? (part.color as LedColor) : "red";
        return clean;
    });

    const terminalExists = (ref: unknown) => {
        if (typeof ref !== "string") return false;
        const [id, terminal] = ref.split(":");
        const part = cleanParts.find((p) => p.id === id);
        return Boolean(part && PART_DEFS[part.kind].terminals.includes(terminal as "a" | "b"));
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
