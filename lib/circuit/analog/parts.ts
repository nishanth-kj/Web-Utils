// Part catalogue for the analog circuit simulator. Every part has terminals
// "a" and "b" (battery: a = +, b = −; LED: a = anode, b = cathode) except
// ground, which has a single terminal "a".

export type AnalogKind = "battery" | "resistor" | "bulb" | "led" | "switch" | "capacitor" | "ground";
export type LedColor = "red" | "yellow" | "green" | "blue" | "white";
export type Rotation = 0 | 90 | 180 | 270;

export interface AnalogPart {
    id: string;
    kind: AnalogKind;
    /** Volts for a battery, ohms for a resistor or bulb, farads for a capacitor. */
    value: number;
    closed?: boolean;
    color?: LedColor;
}

export interface Wire {
    id: string;
    /** Terminal references, "<partId>:<a|b>". */
    from: string;
    to: string;
}

interface PartDefinition {
    label: string;
    unit?: string;
    defaultValue: number;
    min?: number;
    max?: number;
    terminals: ("a" | "b")[];
}

export const PART_DEFS: Record<AnalogKind, PartDefinition> = {
    battery: { label: "Battery", unit: "V", defaultValue: 9, min: 0, max: 1000, terminals: ["a", "b"] },
    resistor: { label: "Resistor", unit: "Ω", defaultValue: 1000, min: 0.001, max: 1e9, terminals: ["a", "b"] },
    bulb: { label: "Light bulb", unit: "Ω", defaultValue: 100, min: 0.1, max: 1e6, terminals: ["a", "b"] },
    led: { label: "LED", defaultValue: 0, terminals: ["a", "b"] },
    switch: { label: "Switch", defaultValue: 0, terminals: ["a", "b"] },
    capacitor: { label: "Capacitor", unit: "F", defaultValue: 100e-6, min: 1e-12, max: 10, terminals: ["a", "b"] },
    ground: { label: "Ground", defaultValue: 0, terminals: ["a"] },
};

export const PALETTE: AnalogKind[] = ["battery", "resistor", "bulb", "led", "switch", "capacitor", "ground"];

// Forward voltage and display colour per LED colour; a 10 Ω on-resistance and
// 30 mA rating are typical for 5 mm indicator LEDs.
export const LED_COLORS: Record<LedColor, { forwardVoltage: number; glow: string }> = {
    red: { forwardVoltage: 1.8, glow: "#ef4444" },
    yellow: { forwardVoltage: 2.0, glow: "#eab308" },
    green: { forwardVoltage: 2.1, glow: "#22c55e" },
    blue: { forwardVoltage: 3.0, glow: "#3b82f6" },
    white: { forwardVoltage: 3.0, glow: "#e5e7eb" },
};
export const LED_ON_RESISTANCE = 10;
export const LED_MAX_CURRENT = 0.03;

/** Power at which a bulb is drawn at full brightness. */
export const BULB_RATED_POWER = 1;
