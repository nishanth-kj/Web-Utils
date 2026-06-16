"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Columns, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface TableViewerProps {
    data: Record<string, string>[];
    onDataChange: (newData: Record<string, string>[]) => void;
}

export function TableViewer({ data, onDataChange }: TableViewerProps) {
    const [rows, setRows] = useState<Record<string, string>[]>(data);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [editingHeader, setEditingHeader] = useState<string | null>(null);
    const [headerEditValue, setHeaderEditValue] = useState("");

    useEffect(() => {
        setRows(data);
    }, [data]);

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    const activeHeaders = headers.filter(header => visibleColumns[header] !== false);

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
            const valA = a[key] || "";
            const valB = b[key] || "";
            return direction === 'asc' 
                ? valA.localeCompare(valB, undefined, { numeric: true }) 
                : valB.localeCompare(valA, undefined, { numeric: true });
        });
        setRows(sortedRows);
    };

    const handleHeaderRename = (oldHeader: string, newHeader: string) => {
        const trimmedNew = newHeader.trim();
        if (!trimmedNew || oldHeader === trimmedNew || headers.includes(trimmedNew)) {
            setEditingHeader(null);
            return;
        }

        const newData = rows.map(row => {
            const newRow = { ...row };
            if (oldHeader in newRow) {
                newRow[trimmedNew] = newRow[oldHeader];
                delete newRow[oldHeader];
            }
            return newRow;
        });

        setColumnWidths(prev => {
            const next = { ...prev };
            if (oldHeader in next) {
                next[trimmedNew] = next[oldHeader];
                delete next[oldHeader];
            }
            return next;
        });

        setVisibleColumns(prev => {
            const next = { ...prev };
            if (oldHeader in next) {
                next[trimmedNew] = next[oldHeader];
                delete next[oldHeader];
            }
            return next;
        });

        setRows(newData);
        onDataChange(newData);
        setEditingHeader(null);
        
        if (sortConfig.key === oldHeader) {
            setSortConfig(prev => ({ ...prev, key: trimmedNew }));
        }
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

    const handleResizeStart = (e: React.MouseEvent, header: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const th = (e.target as HTMLElement).closest('th');
        const startWidth = th ? th.getBoundingClientRect().width : 150;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
            setColumnWidths(prev => ({
                ...prev,
                [header]: newWidth
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };

        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const toggleColumn = (header: string) => {
        setVisibleColumns(prev => ({
            ...prev,
            [header]: prev[header] === false ? true : false
        }));
    };

    if (rows.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                <p className="text-zinc-500 font-medium mb-4">No tabular data detected or empty dataset.</p>
                <Button variant="outline" size="sm" className="rounded-lg font-bold" onClick={() => {
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
        <div className="space-y-2">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2 size-4 text-zinc-500" />
                    <Input 
                        placeholder="Search data..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 w-full bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-lg font-bold gap-2 h-8">
                                <Columns className="size-4" /> Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Toggle Columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {headers.map((header) => (
                                <DropdownMenuCheckboxItem
                                    key={header}
                                    className="capitalize font-medium text-xs"
                                    checked={visibleColumns[header] !== false}
                                    onCheckedChange={() => toggleColumn(header)}
                                >
                                    {header}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={addRow} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm gap-2 h-8">
                        <Plus className="size-4" /> Add Row
                    </Button>
                </div>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm overflow-x-auto">
                <Table style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
                    <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                            {activeHeaders.map(header => (
                                <TableHead
                                    key={header}
                                    style={{ width: columnWidths[header] ? `${columnWidths[header]}px` : '150px' }}
                                    className="relative font-black text-zinc-600 dark:text-zinc-400 uppercase text-[10px] tracking-widest px-6 py-4"
                                >
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        onClick={() => {
                                            if (editingHeader !== header) handleSort(header);
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            setEditingHeader(header);
                                            setHeaderEditValue(header);
                                        }}
                                    >
                                        {editingHeader === header ? (
                                            <Input
                                                value={headerEditValue}
                                                onChange={(e) => setHeaderEditValue(e.target.value)}
                                                onBlur={() => handleHeaderRename(header, headerEditValue)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleHeaderRename(header, headerEditValue);
                                                    if (e.key === 'Escape') setEditingHeader(null);
                                                }}
                                                autoFocus
                                                className="h-6 text-[10px] font-black uppercase tracking-widest px-1 py-0 w-full"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <>
                                                <span className="truncate" title="Double-click to rename">{header}</span>
                                                {sortConfig.key === header ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="size-3 shrink-0" /> : <ArrowDown className="size-3 shrink-0" />
                                                ) : (
                                                    <ArrowUpDown className="size-3 opacity-30 shrink-0" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div
                                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-indigo-500/50 bg-transparent z-10 transition-colors"
                                        onMouseDown={(e) => handleResizeStart(e, header)}
                                    />
                                </TableHead>
                            ))}
                            <TableHead className="w-[80px] px-6 py-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all border-zinc-100 dark:border-zinc-800/50 group">
                                {activeHeaders.map(header => {
                                    const cellValue = row[header] || "";
                                    const isMatch = searchQuery && cellValue.toLowerCase().includes(searchQuery.toLowerCase());
                                    
                                    return (
                                        <TableCell key={header} className="p-2 px-4" style={{ width: columnWidths[header] ? `${columnWidths[header]}px` : '150px' }}>
                                            <Input
                                                value={cellValue}
                                                onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                                className={`h-9 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 shadow-none focus-visible:ring-0 transition-all text-sm font-medium w-full ${isMatch ? 'bg-yellow-200/50 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-100' : 'bg-transparent'}`}
                                            />
                                        </TableCell>
                                    );
                                })}
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
