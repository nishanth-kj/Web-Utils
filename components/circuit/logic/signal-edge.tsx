"use client";

import React, { memo, useContext } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "reactflow";
import { HIGH_COLOR, LOW_COLOR, LogicRuntimeContext } from "./logic-runtime";

function SignalEdgeImpl({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected }: EdgeProps) {
    const runtime = useContext(LogicRuntimeContext);
    const high = Boolean(runtime?.result.wires[id]);
    const [path] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 4, offset: 14 });
    return (
        <BaseEdge
            id={id}
            path={path}
            interactionWidth={18}
            style={{ stroke: high ? HIGH_COLOR : LOW_COLOR, strokeWidth: selected ? 4 : 2.5, opacity: selected ? 1 : 0.9 }}
        />
    );
}

export const SignalEdge = memo(SignalEdgeImpl);
