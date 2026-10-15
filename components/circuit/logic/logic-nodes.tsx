"use client";

import React, { memo, useContext } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { PINS, type FlipFlopKind, type GateKind } from "@/lib/circuit/logic/logic";
import { cn } from "@/lib/utils";
import { HIGH_COLOR, LogicRuntimeContext, type LogicNodeData } from "./logic-runtime";

const handleStyle = (high: boolean): React.CSSProperties => ({
    width: 11,
    height: 11,
    background: high ? HIGH_COLOR : "var(--muted-foreground)",
    border: "2px solid var(--background)",
});

// ANSI gate bodies in an 80×60 box: inputs at y = 20 and 40 (NOT, buffer: 30), output at (80, 30).
const GATE_BODY: Record<GateKind, { body: string; leads: string; bubble?: [number, number] }> = {
    and: { body: "M12 8H38A22 22 0 0 1 38 52H12Z", leads: "M0 20H12M0 40H12M60 30H80" },
    nand: { body: "M10 8H34A22 22 0 0 1 34 52H10Z", leads: "M0 20H10M0 40H10M64 30H80", bubble: [60, 30] },
    or: { body: "M10 8Q34 8 60 30Q34 52 10 52Q22 30 10 8Z", leads: "M0 20H16M0 40H16M60 30H80" },
    nor: { body: "M8 8Q32 8 56 30Q32 52 8 52Q20 30 8 8Z", leads: "M0 20H14M0 40H14M64 30H80", bubble: [60, 30] },
    xor: { body: "M16 8Q38 8 62 30Q38 52 16 52Q28 30 16 8ZM8 8Q20 30 8 52", leads: "M0 20H13M0 40H13M62 30H80" },
    xnor: { body: "M14 8Q36 8 56 30Q36 52 14 52Q26 30 14 8ZM6 8Q18 30 6 52", leads: "M0 20H11M0 40H11M64 30H80", bubble: [60, 30] },
    not: { body: "M14 10L52 30L14 50Z", leads: "M0 30H14M60 30H80", bubble: [56, 30] },
    buffer: { body: "M14 10L56 30L14 50Z", leads: "M0 30H14M56 30H80" },
};

export function GateSymbol({ kind, size = 80 }: { kind: GateKind; size?: number }) {
    const gate = GATE_BODY[kind];
    return (
        <svg width={size} height={(size * 60) / 80} viewBox="0 0 80 60" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" aria-hidden>
            <path d={gate.leads} />
            <path d={gate.body} fill="var(--background)" />
            {gate.bubble && <circle cx={gate.bubble[0]} cy={gate.bubble[1]} r={4} fill="var(--background)" />}
        </svg>
    );
}

function GateNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const high = Boolean(runtime?.result.outputs[`${id}:out`]);
    const single = PINS[data.kind].inputs.length === 1;
    return (
        <div className={cn("relative h-[60px] w-20 rounded-md text-foreground", selected && "bg-primary/5 ring-2 ring-primary/60")}>
            <GateSymbol kind={data.kind as GateKind} />
            <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {data.kind}
            </span>
            {single ? (
                <Handle id="in0" type="target" position={Position.Left} style={{ ...handleStyle(false), top: 30 }} />
            ) : (
                <>
                    <Handle id="in0" type="target" position={Position.Left} style={{ ...handleStyle(false), top: 20 }} />
                    <Handle id="in1" type="target" position={Position.Left} style={{ ...handleStyle(false), top: 40 }} />
                </>
            )}
            <Handle id="out" type="source" position={Position.Right} style={{ ...handleStyle(high), top: 30 }} />
        </div>
    );
}

function SwitchNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const on = Boolean(data.on);
    return (
        <div className={cn("relative flex h-12 w-20 items-center gap-2 rounded-lg border bg-card px-2", selected && "ring-2 ring-primary/60")}>
            <span className="w-6 truncate text-xs font-bold">{data.label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Switch ${data.label ?? id}`}
                onClick={() => runtime?.toggleSwitch(id)}
                className={cn(
                    "nodrag relative h-6 w-10 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    on ? "bg-emerald-500" : "bg-muted-foreground/40"
                )}
            >
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
            </button>
            <Handle id="out" type="source" position={Position.Right} style={handleStyle(on)} />
        </div>
    );
}

function ButtonNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const pressed = Boolean(data.on);
    const press = (value: boolean) => runtime?.setPressed(id, value);
    return (
        <div className={cn("relative flex h-12 w-20 items-center gap-2 rounded-lg border bg-card px-2", selected && "ring-2 ring-primary/60")}>
            <span className="w-6 truncate text-xs font-bold">{data.label}</span>
            <button
                type="button"
                aria-label={`Push button ${data.label ?? id}: hold to press`}
                aria-pressed={pressed}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    press(true);
                }}
                onPointerUp={() => press(false)}
                onPointerCancel={() => press(false)}
                onKeyDown={(event) => {
                    if ((event.key === " " || event.key === "Enter") && !event.repeat) press(true);
                }}
                onKeyUp={(event) => {
                    if (event.key === " " || event.key === "Enter") press(false);
                }}
                onBlur={() => pressed && press(false)}
                className={cn(
                    "nodrag size-8 rounded-full border-2 shadow transition-all focus-visible:outline-2 focus-visible:outline-ring",
                    pressed ? "translate-y-px border-emerald-700 bg-emerald-500 shadow-inner" : "border-zinc-400 bg-zinc-200 dark:bg-zinc-700"
                )}
                title="Hold to press"
            />
            <Handle id="out" type="source" position={Position.Right} style={handleStyle(pressed)} />
        </div>
    );
}

function ClockNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const high = Boolean(runtime?.result.outputs[`${id}:out`]);
    return (
        <div className={cn("relative flex h-12 w-20 flex-col justify-center rounded-lg border bg-card px-2", selected && "ring-2 ring-primary/60")}>
            <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold">{data.label ?? "CLK"}</span>
                <span className="size-2.5 rounded-full transition-colors" style={{ background: high ? HIGH_COLOR : "var(--muted)" }} />
            </div>
            <svg viewBox="0 0 48 12" className="mt-0.5 h-3 w-12 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path d="M0 11H8V1H20V11H32V1H44V11H48" />
            </svg>
            <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">{data.period ?? 1} s</span>
            <Handle id="out" type="source" position={Position.Right} style={handleStyle(high)} />
        </div>
    );
}

function LedNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const lit = Boolean(runtime?.result.leds[id]);
    return (
        <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-full", selected && "ring-2 ring-primary/60")}>
            <span
                className="size-9 rounded-full border-2 transition-all"
                style={{
                    background: lit ? "#ef4444" : "var(--muted)",
                    borderColor: lit ? "#b91c1c" : "var(--border)",
                    boxShadow: lit ? "0 0 18px 4px rgba(239, 68, 68, 0.55)" : "none",
                }}
                role="img"
                aria-label={`${data.label ?? id} is ${lit ? "on" : "off"}`}
            />
            <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold">{data.label}</span>
            <Handle id="in0" type="target" position={Position.Left} style={handleStyle(lit)} />
        </div>
    );
}

// Proteus-style logic probe: a red 1 or a blue 0.
function ProbeNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const high = Boolean(runtime?.result.leds[id]);
    return (
        <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-md", selected && "ring-2 ring-primary/60")}>
            <span
                className={cn(
                    "flex size-9 items-center justify-center rounded-md border-2 font-mono text-lg font-bold text-white transition-colors",
                    high ? "border-red-700 bg-red-500" : "border-blue-800 bg-blue-600"
                )}
                role="img"
                aria-label={`${data.label ?? id} reads ${high ? 1 : 0}`}
            >
                {high ? 1 : 0}
            </span>
            <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold">{data.label}</span>
            <Handle id="in0" type="target" position={Position.Left} style={handleStyle(high)} />
        </div>
    );
}

// Segments lit for each hex digit 0–F, in the order a b c d e f g.
const SEGMENTS = [
    "1111110", "0110000", "1101101", "1111001", "0110011", "1011011", "1011111", "1110000",
    "1111111", "1111011", "1110111", "0011111", "1001110", "0111101", "1001111", "1000111",
];
// Segment shapes in a 40×64 box.
const SEGMENT_PATHS = [
    "M10 5H30L27 9H13Z", // a
    "M32 7L35 10V29L32 31L29 28V11Z", // b
    "M32 33L35 35V54L32 57L29 53V36Z", // c
    "M10 59H30L27 55H13Z", // d
    "M8 33L11 36V53L8 57L5 54V35Z", // e
    "M8 7L11 11V28L8 31L5 29V10Z", // f
    "M10 32L13 29H27L30 32L27 35H13Z", // g
];

export function SevenSegmentDigit({ value, size = 64 }: { value: number | null; size?: number }) {
    const lit = value === null ? "0000000" : SEGMENTS[value & 15];
    return (
        <svg width={(size * 40) / 64} height={size} viewBox="0 0 40 64" aria-hidden>
            {SEGMENT_PATHS.map((path, i) => (
                <path key={i} d={path} fill={lit[i] === "1" ? "#ef4444" : "#3f1d1d"} />
            ))}
        </svg>
    );
}

function Seg7NodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const value = runtime?.result.displays[id] ?? null;
    const pins = PINS.seg7.inputs;
    return (
        <div className={cn("relative flex h-[104px] w-[88px] items-center justify-end rounded-lg border-2 border-zinc-700 bg-zinc-950 pr-3", selected && "ring-2 ring-primary/60")}>
            <SevenSegmentDigit value={value} size={72} />
            <span className="sr-only" role="img" aria-label={`${data.label ?? id} shows ${value === null ? "nothing" : value.toString(16).toUpperCase()}`} />
            {pins.map((pin, i) => (
                <React.Fragment key={pin.id}>
                    <span className="pointer-events-none absolute left-2 font-mono text-[9px] text-zinc-400" style={{ top: 14 + i * 22 }}>
                        {pin.label}
                    </span>
                    <Handle id={pin.id} type="target" position={Position.Left} style={{ ...handleStyle(false), top: 20 + i * 22 }} />
                </React.Fragment>
            ))}
            <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-foreground">{data.label}</span>
        </div>
    );
}

const FLIP_FLOP_TITLE: Record<FlipFlopKind, string> = { dff: "D", jkff: "JK", tff: "T" };

// Edge-triggered flip-flop block: inputs on the left (clock marked ▷), Q and Q̄ on the right.
function FlipFlopNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const { inputs, outputs } = PINS[data.kind];
    const height = Math.max(inputs.length, outputs.length) * 26 + 22;
    const y = (i: number, count: number) => Math.round(((i + 1) * height) / (count + 1));
    return (
        <div className={cn("relative w-24 rounded-md border-2 border-foreground/70 bg-card", selected && "ring-2 ring-primary/60")} style={{ height }}>
            <span className="pointer-events-none absolute inset-x-0 top-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {FLIP_FLOP_TITLE[data.kind as FlipFlopKind]} FF
            </span>
            {inputs.map((pin, i) => (
                <React.Fragment key={pin.id}>
                    <span className="pointer-events-none absolute left-2 -translate-y-1/2 font-mono text-[10px] font-semibold" style={{ top: y(i, inputs.length) }}>
                        {pin.clock ? "▷" : pin.label}
                    </span>
                    <Handle id={pin.id} type="target" position={Position.Left} style={{ ...handleStyle(false), top: y(i, inputs.length) }} />
                </React.Fragment>
            ))}
            {outputs.map((pin, i) => {
                const high = Boolean(runtime?.result.outputs[`${id}:${pin.id}`]);
                return (
                    <React.Fragment key={pin.id}>
                        <span className="pointer-events-none absolute right-2 -translate-y-1/2 font-mono text-[10px] font-semibold" style={{ top: y(i, outputs.length), color: high ? HIGH_COLOR : undefined }}>
                            {pin.label}
                        </span>
                        <Handle id={pin.id} type="source" position={Position.Right} style={{ ...handleStyle(high), top: y(i, outputs.length) }} />
                    </React.Fragment>
                );
            })}
            {data.label && <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold">{data.label}</span>}
        </div>
    );
}

export const LOGIC_NODE_TYPES = {
    gate: memo(GateNodeImpl),
    switch: memo(SwitchNodeImpl),
    button: memo(ButtonNodeImpl),
    clock: memo(ClockNodeImpl),
    led: memo(LedNodeImpl),
    probe: memo(ProbeNodeImpl),
    seg7: memo(Seg7NodeImpl),
    flipflop: memo(FlipFlopNodeImpl),
};
