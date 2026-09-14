"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { StackFrame } from "@/lib/code-visualizer/types";
import { FRAME_NODE_WIDTH } from "@/lib/code-visualizer/layout";

export type FrameNodeData = { frame: StackFrame };

function FrameNodeImpl({ data }: NodeProps<FrameNodeData>) {
    const { frame } = data;

    return (
        <div className="rounded-lg border border-border bg-card shadow-md overflow-hidden" style={{ width: FRAME_NODE_WIDTH }}>
            <div className="h-8 flex items-center px-3 bg-primary/10 border-b border-border">
                <span className="text-[11px] font-black uppercase tracking-wide text-foreground truncate">
                    {frame.name}
                </span>
            </div>
            <div>
                {frame.variables.length === 0 && (
                    <div className="h-6 flex items-center px-3 text-[10px] text-muted-foreground italic">(empty)</div>
                )}
                {frame.variables.map((v) => (
                    <div
                        key={v.name}
                        className="relative h-6 flex items-center justify-between gap-2 px-3 border-b border-border/50 last:border-b-0 text-[11px]"
                    >
                        <span className="font-mono font-medium truncate">{v.name}</span>
                        {v.value.kind === "primitive" ? (
                            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[110px]" title={v.value.display}>
                                {v.value.display}
                            </span>
                        ) : (
                            <span className="size-1.5 rounded-full bg-sky-500 shrink-0" />
                        )}
                        {v.value.kind === "ref" && (
                            <Handle
                                type="source"
                                id={`var:${v.name}`}
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

export const FrameNode = memo(FrameNodeImpl);
