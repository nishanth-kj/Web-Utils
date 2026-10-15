import React from "react";
import { LED_COLORS, type AnalogKind, type LedColor } from "@/lib/circuit/analog/parts";

interface PartSymbolProps {
    kind: AnalogKind;
    size?: number;
    /** 0-1: bulb or LED brightness. */
    glow?: number;
    closed?: boolean;
    color?: LedColor;
    blown?: boolean;
    /** 0-1: motor speed. */
    spin?: number;
    sounding?: boolean;
    /** Draw letters inside symbols (motor "M"); the canvas draws them upright itself. */
    letters?: boolean;
}

// Schematic symbols drawn left-to-right in an 80×80 box: terminal "a" at
// (0, 40), terminal "b" at (80, 40), a potentiometer's wiper "w" at (40, 80).
// Ground's single terminal is at (40, 0). Transistors: base (0, 40),
// collector (40, 0), emitter (40, 80).
export function PartSymbol({ kind, size = 80, glow = 0, closed, color = "red", blown, spin = 0, sounding, letters = true }: PartSymbolProps) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 80 80",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        "aria-hidden": true,
    };

    switch (kind) {
        case "battery":
            return (
                <svg {...common}>
                    <path d="M0 40H34M46 40H80" />
                    <path d="M34 22V58" />
                    <path d="M46 31V49" strokeWidth={6} />
                    {/* Only "+": a drawn minus reads as "|" once the part is rotated; the long plate marks + anyway. */}
                    <path d="M20 22H28M24 18V26" strokeWidth={2} />
                </svg>
            );
        case "ac":
            return (
                <svg {...common}>
                    <path d="M0 40H20M60 40H80" />
                    <circle cx="40" cy="40" r="20" />
                    <path d="M28 40Q34 26 40 40T52 40" strokeWidth={2} />
                    <path d="M14 30H22M18 26V34" strokeWidth={2} />
                </svg>
            );
        case "inductor":
            return (
                <svg {...common}>
                    <path d="M0 40H16A6 6 0 0 1 28 40A6 6 0 0 1 40 40A6 6 0 0 1 52 40A6 6 0 0 1 64 40H80" />
                </svg>
            );
        case "oscilloscope":
            return (
                <svg {...common}>
                    <rect x="8" y="16" width="64" height="48" rx="4" />
                    <path d="M14 46Q22 22 30 40T46 40T62 34" strokeWidth={2} />
                </svg>
            );
        case "resistor":
            return (
                <svg {...common}>
                    <path d="M0 40H16L20 30L28 50L36 30L44 50L52 30L60 50L64 40H80" />
                </svg>
            );
        case "potentiometer":
            return (
                <svg {...common}>
                    <path d="M0 40H16L20 30L28 50L36 30L44 50L52 30L60 50L64 40H80" />
                    <path d="M40 80V56" />
                    <path d="M34 60L40 52L46 60" fill="currentColor" />
                </svg>
            );
        case "bulb":
            return (
                <svg {...common}>
                    {glow > 0.02 && <circle cx="40" cy="40" r="26" fill="#facc15" stroke="none" opacity={0.25 * glow} />}
                    <circle cx="40" cy="40" r="18" fill="#facc15" fillOpacity={0.85 * glow} />
                    <path d="M0 40H22M58 40H80" />
                    <path d="M27 27L53 53M53 27L27 53" strokeWidth={2} />
                </svg>
            );
        case "led": {
            const tint = LED_COLORS[color].glow;
            return (
                <svg {...common}>
                    {glow > 0.02 && <circle cx="40" cy="40" r="24" fill={tint} stroke="none" opacity={0.3 * glow} />}
                    <path d="M0 40H28M52 40H80" />
                    <path d="M28 26V54L52 40Z" fill={tint} fillOpacity={0.15 + 0.85 * glow} />
                    <path d="M52 26V54" />
                    <path d="M46 20L54 12M54 12H48M54 12V18M56 26L64 18M64 18H58M64 18V24" strokeWidth={2} />
                </svg>
            );
        }
        case "diode":
            return (
                <svg {...common}>
                    <path d="M0 40H28M52 40H80" />
                    <path d="M28 26V54L52 40Z" fill="currentColor" fillOpacity={0.15} />
                    <path d="M52 26V54" />
                </svg>
            );
        case "zener":
            return (
                <svg {...common}>
                    <path d="M0 40H28M52 40H80" />
                    <path d="M28 26V54L52 40Z" fill="currentColor" fillOpacity={0.15} />
                    <path d="M46 22L52 26V54L58 58" />
                </svg>
            );
        case "npn":
        case "pnp":
            return (
                <svg {...common}>
                    <circle cx="38" cy="40" r="22" strokeWidth={1.5} />
                    <path d="M0 40H28M28 26V54" />
                    <path d="M28 34L40 24V0M28 46L40 56V80" />
                    {kind === "npn" ? (
                        <path d="M33 56L40 56L38 49Z" fill="currentColor" strokeWidth={1.5} />
                    ) : (
                        <path d="M30 47L37 47L35 54Z" fill="currentColor" strokeWidth={1.5} />
                    )}
                </svg>
            );
        case "switch":
            return (
                <svg {...common}>
                    <path d="M0 40H22M58 40H80" />
                    <circle cx="24" cy="40" r="3" fill="currentColor" />
                    <circle cx="56" cy="40" r="3" fill="currentColor" />
                    <path d={closed ? "M24 40L56 40" : "M24 40L54 22"} />
                </svg>
            );
        case "button": {
            const y = closed ? 40 : 30;
            return (
                <svg {...common}>
                    <path d="M0 40H22M58 40H80" />
                    <circle cx="24" cy="40" r="3" fill="currentColor" />
                    <circle cx="56" cy="40" r="3" fill="currentColor" />
                    <path d={`M20 ${y}H60M40 ${y}V${y - 14}M32 ${y - 14}H48`} />
                </svg>
            );
        }
        case "fuse":
            return (
                <svg {...common}>
                    <path d="M0 40H22M58 40H80" />
                    <rect x="22" y="32" width="36" height="16" rx="2" />
                    {blown ? (
                        <path d="M22 40H34M46 40H58M37 34L43 46" stroke="#ef4444" strokeWidth={2} />
                    ) : (
                        <path d="M22 40H58" strokeWidth={1.5} />
                    )}
                </svg>
            );
        case "motor": {
            // One revolution per 2 s at 5 % speed down to 0.2 s at full speed.
            const duration = spin > 0.01 ? 0.2 / Math.max(spin, 0.1) : 0;
            return (
                <svg {...common}>
                    <path d="M0 40H22M58 40H80" />
                    <circle cx="40" cy="40" r="18" />
                    <g
                        className={duration ? "circuit-spin" : undefined}
                        style={{ transformOrigin: "40px 40px", animationDuration: duration ? `${duration}s` : undefined }}
                    >
                        <path d="M40 26V54M26 40H54" strokeWidth={1.5} opacity={0.5} />
                    </g>
                    {letters && <path d="M33 47V33L40 42L47 33V47" strokeWidth={2} />}
                </svg>
            );
        }
        case "buzzer":
            return (
                <svg {...common}>
                    <path d="M0 40H24M56 40H80" />
                    <path d="M24 30H36L50 20V60L36 50H24Z" />
                    {sounding && <path d="M56 30Q62 40 56 50M62 24Q72 40 62 56" className="animate-pulse" strokeWidth={2} />}
                </svg>
            );
        case "capacitor":
            return (
                <svg {...common}>
                    <path d="M0 40H35M45 40H80" />
                    <path d="M35 22V58M45 22V58" />
                </svg>
            );
        case "voltmeter":
        case "ammeter":
            return (
                <svg {...common}>
                    <path d="M0 40H20M60 40H80" />
                    <circle cx="40" cy="40" r="20" />
                    <text x="40" y="47" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor" stroke="none">
                        {kind === "voltmeter" ? "V" : "A"}
                    </text>
                </svg>
            );
        case "ground":
            return (
                <svg {...common}>
                    <path d="M40 0V38" />
                    <path d="M22 38H58M29 48H51M36 58H44" />
                </svg>
            );
    }
}
