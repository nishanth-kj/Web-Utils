"use client";

import React, { memo, useContext, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from "reactflow";
import { BULB_RATED_POWER, PART_DEFS } from "@/lib/circuit/analog/parts";
import type { PartReading } from "@/lib/circuit/analog/solver";
import { formatSI } from "@/lib/circuit/units";
import { cn } from "@/lib/utils";
import { PartSymbol } from "./part-symbol";
import { AnalogRuntimeContext, type PartNodeData } from "./runtime";

const SIDES = [Position.Left, Position.Top, Position.Right, Position.Bottom];

// Rotating clockwise by 90° moves the left terminal to the top, and so on.
function terminalSides(data: PartNodeData) {
    const step = data.rotation / 90;
    if (data.kind === "ground") return { a: SIDES[(1 + step) % 4] };
    return { a: SIDES[step % 4], b: SIDES[(step + 2) % 4] };
}

const HANDLE_STYLE: React.CSSProperties = {
    width: 12,
    height: 12,
    background: "var(--primary)",
    border: "2px solid var(--background)",
};

export function valueLabel(data: PartNodeData): string {
    switch (data.kind) {
        case "led":
            return `${data.color ?? "red"} LED`;
        case "switch":
            return data.closed ? "closed" : "open";
        case "ground":
            return "0 V";
        default:
            return formatSI(data.value, PART_DEFS[data.kind].unit ?? "");
    }
}

function readingLabel(data: PartNodeData, reading: PartReading | undefined): string | null {
    if (!reading || data.kind === "ground") return null;
    const current = formatSI(Math.abs(reading.current), "A");
    const voltage = formatSI(Math.abs(reading.voltage), "V");
    switch (data.kind) {
        case "battery":
            return current;
        case "capacitor":
            return voltage;
        case "switch":
            return data.closed ? current : voltage;
        default:
            return `${current} · ${voltage}`;
    }
}

function glowFor(data: PartNodeData, reading: PartReading | undefined): number {
    if (!reading) return 0;
    if (data.kind === "bulb") return Math.min(1, Math.sqrt(Math.max(0, reading.power) / BULB_RATED_POWER));
    if (data.kind === "led") return reading.on ? Math.min(1, Math.max(0.15, reading.current / 0.02)) : 0;
    return 0;
}

function PartNodeImpl({ id, data, selected }: NodeProps<PartNodeData>) {
    const runtime = useContext(AnalogRuntimeContext);
    const updateNodeInternals = useUpdateNodeInternals();
    const reading = runtime?.result.readings[id];
    const sides = terminalSides(data);

    // Handles move when the part rotates; React Flow has to re-measure them.
    useEffect(() => {
        updateNodeInternals(id);
    }, [id, data.rotation, updateNodeInternals]);

    const overloaded = runtime?.result.overloadedLeds.includes(id);
    // Vertical parts sit on vertical wires, so their label goes beside them.
    const vertical = data.rotation === 90 || data.rotation === 270;
    const readingText = readingLabel(data, reading);

    return (
        <div
            className={cn(
                "relative size-20 rounded-md text-foreground",
                selected && "bg-primary/5 ring-2 ring-primary/60",
                overloaded && "text-destructive"
            )}
        >
            <div className="size-20" style={{ transform: `rotate(${data.rotation}deg)` }}>
                <PartSymbol kind={data.kind} glow={glowFor(data, reading)} closed={data.closed} color={data.color} />
            </div>

            {data.kind === "switch" && (
                <button
                    type="button"
                    className="nodrag absolute inset-4 cursor-pointer rounded-md hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => runtime?.toggleSwitch(id)}
                    aria-label={data.closed ? "Open switch" : "Close switch"}
                    title={data.closed ? "Click to open the switch" : "Click to close the switch"}
                />
            )}

            <Handle id="a" type="source" position={sides.a} style={HANDLE_STYLE} />
            {sides.b && <Handle id="b" type="source" position={sides.b} style={HANDLE_STYLE} />}

            <div
                className={cn(
                    "pointer-events-none absolute whitespace-nowrap text-[10px] leading-tight",
                    vertical ? "left-full top-1/2 ml-1 -translate-y-1/2 text-left" : "left-1/2 top-full mt-1 -translate-x-1/2 text-center"
                )}
            >
                <div className="font-semibold">{valueLabel(data)}</div>
                {readingText && <div className="tabular-nums text-muted-foreground">{readingText}</div>}
            </div>
        </div>
    );
}

export const PartNode = memo(PartNodeImpl);
