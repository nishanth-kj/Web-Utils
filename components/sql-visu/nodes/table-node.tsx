"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { KeyRound, Link2, Table as TableIcon, Plus, X } from "lucide-react";
import type { ParsedTable } from "@/lib/sql-visu/types";
import { TABLE_NODE_WIDTH } from "@/lib/sql-visu/er-layout";

export type TableNodeData = {
    table: ParsedTable;
    onAddColumn: (tableName: string) => void;
    onDropColumn: (tableName: string, columnName: string) => void;
    onDropTable: (tableName: string) => void;
};

function TableNodeImpl({ data }: NodeProps<TableNodeData>) {
    const { table, onAddColumn, onDropColumn, onDropTable } = data;

    return (
        <div
            className="group rounded-lg border border-border bg-card shadow-md overflow-hidden"
            style={{ width: TABLE_NODE_WIDTH }}
        >
            <div className="h-10 flex items-center gap-2 px-3 bg-primary/10 border-b border-border">
                <TableIcon className="size-3.5 text-primary shrink-0" />
                <span className="text-xs font-black uppercase tracking-wide text-foreground truncate flex-1">
                    {table.name}
                </span>
                <button
                    type="button"
                    className="nodrag shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    title="Drop table"
                    onClick={() => {
                        if (confirm(`Drop table "${table.name}"? This removes it — and any foreign keys pointing to it — from the DDL.`)) {
                            onDropTable(table.name);
                        }
                    }}
                >
                    <X className="size-3.5" />
                </button>
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
                        className="group/row relative h-7 flex items-center justify-between gap-2 px-3 border-b border-border/50 last:border-b-0 text-[11px]"
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
                        <span className="flex items-center gap-1 shrink-0">
                            <span className="text-muted-foreground text-[10px] font-mono">
                                {column.dataType}
                                {column.isNotNull ? "*" : ""}
                            </span>
                            <button
                                type="button"
                                className="nodrag rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/row:opacity-100"
                                title="Drop column"
                                onClick={() => onDropColumn(table.name, column.name)}
                            >
                                <X className="size-3" />
                            </button>
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

            <button
                type="button"
                className="nodrag flex h-7 w-full items-center justify-center gap-1.5 border-t border-border/50 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onAddColumn(table.name)}
            >
                <Plus className="size-3" /> Add Column
            </button>
        </div>
    );
}

export const TableNode = memo(TableNodeImpl);
