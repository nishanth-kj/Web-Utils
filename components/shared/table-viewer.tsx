"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface TableViewerProps {
    data: Record<string, string>[];
    onDataChange: (newData: Record<string, string>[]) => void;
}

export function TableViewer({ data, onDataChange }: TableViewerProps) {
    const [rows, setRows] = useState<Record<string, string>[]>(data);

    useEffect(() => {
        setRows(data);
    }, [data]);

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    const handleCellChange = (rowIndex: number, key: string, value: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [key]: value };
        setRows(newRows);
        onDataChange(newRows);
    };

    const addRow = () => {
        const newRow = headers.reduce((acc, header) => ({ ...acc, [header]: "" }), {});
        const newRows = [...rows, newRow];
        setRows(newRows);
        onDataChange(newRows);
    };

    const deleteRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        onDataChange(newRows);
    };

    if (rows.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed rounded-xl text-zinc-500">
                No tabular data detected or empty dataset.
                <Button variant="outline" size="sm" className="mt-4 block mx-auto" onClick={() => setRows([{ id: "1", name: "", value: "" }])}>
                    Initialize Table
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Interactive Editor</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
                        <Plus className="size-4" /> Add Row
                    </Button>
                </div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                        <TableRow>
                            {headers.map(header => (
                                <TableHead key={header} className="font-bold text-zinc-900 dark:text-white uppercase text-[10px] tracking-widest px-4 py-3">
                                    {header}
                                </TableHead>
                            ))}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors border-zinc-100 dark:border-zinc-800">
                                {headers.map(header => (
                                    <TableCell key={header} className="p-2">
                                        <Input
                                            value={row[header] || ""}
                                            onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                            className="h-8 border-transparent hover:border-zinc-200 focus:border-indigo-500 bg-transparent shadow-none focus-visible:ring-0 transition-all text-sm"
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => deleteRow(rowIndex)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
