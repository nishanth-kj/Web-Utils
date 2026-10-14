// SI-prefixed formatting and parsing for circuit values ("4.7 kΩ", "100µ").

const PREFIXES: [number, string][] = [
    [1e9, "G"],
    [1e6, "M"],
    [1e3, "k"],
    [1, ""],
    [1e-3, "m"],
    [1e-6, "µ"],
    [1e-9, "n"],
    [1e-12, "p"],
];

export function formatSI(value: number, unit: string, digits = 3): string {
    if (!Number.isFinite(value)) return `— ${unit}`;
    const magnitude = Math.abs(value);
    if (magnitude < 1e-12) return `0 ${unit}`;
    const [scale, prefix] = PREFIXES.find(([s]) => magnitude >= s * 0.9995) ?? PREFIXES[PREFIXES.length - 1];
    const scaled = value / scale;
    return `${Number(scaled.toPrecision(digits))} ${prefix}${unit}`;
}

const SUFFIX_SCALE: Record<string, number> = {
    G: 1e9,
    M: 1e6,
    k: 1e3,
    K: 1e3,
    m: 1e-3,
    u: 1e-6,
    µ: 1e-6,
    μ: 1e-6,
    n: 1e-9,
    p: 1e-12,
};

// Accepts "4700", "4.7k", "4k7", "100u", "100µF", "2.2 mΩ". Returns null if unreadable.
export function parseSI(input: string): number | null {
    const text = input.trim().replace(/\s+/g, "").replace(/(Ω|ohms?|V|A|F|W)$/i, "");
    // "4k7" style: the prefix stands in for the decimal point.
    const infix = /^(\d+)([GMkKmuµμnp])(\d+)$/.exec(text);
    if (infix) return Number(`${infix[1]}.${infix[3]}`) * SUFFIX_SCALE[infix[2]];
    const match = /^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)([GMkKmuµμnp]?)$/i.exec(text);
    if (!match) return null;
    const scale = match[2] ? SUFFIX_SCALE[match[2]] : 1;
    const value = Number(match[1]) * scale;
    return Number.isFinite(value) ? value : null;
}
