"use client";

import React, { memo, useContext } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "reactflow";
import { AnalogRuntimeContext } from "./runtime";

// Below this the wire is drawn as carrying no current.
const MIN_VISIBLE_CURRENT = 1e-6;

function WireEdgeImpl({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected }: EdgeProps) {
    const runtime = useContext(AnalogRuntimeContext);
    const current = runtime?.result.wireCurrents[id] ?? 0;
    const [path] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 0, offset: 16 });

    const magnitude = Math.abs(current);
    // Faster dashes for more current: about 2 s per cycle at 1 mA, 0.7 s at 1 A.
    const duration = Math.min(3, Math.max(0.25, 2.2 - 0.5 * Math.log10(magnitude * 1000)));

    return (
        <>
            <BaseEdge
                id={id}
                path={path}
                interactionWidth={18}
                style={{ stroke: selected ? "var(--primary)" : "var(--muted-foreground)", strokeWidth: selected ? 3 : 2 }}
            />
            {magnitude > MIN_VISIBLE_CURRENT && (
                <path
                    d={path}
                    fill="none"
                    className="circuit-flow pointer-events-none text-amber-500"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="4 10"
                    // Current runs from the wire's source terminal to its target when positive.
                    style={{ animationDuration: `${duration}s`, animationDirection: current > 0 ? "normal" : "reverse" }}
                />
            )}
        </>
    );
}

export const WireEdge = memo(WireEdgeImpl);
