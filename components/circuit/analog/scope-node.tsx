"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { DEFAULT_TIME_PER_DIV, SCOPE_DIVISIONS_X, SCOPE_DIVISIONS_Y, autoVoltsPerDiv, type ScopeBuffer } from "@/lib/circuit/analog/scope";
import { formatSI } from "@/lib/circuit/units";
import { cn } from "@/lib/utils";

const WIDTH = 200;
const HEIGHT = 128;
export const CHANNEL_COLORS = { a: "#facc15", b: "#22d3ee" };

const HANDLE_STYLE: React.CSSProperties = {
    width: 12,
    height: 12,
    border: "2px solid var(--background)",
};

interface ScopeScreenProps {
    id: string;
    buffer?: ScopeBuffer;
    timePerDiv?: number;
    /** Fixed volts/div, or undefined for automatic. */
    voltsPerDiv?: number;
    selected?: boolean;
}

// Two-channel oscilloscope in roll mode: the newest sample is at the right
// edge and the trace scrolls left as simulated time advances.
export function ScopeScreen({ id, buffer, timePerDiv = DEFAULT_TIME_PER_DIV, voltsPerDiv, selected }: ScopeScreenProps) {
    const window = timePerDiv * SCOPE_DIVISIONS_X;
    const samples = buffer?.window(window, 400) ?? [];
    const latest = samples.at(-1);
    const peak = samples.reduce((max, s) => Math.max(max, Math.abs(s.a), Math.abs(s.b)), 0);
    const vDiv = voltsPerDiv ?? autoVoltsPerDiv(peak);

    const x = (time: number) => ((time - ((latest?.time ?? 0) - window)) / window) * WIDTH;
    const y = (volts: number) => HEIGHT / 2 - (volts / vDiv) * (HEIGHT / SCOPE_DIVISIONS_Y);
    const trace = (channel: "a" | "b") =>
        samples.map((s) => `${x(s.time).toFixed(1)},${Math.min(HEIGHT, Math.max(0, y(s[channel]))).toFixed(1)}`).join(" ");

    return (
        <div className={cn("relative w-[224px] rounded-lg border-2 border-zinc-700 bg-zinc-900 p-2 text-zinc-300 shadow-md", selected && "ring-2 ring-primary/60")}>
            <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-zinc-100">{id.toUpperCase()}</span>
                <span>
                    {formatSI(timePerDiv, "s")}/div · {formatSI(vDiv, "V")}/div{voltsPerDiv === undefined ? " auto" : ""}
                </span>
            </div>
            <svg width={WIDTH} height={HEIGHT} className="block rounded bg-black" aria-label={`${id.toUpperCase()} screen`} role="img">
                {Array.from({ length: SCOPE_DIVISIONS_X - 1 }, (_, i) => (
                    <line key={`x${i}`} x1={((i + 1) * WIDTH) / SCOPE_DIVISIONS_X} x2={((i + 1) * WIDTH) / SCOPE_DIVISIONS_X} y1={0} y2={HEIGHT} stroke="#27272a" />
                ))}
                {Array.from({ length: SCOPE_DIVISIONS_Y - 1 }, (_, i) => (
                    <line
                        key={`y${i}`}
                        y1={((i + 1) * HEIGHT) / SCOPE_DIVISIONS_Y}
                        y2={((i + 1) * HEIGHT) / SCOPE_DIVISIONS_Y}
                        x1={0}
                        x2={WIDTH}
                        stroke={i + 1 === SCOPE_DIVISIONS_Y / 2 ? "#52525b" : "#27272a"}
                    />
                ))}
                {samples.length > 1 && (
                    <>
                        <polyline points={trace("a")} fill="none" stroke={CHANNEL_COLORS.a} strokeWidth={1.5} />
                        <polyline points={trace("b")} fill="none" stroke={CHANNEL_COLORS.b} strokeWidth={1.5} />
                    </>
                )}
                {!latest && (
                    <text x={WIDTH / 2} y={HEIGHT / 2 - 6} textAnchor="middle" fontSize={10} fill="#71717a">
                        No signal
                    </text>
                )}
            </svg>
            <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums">
                <span style={{ color: CHANNEL_COLORS.a }}>A {latest ? formatSI(latest.a, "V") : "—"}</span>
                <span style={{ color: CHANNEL_COLORS.b }}>B {latest ? formatSI(latest.b, "V") : "—"}</span>
            </div>
            <Handle id="a" type="source" position={Position.Left} style={{ ...HANDLE_STYLE, top: 52, background: CHANNEL_COLORS.a }} />
            <Handle id="b" type="source" position={Position.Left} style={{ ...HANDLE_STYLE, top: 120, background: CHANNEL_COLORS.b }} />
        </div>
    );
}
