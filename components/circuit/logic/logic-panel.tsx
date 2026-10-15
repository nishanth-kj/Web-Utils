"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GATE_KINDS, isGate, type GateKind, type TruthTable } from "@/lib/circuit/logic/logic";
import { cn } from "@/lib/utils";
import type { LogicNodeData } from "./logic-runtime";

const CLOCK_PERIODS = [0.25, 0.5, 1, 2, 4];

interface LogicPanelProps {
    part?: { id: string; data: LogicNodeData; value: boolean };
    wire?: { id: string; value: boolean };
    table: TruthTable | { reason: string };
    currentInputs: boolean[];
    onUpdate: (patch: Partial<LogicNodeData>) => void;
    onDelete: () => void;
}

export function LogicPanel({ part, wire, table, currentInputs, onUpdate, onDelete }: LogicPanelProps) {
    return (
        <div className="divide-y">
            <div className="space-y-3 p-4">{renderSelection(part, wire, onUpdate, onDelete)}</div>
            <div className="space-y-2 p-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Truth table</h2>
                {"reason" in table ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">{table.reason}</p>
                ) : (
                    <TruthTableView table={table} currentInputs={currentInputs} />
                )}
            </div>
        </div>
    );
}

function renderSelection(
    part: LogicPanelProps["part"],
    wire: LogicPanelProps["wire"],
    onUpdate: LogicPanelProps["onUpdate"],
    onDelete: LogicPanelProps["onDelete"]
) {
    if (wire && !part) {
        return (
            <>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wire</h2>
                <p className="text-xs">
                    Carrying <span className="font-mono font-semibold">{wire.value ? "1 (high)" : "0 (low)"}</span>
                </p>
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onDelete}>
                    <Trash2 className="size-3.5" /> Delete wire
                </Button>
            </>
        );
    }

    if (!part) {
        return (
            <>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How to use</h2>
                <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
                    <li>Add switches, gates and LEDs from the palette.</li>
                    <li>Drag from an output dot (right side) to an input dot (left side) to connect them.</li>
                    <li>Click a switch to flip it. Green wires carry 1, grey wires carry 0.</li>
                    <li>Run, Pause and Stop control the simulation: pause holds the clocks, stop powers everything off.</li>
                    <li>Select a gate to change its type; press Delete to remove the selection.</li>
                </ul>
            </>
        );
    }

    const { data } = part;
    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {isGate(data.kind) ? `${data.kind.toUpperCase()} gate` : data.kind === "led" ? "LED" : data.kind === "clock" ? "Clock" : "Switch"}
                </h2>
                <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={onDelete} aria-label="Delete part" title="Delete">
                    <Trash2 className="size-3.5" />
                </Button>
            </div>

            {isGate(data.kind) && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="gate-type">Gate type</label>
                    <Select value={data.kind} onValueChange={(kind) => onUpdate({ kind: kind as GateKind })}>
                        <SelectTrigger id="gate-type" className="h-8 text-xs uppercase">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {GATE_KINDS.map((kind) => (
                                <SelectItem key={kind} value={kind} className="text-xs uppercase">
                                    {kind}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {!isGate(data.kind) && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="part-label">Name</label>
                    <Input
                        id="part-label"
                        value={data.label ?? ""}
                        maxLength={12}
                        onChange={(event) => onUpdate({ label: event.target.value })}
                        className="h-8 text-xs"
                    />
                </div>
            )}

            {data.kind === "clock" && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="clock-period">Period</label>
                    <Select value={String(data.period ?? 1)} onValueChange={(period) => onUpdate({ period: Number(period) })}>
                        <SelectTrigger id="clock-period" className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CLOCK_PERIODS.map((period) => (
                                <SelectItem key={period} value={String(period)} className="text-xs">
                                    {period} s ({1 / period} Hz)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {data.kind === "switch" && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => onUpdate({ on: !data.on })}>
                    Turn {data.on ? "off" : "on"}
                </Button>
            )}

            <p className="text-xs">
                {data.kind === "led" ? "Input" : "Output"}: <span className="font-mono font-semibold">{part.value ? "1" : "0"}</span>
            </p>
        </>
    );
}

function TruthTableView({ table, currentInputs }: { table: TruthTable; currentInputs: boolean[] }) {
    const bit = (value: boolean) => (value ? "1" : "0");
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs tabular-nums">
                <thead>
                    <tr className="border-b">
                        {table.inputs.map((name, i) => (
                            <th key={`i${i}`} scope="col" className="px-1.5 py-1 text-center font-semibold">{name}</th>
                        ))}
                        {table.outputs.map((name, i) => (
                            <th key={`o${i}`} scope="col" className={cn("px-1.5 py-1 text-center font-semibold text-emerald-600 dark:text-emerald-400", i === 0 && "border-l")}>
                                {name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map((row, r) => {
                        const current = row.inputs.every((value, i) => value === currentInputs[i]);
                        return (
                            <tr key={r} className={cn(current && "bg-primary/10 font-semibold")} aria-current={current ? "true" : undefined}>
                                {row.inputs.map((value, i) => (
                                    <td key={`i${i}`} className="px-1.5 py-0.5 text-center">{bit(value)}</td>
                                ))}
                                {row.outputs.map((value, i) => (
                                    <td key={`o${i}`} className={cn("px-1.5 py-0.5 text-center", i === 0 && "border-l")}>{bit(value)}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
