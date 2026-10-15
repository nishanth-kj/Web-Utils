// Part catalogue for the analog circuit simulator. Two-terminal parts use
// "a" and "b" (battery: a = +, b = −; diodes and LEDs: a = anode,
// b = cathode). The potentiometer adds its wiper "w"; ground has only "a".

export type AnalogKind =
    | "battery"
    | "ac"
    | "resistor"
    | "potentiometer"
    | "bulb"
    | "led"
    | "diode"
    | "zener"
    | "npn"
    | "pnp"
    | "switch"
    | "button"
    | "fuse"
    | "motor"
    | "buzzer"
    | "capacitor"
    | "inductor"
    | "voltmeter"
    | "ammeter"
    | "oscilloscope"
    | "ground";
// Transistors use "b" (base), "c" (collector) and "e" (emitter).
export type Terminal = "a" | "b" | "w" | "c" | "e";
export type LedColor = "red" | "yellow" | "green" | "blue" | "white";
export type Rotation = 0 | 90 | 180 | 270;

export interface AnalogPart {
    id: string;
    kind: AnalogKind;
    /**
     * Volts for a battery or Zener (breakdown), ohms for resistors, the
     * potentiometer, bulb, motor and buzzer, farads for a capacitor, henries for
     * an inductor, amps for a fuse (its rating), peak volts for an AC source.
     */
    value: number;
    /** Switch position, or whether a push button is being held. */
    closed?: boolean;
    color?: LedColor;
    /** Potentiometer wiper position, 0 (at a) to 1 (at b). */
    position?: number;
    /** AC source frequency in hertz. */
    frequency?: number;
}

export interface Wire {
    id: string;
    /** Terminal references, "<partId>:<a|b|w>". */
    from: string;
    to: string;
}

interface PartDefinition {
    label: string;
    unit?: string;
    defaultValue: number;
    min?: number;
    max?: number;
    terminals: Terminal[];
    /** Prefix for reference designators such as R1 or D2. */
    prefix: string;
}

export const PART_DEFS: Record<AnalogKind, PartDefinition> = {
    battery: { label: "Battery", unit: "V", defaultValue: 9, min: 0, max: 1000, terminals: ["a", "b"], prefix: "bat" },
    ac: { label: "AC source", unit: "V", defaultValue: 5, min: 0, max: 1000, terminals: ["a", "b"], prefix: "ac" },
    resistor: { label: "Resistor", unit: "Ω", defaultValue: 1000, min: 0.001, max: 1e9, terminals: ["a", "b"], prefix: "r" },
    potentiometer: { label: "Potentiometer", unit: "Ω", defaultValue: 10_000, min: 1, max: 1e8, terminals: ["a", "b", "w"], prefix: "rv" },
    bulb: { label: "Light bulb", unit: "Ω", defaultValue: 100, min: 0.1, max: 1e6, terminals: ["a", "b"], prefix: "lamp" },
    led: { label: "LED", defaultValue: 0, terminals: ["a", "b"], prefix: "led" },
    diode: { label: "Diode", defaultValue: 0, terminals: ["a", "b"], prefix: "d" },
    zener: { label: "Zener diode", unit: "V", defaultValue: 5.1, min: 1, max: 200, terminals: ["a", "b"], prefix: "dz" },
    // value = current gain (hFE / β).
    npn: { label: "NPN transistor", defaultValue: 100, min: 1, max: 2000, terminals: ["b", "c", "e"], prefix: "q" },
    pnp: { label: "PNP transistor", defaultValue: 100, min: 1, max: 2000, terminals: ["b", "c", "e"], prefix: "q" },
    switch: { label: "Switch", defaultValue: 0, terminals: ["a", "b"], prefix: "sw" },
    button: { label: "Push button", defaultValue: 0, terminals: ["a", "b"], prefix: "btn" },
    fuse: { label: "Fuse", unit: "A", defaultValue: 0.5, min: 0.001, max: 100, terminals: ["a", "b"], prefix: "fu" },
    motor: { label: "DC motor", unit: "Ω", defaultValue: 10, min: 0.1, max: 1e5, terminals: ["a", "b"], prefix: "m" },
    buzzer: { label: "Buzzer", unit: "Ω", defaultValue: 100, min: 1, max: 1e6, terminals: ["a", "b"], prefix: "bz" },
    capacitor: { label: "Capacitor", unit: "F", defaultValue: 100e-6, min: 1e-12, max: 10, terminals: ["a", "b"], prefix: "c" },
    inductor: { label: "Inductor", unit: "H", defaultValue: 0.1, min: 1e-9, max: 100, terminals: ["a", "b"], prefix: "l" },
    voltmeter: { label: "DC voltmeter", defaultValue: 0, terminals: ["a", "b"], prefix: "vm" },
    ammeter: { label: "DC ammeter", defaultValue: 0, terminals: ["a", "b"], prefix: "am" },
    // Channel A on terminal a, channel B on terminal b, each measured against ground.
    oscilloscope: { label: "Oscilloscope", defaultValue: 0, terminals: ["a", "b"], prefix: "osc" },
    ground: { label: "Ground", defaultValue: 0, terminals: ["a"], prefix: "gnd" },
};

export const PALETTE_GROUPS: { label: string; kinds: AnalogKind[] }[] = [
    { label: "Sources", kinds: ["battery", "ac", "ground"] },
    { label: "Passive", kinds: ["resistor", "potentiometer", "capacitor", "inductor"] },
    { label: "Semiconductors", kinds: ["diode", "zener", "led", "npn", "pnp"] },
    { label: "Switches & protection", kinds: ["switch", "button", "fuse"] },
    { label: "Outputs", kinds: ["bulb", "motor", "buzzer"] },
    { label: "Instruments", kinds: ["voltmeter", "ammeter", "oscilloscope"] },
];

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

/** Generic small-signal silicon diode (1N4148-like). */
export const DIODE_FORWARD_VOLTAGE = 0.7;
export const DIODE_ON_RESISTANCE = 0.5;
export const ZENER_RESISTANCE = 1;

/** Piecewise-linear bipolar transistor: base-emitter junction and saturation. */
export const BJT_VBE = 0.7;
export const BJT_RBE = 100;
export const BJT_VCE_SAT = 0.2;
export const BJT_RCE_SAT = 1;

export const FUSE_RESISTANCE = 0.05;
export const VOLTMETER_RESISTANCE = 10e6;

export const AC_DEFAULT_FREQUENCY = 1;
export const AC_MIN_FREQUENCY = 0.01;
export const AC_MAX_FREQUENCY = 1000;

/** Kinds whose behaviour depends on time, so the circuit must be stepped. */
export const TIME_DEPENDENT: AnalogKind[] = ["capacitor", "inductor", "ac", "fuse", "oscilloscope"];

/** Power at which a bulb is drawn at full brightness. */
export const BULB_RATED_POWER = 1;
/** Current at which the motor reaches full display speed, and the buzzer sounds. */
export const MOTOR_FULL_CURRENT = 0.5;
export const BUZZER_MIN_CURRENT = 0.005;
