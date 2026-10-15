"use client";

import React, { useState } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LED_COLORS, LED_MAX_CURRENT, PART_DEFS, type LedColor } from "@/lib/circuit/analog/parts";
import type { PartReading } from "@/lib/circuit/analog/solver";
import { formatSI, parseSI } from "@/lib/circuit/units";
import type { PartNodeData } from "./runtime";

interface PropertiesPanelProps {
    part?: { id: string; data: PartNodeData; reading?: PartReading };
    wire?: { id: string; current: number };
    onUpdate: (patch: Partial<PartNodeData>) => void;
    onRotate: () => void;
    onDelete: () => void;
    onReplaceFuse: (id: string) => void;
}

const VALUE_LABELS: Partial<Record<PartNodeData["kind"], string>> = {
    battery: "Voltage",
    capacitor: "Capacitance",
    zener: "Breakdown voltage",
    fuse: "Rating",
};

export function PropertiesPanel({ part, wire, onUpdate, onRotate, onDelete, onReplaceFuse }: PropertiesPanelProps) {
    if (wire && !part) {
        return (
            <div className="space-y-3 p-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wire</h2>
                <Readout label="Current" value={formatSI(Math.abs(wire.current), "A")} />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onDelete}>
                    <Trash2 className="size-3.5" /> Delete wire
                </Button>
            </div>
        );
    }

    if (!part) {
        return (
            <div className="space-y-3 p-4 text-xs leading-relaxed text-muted-foreground">
                <h2 className="text-xs font-bold uppercase tracking-widest">How to use</h2>
                <ul className="list-disc space-y-1.5 pl-4">
                    <li>Add parts from the palette, then drag between the dots on their ends to connect wires.</li>
                    <li>Select a part to change its value, rotate it, or delete it. Values accept 4.7k, 100µ, 2.2M.</li>
                    <li>Click a switch to flip it.</li>
                    <li>Run, Pause and Stop control the simulation: pause freezes the readings, stop switches everything off.</li>
                    <li>Moving dashes show current and its direction; faster means more current.</li>
                    <li>Press Delete or Backspace to remove the selection.</li>
                </ul>
            </div>
        );
    }

    const def = PART_DEFS[part.data.kind];
    const reading = part.reading;
    const isBattery = part.data.kind === "battery";

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{def.label}</h2>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={onRotate} aria-label="Rotate part" title="Rotate (R)">
                        <RotateCw className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={onDelete} aria-label="Delete part" title="Delete">
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            {def.unit && (
                <ValueEditor
                    key={`${part.id}:${part.data.value}`}
                    label={VALUE_LABELS[part.data.kind] ?? "Resistance"}
                    value={part.data.value}
                    unit={def.unit}
                    min={def.min}
                    max={def.max}
                    onCommit={(value) => onUpdate({ value })}
                />
            )}

            {part.data.kind === "led" && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="led-color">Colour</label>
                    <Select value={part.data.color ?? "red"} onValueChange={(color) => onUpdate({ color: color as LedColor })}>
                        <SelectTrigger id="led-color" className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(LED_COLORS) as LedColor[]).map((color) => (
                                <SelectItem key={color} value={color} className="text-xs capitalize">
                                    {color} ({LED_COLORS[color].forwardVoltage} V)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Max {formatSI(LED_MAX_CURRENT, "A")}. Connect the anode (left) toward +.</p>
                </div>
            )}

            {part.data.kind === "potentiometer" && (
                <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                        <label className="text-[11px] font-semibold text-muted-foreground" id="pot-position">Wiper position</label>
                        <span className="font-mono text-xs tabular-nums">{Math.round((part.data.position ?? 0.5) * 100)}%</span>
                    </div>
                    <Slider
                        aria-labelledby="pot-position"
                        min={0}
                        max={100}
                        step={1}
                        value={[Math.round((part.data.position ?? 0.5) * 100)]}
                        onValueChange={([value]) => onUpdate({ position: value / 100 })}
                    />
                    <p className="text-[11px] text-muted-foreground">0% puts the wiper at end a, 100% at end b. Use it as a dimmer by wiring one end and the wiper.</p>
                </div>
            )}

            {part.data.kind === "fuse" && reading?.blown && (
                <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                    <p>Blown: the current went over {formatSI(part.data.value, "A")}.</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => onReplaceFuse(part.id)}>
                        Replace fuse
                    </Button>
                </div>
            )}

            {part.data.kind === "button" && (
                <p className="text-[11px] text-muted-foreground">Press and hold the button on the canvas (or focus it and hold Space) to close it.</p>
            )}

            {part.data.kind === "switch" && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => onUpdate({ closed: !part.data.closed })}>
                    {part.data.closed ? "Open switch" : "Close switch"}
                </Button>
            )}

            {reading && part.data.kind !== "ground" && (
                <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
                    <Readout label={isBattery ? "Terminal voltage" : "Voltage"} value={formatSI(Math.abs(reading.voltage), "V")} />
                    <Readout label={isBattery ? "Delivers" : "Current"} value={formatSI(Math.abs(reading.current), "A")} />
                    <Readout label={isBattery ? "Power out" : "Power"} value={formatSI(Math.abs(reading.power), "W")} />
                    {part.data.kind === "led" && <Readout label="State" value={reading.on ? "on" : "off"} />}
                </div>
            )}
        </div>
    );
}

function Readout({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function ValueEditor({
    label,
    value,
    unit,
    min,
    max,
    onCommit,
}: {
    label: string;
    value: number;
    unit: string;
    min?: number;
    max?: number;
    onCommit: (value: number) => void;
}) {
    const [draft, setDraft] = useState(formatSI(value, unit, 4));
    const [error, setError] = useState<string | null>(null);

    const commit = () => {
        const parsed = parseSI(draft);
        if (parsed === null) {
            setError("Enter a number, optionally with a prefix such as k, m or µ.");
            return;
        }
        if ((min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
            setError(`Use a value between ${formatSI(min ?? 0, unit)} and ${formatSI(max ?? Infinity, unit)}.`);
            return;
        }
        setError(null);
        onCommit(parsed);
    };

    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="part-value">{label}</label>
            <Input
                id="part-value"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commit}
                onKeyDown={(event) => {
                    if (event.key === "Enter") commit();
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "part-value-error" : undefined}
                className="h-8 font-mono text-xs"
            />
            {error && (
                <p id="part-value-error" className="text-[11px] text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
