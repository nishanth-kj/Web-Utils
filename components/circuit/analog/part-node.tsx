"use client";

import React, { memo, useContext, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from "reactflow";
import { BUZZER_MIN_CURRENT, BULB_RATED_POWER, MOTOR_FULL_CURRENT, PART_DEFS } from "@/lib/circuit/analog/parts";
import type { PartReading } from "@/lib/circuit/analog/solver";
import { formatSI } from "@/lib/circuit/units";
import { cn } from "@/lib/utils";
import { PartSymbol } from "./part-symbol";
import { ScopeScreen } from "./scope-node";
import { AnalogRuntimeContext, type PartNodeData } from "./runtime";

const SIDES = [Position.Left, Position.Top, Position.Right, Position.Bottom];

// Rotating clockwise by 90° moves the left terminal to the top, and so on.
// The potentiometer's wiper starts at the bottom; ground's terminal at the top.
function terminalSides(data: PartNodeData) {
    const step = data.rotation / 90;
    if (data.kind === "ground") return { a: SIDES[(1 + step) % 4] };
    return {
        a: SIDES[step % 4],
        b: SIDES[(step + 2) % 4],
        w: data.kind === "potentiometer" ? SIDES[(step + 3) % 4] : undefined,
    };
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
        case "button":
            return data.closed ? "pressed" : "push";
        case "potentiometer":
            return `${formatSI(data.value, "Ω")} · ${Math.round((data.position ?? 0.5) * 100)}%`;
        case "diode":
            return "diode";
        case "zener":
            return `${formatSI(data.value, "V")} Zener`;
        case "fuse":
            return `${formatSI(data.value, "A")} fuse`;
        case "voltmeter":
            return "DC volts";
        case "ammeter":
            return "DC amps";
        case "ac":
            return `${formatSI(data.value, "V")} ~ ${formatSI(data.frequency ?? 1, "Hz")}`;
        case "ground":
            return "0 V";
        default:
            return formatSI(data.value, PART_DEFS[data.kind].unit ?? "");
    }
}

function readingLabel(data: PartNodeData, reading: PartReading | undefined): string | null {
    if (!reading || data.kind === "ground" || data.kind === "voltmeter" || data.kind === "ammeter") return null;
    const current = formatSI(Math.abs(reading.current), "A");
    const voltage = formatSI(Math.abs(reading.voltage), "V");
    switch (data.kind) {
        case "battery":
        case "ac":
        case "inductor":
        case "motor":
        case "buzzer":
            return current;
        case "capacitor":
            return voltage;
        case "switch":
        case "button":
            return data.closed ? current : voltage;
        case "fuse":
            return reading.blown ? "BLOWN" : current;
        case "potentiometer":
            return `${current} · wiper ${formatSI(reading.wiperVoltage ?? 0, "V")}`;
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

/** Signed meter reading with a fixed number of significant digits. */
function meterText(kind: "voltmeter" | "ammeter", reading: PartReading | undefined) {
    if (!reading) return kind === "voltmeter" ? "-.-- V" : "-.-- A";
    const value = kind === "voltmeter" ? reading.voltage : reading.current;
    const text = formatSI(value, kind === "voltmeter" ? "V" : "A");
    return value > 0 ? `+${text}` : text;
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

    const overloaded = runtime?.result.overloadedLeds.includes(id) || reading?.blown;
    // Vertical parts sit on vertical wires, so their label goes beside them.
    const vertical = data.rotation === 90 || data.rotation === 270;
    const readingText = readingLabel(data, reading);
    const isMeter = data.kind === "voltmeter" || data.kind === "ammeter";
    const press = (pressed: boolean) => runtime?.updatePart(id, { closed: pressed });
    const position = data.position ?? 0.5;
    const nudge = (delta: number) => runtime?.updatePart(id, { position: Math.round(Math.min(1, Math.max(0, position + delta)) * 100) / 100 });

    if (data.kind === "oscilloscope") {
        return (
            <ScopeScreen
                id={id}
                buffer={runtime?.scopes.get(id)}
                timePerDiv={data.timePerDiv}
                voltsPerDiv={data.voltsPerDiv}
                selected={selected}
            />
        );
    }

    return (
        <div
            className={cn(
                "relative size-20 rounded-md text-foreground",
                selected && "bg-primary/5 ring-2 ring-primary/60",
                overloaded && "text-destructive"
            )}
        >
            <div className="size-20" style={{ transform: `rotate(${data.rotation}deg)` }}>
                <PartSymbol
                    kind={data.kind}
                    glow={glowFor(data, reading)}
                    closed={data.closed}
                    color={data.color}
                    blown={reading?.blown}
                    spin={data.kind === "motor" && reading ? Math.min(1, Math.abs(reading.current) / MOTOR_FULL_CURRENT) : 0}
                    sounding={data.kind === "buzzer" && Math.abs(reading?.current ?? 0) > BUZZER_MIN_CURRENT}
                    letters={false}
                />
            </div>

            {data.kind === "motor" && (
                // The "M" stays upright whatever the rotation.
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold">M</span>
            )}

            {isMeter && (
                // Proteus-style digital readout, kept upright whatever the rotation.
                <div className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-900 px-1 py-1 text-center font-mono text-[11px] font-semibold tabular-nums text-emerald-400 shadow-inner">
                    {meterText(data.kind as "voltmeter" | "ammeter", reading)}
                </div>
            )}

            {data.kind === "switch" && (
                <button
                    type="button"
                    className="nodrag absolute inset-4 cursor-pointer rounded-md hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => runtime?.toggleSwitch(id)}
                    aria-label={data.closed ? "Open switch" : "Close switch"}
                    title={data.closed ? "Click to open the switch" : "Click to close the switch"}
                />
            )}

            {data.kind === "button" && (
                <button
                    type="button"
                    className="nodrag absolute inset-4 cursor-pointer rounded-md hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring"
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
                    onBlur={() => data.closed && press(false)}
                    aria-label="Push button: hold to press"
                    aria-pressed={Boolean(data.closed)}
                    title="Hold to press"
                />
            )}

            {data.kind === "potentiometer" && (
                <div className="nodrag absolute -top-1 right-0 flex gap-0.5">
                    <button
                        type="button"
                        className="flex size-5 items-center justify-center rounded border bg-background text-xs font-bold leading-none hover:bg-accent"
                        onClick={() => nudge(-0.1)}
                        aria-label={`Turn ${id.toUpperCase()} down`}
                        title="Turn down 10%"
                    >
                        −
                    </button>
                    <button
                        type="button"
                        className="flex size-5 items-center justify-center rounded border bg-background text-xs font-bold leading-none hover:bg-accent"
                        onClick={() => nudge(0.1)}
                        aria-label={`Turn ${id.toUpperCase()} up`}
                        title="Turn up 10%"
                    >
                        +
                    </button>
                </div>
            )}

            <Handle id="a" type="source" position={sides.a} style={HANDLE_STYLE} />
            {sides.b && <Handle id="b" type="source" position={sides.b} style={HANDLE_STYLE} />}
            {sides.w && <Handle id="w" type="source" position={sides.w} style={HANDLE_STYLE} />}

            <div
                className={cn(
                    "pointer-events-none absolute whitespace-nowrap text-[10px] leading-tight",
                    vertical ? "left-full top-1/2 ml-1 -translate-y-1/2 text-left" : "left-1/2 top-full mt-1 -translate-x-1/2 text-center"
                )}
            >
                <div className="font-semibold">
                    {data.kind !== "ground" && <span className="text-muted-foreground">{id.toUpperCase()} · </span>}
                    {valueLabel(data)}
                </div>
                {readingText && <div className="tabular-nums text-muted-foreground">{readingText}</div>}
            </div>
        </div>
    );
}

export const PartNode = memo(PartNodeImpl);
