import React from "react";
import { LED_COLORS, type AnalogKind, type LedColor } from "@/lib/circuit/analog/parts";

interface PartSymbolProps {
    kind: AnalogKind;
    size?: number;
    /** 0-1: bulb or LED brightness. */
    glow?: number;
    closed?: boolean;
    color?: LedColor;
}

// Schematic symbols drawn left-to-right in an 80×80 box: terminal "a" at
// (0, 40), terminal "b" at (80, 40). Ground's single terminal is at (40, 0).
export function PartSymbol({ kind, size = 80, glow = 0, closed, color = "red" }: PartSymbolProps) {
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
        case "resistor":
            return (
                <svg {...common}>
                    <path d="M0 40H16L20 30L28 50L36 30L44 50L52 30L60 50L64 40H80" />
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
        case "switch":
            return (
                <svg {...common}>
                    <path d="M0 40H22M58 40H80" />
                    <circle cx="24" cy="40" r="3" fill="currentColor" />
                    <circle cx="56" cy="40" r="3" fill="currentColor" />
                    <path d={closed ? "M24 40L56 40" : "M24 40L54 22"} />
                </svg>
            );
        case "capacitor":
            return (
                <svg {...common}>
                    <path d="M0 40H35M45 40H80" />
                    <path d="M35 22V58M45 22V58" />
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
