"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { KeyRound, Link2, Table as TableIcon } from "lucide-react";
import type { ParsedTable } from "@/lib/sql-visu/types";
import { TABLE_NODE_WIDTH } from "@/lib/sql-visu/er-layout";

export type TableNodeData = { table: ParsedTable };

function TableNodeImpl({ data }: NodeProps<TableNodeData>) {
    const { table } = data;

    return (
        <div
            className="rounded-lg border border-border bg-card shadow-md overflow-hidden"
            style={{ width: TABLE_NODE_WIDTH }}
        >
            <div className="h-10 flex items-center gap-2 px-3 bg-primary/10 border-b border-border">
                <TableIcon className="size-3.5 text-primary shrink-0" />
                <span className="text-xs font-black uppercase tracking-wide text-foreground truncate">
                    {table.name}
                </span>
            </div>

            <div>
                {table.columns.length === 0 && (
                    <div className="h-7 flex items-center px-3 text-[10px] text-muted-foreground italic">
                        No columns
                    </div>
                )}
                {table.columns.map((column) => (
                    <div
                        key={column.name}
                        className="relative h-7 flex items-center justify-between gap-2 px-3 border-b border-border/50 last:border-b-0 text-[11px]"
                    >
                        <Handle
                            type="target"
                            id={column.name}
                            position={Position.Left}
                            className="!size-1.5 !bg-muted-foreground/50 !border-none"
                            style={{ top: "50%" }}
                        />
                        <span className="flex items-center gap-1.5 min-w-0">
                            {column.isPrimaryKey && <KeyRound className="size-3 text-amber-500 shrink-0" />}
                            {column.isForeignKey && <Link2 className="size-3 text-sky-500 shrink-0" />}
                            <span className={`truncate ${column.isPrimaryKey ? "font-bold" : "font-medium"}`}>
                                {column.name}
                            </span>
                        </span>
                        <span className="text-muted-foreground shrink-0 text-[10px] font-mono">
                            {column.dataType}
                            {column.isNotNull ? "*" : ""}
                        </span>
                        <Handle
                            type="source"
                            id={column.name}
                            position={Position.Right}
                            className="!size-1.5 !bg-muted-foreground/50 !border-none"
                            style={{ top: "50%" }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const TableNode = memo(TableNodeImpl);
