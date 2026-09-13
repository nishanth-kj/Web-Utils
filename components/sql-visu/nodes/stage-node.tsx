"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
    Database,
    Filter,
    GitMerge,
    Layers,
    ListOrdered,
    ScissorsLineDashed,
    SlidersHorizontal,
    SquareStack,
    Table as TableIcon,
} from "lucide-react";
import type { QueryStage, QueryStageKind } from "@/lib/sql-visu/types";
import { STAGE_NODE_WIDTH } from "@/lib/sql-visu/query-flow-layout";

export type StageNodeData = { stage: QueryStage };

const KIND_STYLES: Record<QueryStageKind, { icon: typeof TableIcon; className: string }> = {
    source: { icon: TableIcon, className: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400" },
    cte: { icon: Database, className: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" },
    subquery: { icon: SquareStack, className: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" },
    join: { icon: GitMerge, className: "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400" },
    filter: { icon: Filter, className: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" },
    groupby: { icon: Layers, className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
    having: { icon: ScissorsLineDashed, className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
    select: { icon: SlidersHorizontal, className: "bg-primary/10 border-primary/30 text-primary" },
    orderby: { icon: ListOrdered, className: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400" },
    limit: { icon: ListOrdered, className: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400" },
};

function StageNodeImpl({ data }: NodeProps<StageNodeData>) {
    const { stage } = data;
    const { icon: Icon, className } = KIND_STYLES[stage.kind];

    return (
        <div
            className={`rounded-lg border shadow-md overflow-hidden bg-card ${className}`}
            style={{ width: STAGE_NODE_WIDTH }}
        >
            <Handle type="target" position={Position.Top} className="!bg-muted-foreground/50 !border-none" />

            <div className="h-[34px] flex items-center gap-2 px-3 border-b border-inherit bg-background/40">
                <Icon className="size-3.5 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wide truncate">{stage.title}</span>
            </div>

            <div className="px-3 py-2 space-y-1">
                {stage.lines.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground italic">—</div>
                ) : (
                    stage.lines.map((line, i) => (
                        <div key={i} className="text-[10px] font-mono text-foreground/80 break-words leading-[18px]">
                            {line}
                        </div>
                    ))
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/50 !border-none" />
        </div>
    );
}

export const StageNode = memo(StageNodeImpl);
