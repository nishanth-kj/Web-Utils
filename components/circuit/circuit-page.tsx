"use client";

import { CircuitBoard } from "lucide-react";
import { AnalogSimulator } from "./analog/analog-simulator";

export function CircuitPage() {
    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="flex min-h-14 shrink-0 items-center gap-2 border-b bg-muted/10 px-4">
                <div className="rounded-md bg-primary/10 p-1.5">
                    <CircuitBoard className="size-4 text-primary" />
                </div>
                <h1 className="text-xs font-black uppercase tracking-widest text-foreground">Circuit Simulator</h1>
            </div>
            <div className="min-h-0 flex-1">
                <AnalogSimulator />
            </div>
        </div>
    );
}
