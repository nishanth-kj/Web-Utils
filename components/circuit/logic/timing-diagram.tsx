"use client";

import React from "react";
import { HIGH_COLOR } from "./logic-runtime";

export interface TimingSample {
    time: number;
    values: Record<string, boolean>;
}

export interface TimingSignal {
    key: string;
    label: string;
}

const WIDTH = 600;
const ROW = 22;
const HIGH_Y = 4;
const LOW_Y = 18;

// Logic-analyzer style timing diagram: one step trace per signal over the
// last `window` seconds of simulated time, newest at the right.
export function TimingDiagram({ signals, samples, now, window = 10 }: { signals: TimingSignal[]; samples: TimingSample[]; now: number; window?: number }) {
    const start = now - window;
    const x = (time: number) => (((time - start) / window) * WIDTH).toFixed(1);

    const trace = (key: string) => {
        // Value in force at the left edge: the last sample before the window.
        let value = false;
        for (const sample of samples) {
            if (sample.time > start) break;
            value = Boolean(sample.values[key]);
        }
        let path = `M0 ${value ? HIGH_Y : LOW_Y}`;
        for (const sample of samples) {
            if (sample.time <= start) continue;
            const next = Boolean(sample.values[key]);
            if (next !== value) {
                path += `H${x(sample.time)}V${next ? HIGH_Y : LOW_Y}`;
                value = next;
            }
        }
        return `${path}H${WIDTH}`;
    };

    if (signals.length === 0) {
        return <p className="p-3 text-xs text-muted-foreground">Add switches, clocks, flip-flops or LEDs to trace them here.</p>;
    }

    return (
        <div className="space-y-0.5 p-2" role="img" aria-label={`Timing diagram of ${signals.map((s) => s.label).join(", ")} over the last ${window} seconds`}>
            {signals.map((signal) => (
                <div key={signal.key} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 truncate text-right font-mono text-[10px] font-semibold">{signal.label}</span>
                    <svg viewBox={`0 0 ${WIDTH} ${ROW}`} preserveAspectRatio="none" className="h-[22px] min-w-0 flex-1 rounded bg-muted/40">
                        <path d={trace(signal.key)} fill="none" stroke={HIGH_COLOR} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            ))}
            <div className="flex justify-between pl-[72px] font-mono text-[9px] text-muted-foreground">
                <span>−{window} s</span>
                <span>now</span>
            </div>
        </div>
    );
}
