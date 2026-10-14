"use client";

import { useState, useSyncExternalStore } from "react";
import { CircuitBoard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalogSimulator } from "./analog/analog-simulator";
import { LogicSimulator } from "./logic/logic-simulator";

type Mode = "analog" | "logic";
const MODE_KEY = "web-circuit-mode";

// The tab used last in this browser tab; #logic links straight to logic mode.
// Read as an external store so the prerendered page (always Analog) hydrates
// cleanly before switching.
const noSubscription = () => () => {};
const storedMode = (): Mode =>
    window.location.hash === "#logic" || sessionStorage.getItem(MODE_KEY) === "logic" ? "logic" : "analog";

export function CircuitPage() {
    const initialMode = useSyncExternalStore(noSubscription, storedMode, () => "analog" as const);
    const [chosenMode, setChosenMode] = useState<Mode | null>(null);
    const mode = chosenMode ?? initialMode;

    const changeMode = (next: string) => {
        setChosenMode(next as Mode);
        sessionStorage.setItem(MODE_KEY, next);
    };

    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/10 px-4 py-2 sm:py-0">
                <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-1.5">
                        <CircuitBoard className="size-4 text-primary" />
                    </div>
                    <h1 className="text-xs font-black uppercase tracking-widest text-foreground">Circuit Simulator</h1>
                </div>
                <Tabs value={mode} onValueChange={changeMode}>
                    <TabsList className="h-9 bg-muted/50">
                        <TabsTrigger value="analog" className="px-3 text-[11px] font-bold uppercase tracking-wide">
                            Analog
                        </TabsTrigger>
                        <TabsTrigger value="logic" className="px-3 text-[11px] font-bold uppercase tracking-wide">
                            Logic gates
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="min-h-0 flex-1">{mode === "analog" ? <AnalogSimulator /> : <LogicSimulator />}</div>
        </div>
    );
}
