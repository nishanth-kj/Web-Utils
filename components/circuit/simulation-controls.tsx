"use client";

import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SimStatus = "running" | "paused" | "stopped";

interface SimulationControlsProps {
    status: SimStatus;
    onRun: () => void;
    onPause: () => void;
    onStop: () => void;
    /** Extra status text, e.g. the simulated time. */
    detail?: string;
}

const STATUS_TEXT: Record<SimStatus, string> = { running: "Running", paused: "Paused", stopped: "Stopped" };

// Proteus-style run / pause / stop buttons shared by both circuit modes.
export function SimulationControls({ status, onRun, onPause, onStop, detail }: SimulationControlsProps) {
    return (
        <div role="group" aria-label="Simulation" className="flex items-center gap-0.5 rounded-lg border bg-background p-0.5">
            <Button
                variant="ghost"
                size="icon"
                className={cn("size-8", status === "running" && "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400")}
                onClick={onRun}
                aria-label="Run simulation"
                aria-pressed={status === "running"}
                title="Run"
            >
                <Play className="size-4" fill={status === "running" ? "currentColor" : "none"} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={cn("size-8", status === "paused" && "bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400")}
                onClick={onPause}
                disabled={status === "stopped"}
                aria-label="Pause simulation"
                aria-pressed={status === "paused"}
                title="Pause"
            >
                <Pause className="size-4" fill={status === "paused" ? "currentColor" : "none"} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={cn("size-8", status === "stopped" && "bg-muted text-foreground")}
                onClick={onStop}
                disabled={status === "stopped"}
                aria-label="Stop simulation"
                aria-pressed={status === "stopped"}
                title="Stop (clears all readings)"
            >
                <Square className="size-3.5" fill={status === "stopped" ? "currentColor" : "none"} />
            </Button>
            <span className="px-2 font-mono text-[11px] tabular-nums text-muted-foreground" aria-live="polite">
                {STATUS_TEXT[status]}
                {detail && status !== "stopped" ? ` · ${detail}` : ""}
            </span>
        </div>
    );
}

// Shown over the canvas while the simulation isn't running.
export function SimulationNotice({ status }: { status: SimStatus }) {
    if (status === "running") return null;
    return (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background/95 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
            {status === "paused" ? "Paused: readings are frozen. Press Run to continue." : "Stopped: press Run to start the simulation."}
        </div>
    );
}
