"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "reactflow";
import { X } from "lucide-react";

export type FkEdgeData = {
    onDelete: () => void;
};

// A plain smoothstep edge plus an always-visible delete button at its midpoint — foreign
// keys are relationships between two nodes, not something either node's own UI can host,
// so unlike table/column deletion this needs its own explicit, always-visible affordance
// rather than relying on select-then-press-Delete (easy to miss, and easy to mis-click on
// a thin curved line).
function FkEdgeImpl({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data }: EdgeProps<FkEdgeData>) {
    const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

    return (
        <>
            <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: "all",
                    }}
                    className="nodrag nopan"
                >
                    <button
                        type="button"
                        className="flex size-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-destructive hover:text-destructive"
                        title="Remove this relationship"
                        onClick={(e) => {
                            e.stopPropagation();
                            data?.onDelete();
                        }}
                    >
                        <X className="size-2.5" />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export const FkEdge = memo(FkEdgeImpl);
