"use client";

import React, { memo, useContext } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { GateKind } from "@/lib/circuit/logic/logic";
import { cn } from "@/lib/utils";
import { HIGH_COLOR, LogicRuntimeContext, type LogicNodeData } from "./logic-runtime";

const handleStyle = (high: boolean): React.CSSProperties => ({
    width: 11,
    height: 11,
    background: high ? HIGH_COLOR : "var(--muted-foreground)",
    border: "2px solid var(--background)",
});

// ANSI gate bodies in an 80×60 box: inputs at y = 20 and 40 (NOT: 30), output at (80, 30).
const GATE_BODY: Record<GateKind, { body: string; leads: string; bubble?: [number, number] }> = {
    and: { body: "M12 8H38A22 22 0 0 1 38 52H12Z", leads: "M0 20H12M0 40H12M60 30H80" },
    nand: { body: "M10 8H34A22 22 0 0 1 34 52H10Z", leads: "M0 20H10M0 40H10M64 30H80", bubble: [60, 30] },
    or: { body: "M10 8Q34 8 60 30Q34 52 10 52Q22 30 10 8Z", leads: "M0 20H16M0 40H16M60 30H80" },
    nor: { body: "M8 8Q32 8 56 30Q32 52 8 52Q20 30 8 8Z", leads: "M0 20H14M0 40H14M64 30H80", bubble: [60, 30] },
    xor: { body: "M16 8Q38 8 62 30Q38 52 16 52Q28 30 16 8ZM8 8Q20 30 8 52", leads: "M0 20H13M0 40H13M62 30H80" },
    xnor: { body: "M14 8Q36 8 56 30Q36 52 14 52Q26 30 14 8ZM6 8Q18 30 6 52", leads: "M0 20H11M0 40H11M64 30H80", bubble: [60, 30] },
    not: { body: "M14 10L52 30L14 50Z", leads: "M0 30H14M60 30H80", bubble: [56, 30] },
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
    const high = Boolean(runtime?.result.outputs[id]);
    const single = data.kind === "not";
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

function ClockNodeImpl({ id, data, selected }: NodeProps<LogicNodeData>) {
    const runtime = useContext(LogicRuntimeContext);
    const high = Boolean(runtime?.result.outputs[id]);
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

export const LOGIC_NODE_TYPES = {
    gate: memo(GateNodeImpl),
    switch: memo(SwitchNodeImpl),
    clock: memo(ClockNodeImpl),
    led: memo(LedNodeImpl),
};
