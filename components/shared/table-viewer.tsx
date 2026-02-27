"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface TableViewerProps {
    data: Record<string, string>[];
    onDataChange: (newData: Record<string, string>[]) => void;
}

export function TableViewer({ data, onDataChange }: TableViewerProps) {
    const [rows, setRows] = useState<Record<string, string>[]>(data);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

    useEffect(() => {
        setRows(data);
    }, [data]);

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }

        setSortConfig({ key, direction });

        if (direction === null) {
            setRows(data);
            return;
        }

        const sortedRows = [...rows].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setRows(sortedRows);
    };

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
            <div className="p-12 text-center border-2 border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                <p className="text-zinc-500 font-medium mb-4">No tabular data detected or empty dataset.</p>
                <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => {
                    const initialData = [{ id: "1", name: "", value: "" }];
                    setRows(initialData);
                    onDataChange(initialData);
                }}>
                    Initialize Table
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Data Editor</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Directly edit values below</p>
                </div>
                <Button onClick={addRow} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 gap-2">
                    <Plus className="size-4" /> Add New Row
                </Button>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-xl overflow-x-auto">
                <Table>
                    <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                            {headers.map(header => (
                                <TableHead
                                    key={header}
                                    onClick={() => handleSort(header)}
                                    className="font-black text-zinc-600 dark:text-zinc-400 uppercase text-[10px] tracking-widest px-6 py-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        {header}
                                        {sortConfig.key === header ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                                        ) : (
                                            <ArrowUpDown className="size-3 opacity-30" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-[80px] px-6 py-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all border-zinc-100 dark:border-zinc-800/50 group">
                                {headers.map(header => (
                                    <TableCell key={header} className="p-2 px-4">
                                        <Input
                                            value={row[header] || ""}
                                            onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                            className="h-9 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 bg-transparent shadow-none focus-visible:ring-0 transition-all text-sm font-medium"
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="p-2 px-4 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
