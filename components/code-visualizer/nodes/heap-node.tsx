"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { HeapObject } from "@/lib/code-visualizer/types";
import { HEAP_NODE_WIDTH } from "@/lib/code-visualizer/layout";

export type HeapNodeData = { object: HeapObject };

const KIND_COLOR: Record<HeapObject["kind"], string> = {
    list: "bg-emerald-500/10",
    tuple: "bg-emerald-500/10",
    dict: "bg-amber-500/10",
    set: "bg-amber-500/10",
    object: "bg-violet-500/10",
    function: "bg-muted",
};

function HeapNodeImpl({ data }: NodeProps<HeapNodeData>) {
    const { object } = data;

    return (
        <div className="relative rounded-lg border border-border bg-card shadow-md overflow-hidden" style={{ width: HEAP_NODE_WIDTH }}>
            <Handle type="target" id="in" position={Position.Left} className="!size-1.5 !bg-sky-500 !border-none" style={{ top: 16 }} />
            <div className={`h-8 flex items-center px-3 border-b border-border ${KIND_COLOR[object.kind]}`}>
                <span className="text-[11px] font-black text-foreground truncate">{object.label}</span>
            </div>
            <div>
                {object.entries.length === 0 && (
                    <div className="h-6 flex items-center px-3 text-[10px] text-muted-foreground italic">(empty)</div>
                )}
                {object.entries.map((entry) => (
                    <div
                        key={entry.key}
                        className="relative h-6 flex items-center justify-between gap-2 px-3 border-b border-border/50 last:border-b-0 text-[11px]"
                    >
                        <span className="font-mono text-[10px] text-muted-foreground truncate">{entry.key}</span>
                        {entry.value.kind === "primitive" ? (
                            <span className="font-mono text-[10px] truncate max-w-[110px]" title={entry.value.display}>
                                {entry.value.display}
                            </span>
                        ) : (
                            <span className="size-1.5 rounded-full bg-sky-500 shrink-0" />
                        )}
                        {entry.value.kind === "ref" && (
                            <Handle
                                type="source"
                                id={`entry:${entry.key}`}
                                position={Position.Right}
                                className="!size-1.5 !bg-sky-500 !border-none"
                                style={{ top: "50%" }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export const HeapNode = memo(HeapNodeImpl);
