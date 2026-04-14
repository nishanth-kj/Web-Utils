"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
    Save,
    FileEdit,
    Terminal,
    Plus,
    Table as TableIcon,
    Code,
    Trash,
    Eye,
    Copy as CopyIcon,
    Check
} from "lucide-react";
import { TableViewer } from '@/components/shared/table-viewer';
import { ContainerProps, Format } from '@/types';
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
import { useEditor } from '@/lib/hooks/use-editor';
import { PREVIEWABLE_FORMATS, ALL_FORMATS, getLanguage } from '@/lib/formats';
import { Separator } from '@/components/ui/separator';

export function EditorContainer({ initialContent, initialFormat }: ContainerProps) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const { content, setContent, format, setFormat, isSaved, setIsSaved } = useEditor({
        initialContent,
        initialFormat,
    });

    const [fileName, setFileName] = useState(`index.${getLanguage(initialFormat)}`);
    const [copied, setCopied] = useState(false);
    const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
    const [viewMode, setViewMode] = useState<'code' | 'table'>('code');
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const editorRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => {
            setCursorPos({
                line: e.position.lineNumber,
                col: e.position.column
            });
        });
    };

    const handleFormatChange = (newFormat: Format) => {
        setFormat(newFormat);
        const namePart = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        setFileName(`${namePart}.${getLanguage(newFormat)}`);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAutoFormat = async () => {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(content);
                setContent(JSON.stringify(parsed, null, 2));
            } else if (format === 'yaml') {
                const parsed = yaml.load(content);
                setContent(yaml.dump(parsed));
            }
            setIsSaved(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = () => {
        setIsSaved(true);
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        const finalName = fileName.includes('.') ? fileName : `${fileName}.${getLanguage(format)}`;
        element.download = finalName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleNewFile = () => {
        setContent("");
        setFileName("untitled.txt");
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
        setFileName("table.json");
        setIsSaved(false);
        setViewMode('table');
    };

    const isTabularData = useMemo(() => {
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object';
        } catch {
            return false;
        }
    }, [content]);

    const isPreviewable = PREVIEWABLE_FORMATS.includes(format.toLowerCase() as Format);

    return (
        <div className="flex flex-col h-full bg-background font-sans border-t">
            {/* Header / Standard Toolbar */}
            <div className="flex items-center justify-between px-4 h-14 border-b bg-muted/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <FileEdit className="size-4 text-primary" />
                        </div>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-semibold text-foreground min-w-[120px]"
                            spellCheck={false}
                        />
                        {!isSaved && <div className="size-2 rounded-full bg-amber-500 animate-pulse" />}
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
                                    File
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[180px]">
                                <DropdownMenuItem onClick={handleNewFile} className="gap-2">
                                    <Plus className="size-3.5" /> New File
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleNewTable} className="gap-2">
                                    <TableIcon className="size-3.5" /> New Table
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSave} className="gap-2">
                                    <Save className="size-3.5" /> Save
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setContent("")} className="gap-2 text-destructive">
                                    <Trash className="size-3.5" /> Clear
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
                                    Format
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[180px]">
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Select Language</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={format} onValueChange={(v) => handleFormatChange(v as Format)}>
                                    {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                        <DropdownMenuRadioItem key={fmt} value={fmt} className="text-xs uppercase">
                                            {fmt}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="sm" onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")} className="h-8 text-xs font-medium">
                            Wrap: {wordWrap.toUpperCase()}
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center bg-muted rounded-md p-1 gap-1">
                        <Button
                            variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('code')}
                            className="h-7 px-3 text-xs"
                        >
                            <Code className="size-3.5 mr-1.5" /> Source
                        </Button>
                        {isTabularData && (
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="h-7 px-3 text-xs"
                            >
                                <TableIcon className="size-3.5 mr-1.5" /> Table
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleAutoFormat} className="h-8 text-xs font-semibold gap-2">
                        Format Code
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs font-semibold gap-2">
                        {copied ? <Check className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    {isPreviewable && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push(`/view/${format}`)}
                            className="h-8 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Eye className="size-3.5" /> Preview
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Editor Canvas */}
            <div className="flex-1 flex overflow-hidden">
                {viewMode === 'code' ? (
                    <Editor
                        height="100%"
                        language={getLanguage(format)}
                        value={content}
                        onChange={(value) => setContent(value || "")}
                        onMount={handleEditorDidMount}
                        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: wordWrap,
                            automaticLayout: true,
                            padding: { top: 16 },
                            lineNumbersMinChars: 3,
                            scrollBeyondLastLine: false,
                        }}
                    />
                ) : (
                    <div className="flex-1 p-8 overflow-auto bg-background">
                        <TableViewer
                            data={JSON.parse(content)}
                            onDataChange={(newData) => {
                                setContent(JSON.stringify(newData, null, 2));
                                setIsSaved(false);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Sub-Footer Status Bar */}
            <div className="h-6 border-t bg-muted/40 flex items-center justify-between px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 uppercase font-bold text-primary">
                        {format}
                    </div>
                    <span>UTF-8</span>
                    <div className="flex items-center gap-1">
                        <Terminal className="size-3" />
                        <span>{content.length} characters</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span>Line {cursorPos.line}, Col {cursorPos.col}</span>
                    <span>Monaco Editor</span>
                </div>
            </div>
        </div>
    );
}
