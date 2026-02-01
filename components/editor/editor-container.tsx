"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Save,
    Check,
    FileEdit,
    RotateCcw,
    FileType,

    Download,
    Terminal,
    Plus,
    Table as TableIcon,
    Code,
    ChevronDown,
    Trash,
    Eye,

} from "lucide-react";
import { CodeViewer } from '@/components/shared/code-viewer';
import { TableViewer } from '@/components/shared/table-viewer';
import { Format, EditorProps } from '@/types';
import yaml from 'js-yaml';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { PREVIEWABLE_FORMATS, ALL_FORMATS, getLanguage } from '@/lib/formats';

export function EditorContainer({ initialContent, initialFormat }: EditorProps) {
    const router = useRouter();
    const [content, setContent] = useState(initialContent);
    const [format, setFormat] = useState<Format>(initialFormat);
    const [fileName, setFileName] = useState("index");
    const [isSaved, setIsSaved] = useState(true);
    const [copied, setCopied] = useState(false);
    const [wordWrap, setWordWrap] = useState(true);
    const [autoFormat, setAutoFormat] = useState(false);
    const [viewMode, setViewMode] = useState<'code' | 'table'>('code');
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const codeViewerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (codeViewerRef.current) {
            codeViewerRef.current.scrollTop = e.currentTarget.scrollTop;
            codeViewerRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    const updateCursorPosition = (e: React.UIEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget as HTMLTextAreaElement;
        const textBeforeCursor = target.value.substring(0, target.selectionStart);
        const lines = textBeforeCursor.split("\n");
        setCursorPos({
            line: lines.length,
            col: lines[lines.length - 1].length + 1
        });
    };

    const [prevInitialContent, setPrevInitialContent] = useState(initialContent);
    const [prevInitialFormat, setPrevInitialFormat] = useState(initialFormat);

    // Sync to sessionStorage automatically for the Viewer to pick up
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(`web-viewer-content-${format}`, content);
        }
    }, [content, format]);

    if (initialContent !== prevInitialContent || initialFormat !== prevInitialFormat) {
        setPrevInitialContent(initialContent);
        setPrevInitialFormat(initialFormat);
        setContent(initialContent);
        setFormat(initialFormat);
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFormat = () => {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(content);
                setContent(JSON.stringify(parsed, null, 2));
            } else if (format === 'yaml') {
                const parsed = yaml.load(content);
                setContent(yaml.dump(parsed));
            }
            setIsSaved(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = () => {
        setIsSaved(true);
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${fileName}.${getLanguage(format)}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleNewFile = () => {
        setContent("");
        setFileName("untitled");
        setIsSaved(true);
        setViewMode('code');
    };

    const handleNewTable = () => {
        const defaultTable = JSON.stringify([
            { id: "1", name: "Sample Item", price: "$10.00" },
            { id: "2", name: "Another Item", price: "$20.00" }
        ], null, 2);
        setContent(defaultTable);
        setFormat('json');
        setFileName("table");
        setIsSaved(false);
        setViewMode('table');
    };

    const handleTableDataChange = (newData: Record<string, string>[]) => {
        setContent(JSON.stringify(newData, null, 2));
        setIsSaved(false);
    };

    const isTabularData = () => {
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object';
        } catch {
            return false;
        }
    };

    const isPreviewable = PREVIEWABLE_FORMATS.includes(format.toLowerCase());

    const handlePreview = () => {
        if (isPreviewable) {
            router.push(`/view/${format}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-sans border-t border-zinc-200 dark:border-zinc-800">
            {/* Notepad-style Ribbon Toolbar */}
            <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                {/* Menu Bar */}
                <div className="flex items-center px-1 py-0.5 gap-1 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-none">
                                File
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-none min-w-[180px]">
                            <DropdownMenuItem onClick={handleNewFile} className="gap-2 text-xs">
                                <Plus className="size-3.5" /> New File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleNewTable} className="gap-2 text-xs">
                                <TableIcon className="size-3.5" /> New Table
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSave} className="gap-2 text-xs">
                                <Save className="size-3.5" /> Save to System
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setContent("")} className="gap-2 text-xs text-red-500">
                                <Trash className="size-3.5" /> Clear Content
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-none">
                                Options
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-none min-w-[200px]">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-zinc-400">Editor Settings</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setWordWrap(!wordWrap)} className="justify-between text-xs">
                                Word Wrap
                                <span className="text-[10px] text-zinc-400 font-mono">{wordWrap ? "ON" : "OFF"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAutoFormat(!autoFormat)} className="justify-between text-xs">
                                Auto-Format
                                <span className="text-[10px] text-zinc-400 font-mono">{autoFormat ? "ON" : "OFF"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-zinc-400">Language / Format</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={format} onValueChange={(v) => setFormat(v as Format)}>
                                {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                    <DropdownMenuRadioItem key={fmt} value={fmt} className="text-xs uppercase">
                                        {fmt}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <div className="p-2">
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-zinc-400 mb-1 text-left">Custom Format</DropdownMenuLabel>
                                <input
                                    type="text"
                                    placeholder="e.g. cpp, rust"
                                    className="w-full h-7 px-2 text-xs border rounded bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-1 ring-indigo-500"
                                    defaultValue={format}
                                    onBlur={(e) => {
                                        if (e.target.value) setFormat(e.target.value.toLowerCase());
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') setFormat(e.currentTarget.value.toLowerCase());
                                    }}
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="sm" onClick={handleFormat} className="h-7 px-3 text-[11px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-none">
                        Format Code
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-3 text-[11px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-none gap-2">
                        {copied ? <Check className="size-3 text-green-500" /> : null}
                        {copied ? "Copied" : "Copy"}
                    </Button>

                    {isPreviewable && (
                        <Button variant="ghost" size="sm" onClick={handlePreview} className="h-7 px-3 text-[11px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-none text-indigo-600 dark:text-indigo-400 gap-1.5 transition-all">
                            <Eye className="size-3" /> View in Viewer
                        </Button>
                    )}
                </div>

                {/* Quick Actions Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 group">
                            <div className="p-1.5 bg-indigo-500/10 rounded-md">
                                <FileEdit className="size-4 text-indigo-500" />
                            </div>
                            <div className="flex items-center gap-1 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors py-1">
                                <input
                                    type="text"
                                    value={fileName.includes('.') ? fileName : `${fileName}.${getLanguage(format)}`}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-zinc-700 dark:text-zinc-200 w-auto min-w-[120px]"
                                    style={{ width: `${Math.max(fileName.length + (fileName.includes('.') ? 0 : getLanguage(format).length + 1), 10)}ch` }}
                                    spellCheck={false}
                                />
                            </div>
                            {!isSaved && <div className="size-2 rounded-full bg-amber-500 animate-pulse" />}
                        </div>

                        {isTabularData() && (
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-1">
                                <Button
                                    variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('code')}
                                    className={`h-7 px-3 rounded-md text-[11px] gap-1.5 transition-all ${viewMode === 'code' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500'}`}
                                >
                                    <Code className="size-3.5" /> Code
                                </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className={`h-7 px-3 rounded-md text-[11px] gap-1.5 transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500'}`}
                                >
                                    <TableIcon className="size-3.5" /> Table
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isPreviewable && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreview}
                                className="h-8 border-indigo-200 dark:border-indigo-900 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 gap-2 font-bold px-4 rounded-md text-xs transition-all"
                            >
                                <Eye className="size-3.5" /> Preview
                            </Button>
                        )}
                        <Button onClick={handleSave} size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-4 rounded-md text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                            <Download className="size-3.5" /> Download
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative overflow-hidden">
                    {viewMode === 'code' ? (
                        <>
                            {/* Line Numbers Column */}
                            <div className="absolute top-0 left-0 w-12 h-full bg-zinc-50/50 dark:bg-zinc-900/20 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-end pr-3 pt-4 text-[11px] font-mono text-zinc-400 select-none overflow-hidden z-20">
                                {content.split('\n').map((_, i) => (
                                    <div key={i} className="h-[21px] flex items-center shrink-0">{i + 1}</div>
                                ))}
                            </div>

                            <div className="absolute inset-0 left-12">
                                <CodeViewer
                                    ref={codeViewerRef}
                                    content={content}
                                    language={getLanguage(format)}
                                    className="absolute inset-0 pointer-events-none p-4 font-mono text-[14px] leading-[21px] border-none rounded-none overflow-hidden opacity-100 bg-transparent"
                                    showLineNumbers={false}
                                    wrapLines={wordWrap}
                                />
                                <textarea
                                    className={`absolute inset-0 w-full h-full p-4 font-mono text-[14px] bg-transparent resize-none outline-none focus:ring-0 text-transparent caret-zinc-800 dark:caret-zinc-100 leading-[21px] z-10 custom-scrollbar selection:bg-indigo-500/30 ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        setIsSaved(false);
                                    }}
                                    onScroll={handleScroll}
                                    onSelect={updateCursorPosition}
                                    onKeyUp={updateCursorPosition}
                                    onClick={updateCursorPosition}
                                    spellCheck={false}
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    autoCorrect="off"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="p-8 h-full overflow-auto custom-scrollbar bg-white dark:bg-zinc-950">
                            <TableViewer
                                data={JSON.parse(content)}
                                onDataChange={handleTableDataChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Footer / Status Bar */}
            <div className="h-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between px-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <FileType className="size-3" />
                        <span>UTF-8</span>
                    </div>
                    <span>Spaces: 4</span>
                    <div className="w-px h-2.5 bg-zinc-300 dark:bg-zinc-700" />

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-indigo-500 transition-colors uppercase font-bold text-indigo-600 outline-none">
                            {format} <ChevronDown className="size-2.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none min-w-[120px]">
                            {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                <DropdownMenuItem key={fmt} onClick={() => setFormat(fmt)} className="text-[10px] uppercase font-bold">
                                    {fmt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-2.5 bg-zinc-300 dark:border-zinc-700" />
                    <div className="flex items-center gap-1 text-green-500 font-bold">
                        <Terminal className="size-3" />
                        <span>{content.length} characters</span>
                        <div className="ml-2 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="In Sync" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span>Line {cursorPos.line}, Col {cursorPos.col}</span>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <RotateCcw className="size-3" />
                        <span>Notepad+ v1.0</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(161, 161, 170, 0.4); }
                textarea { scrollbar-width: thin; scrollbar-color: rgba(161, 161, 170, 0.2) transparent; }
            `}} />
        </div>
    );
}
