"use client";

import { memo } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "reactflow";

function RefEdgeImpl({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd }: EdgeProps) {
    const [path] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 8 });
    return <BaseEdge path={path} markerEnd={markerEnd} style={{ stroke: "#0ea5e9", strokeWidth: 1.5, fill: "none" }} />;
}

export const RefEdge = memo(RefEdgeImpl);
