"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
    Save,
    FileEdit,
    Plus,
    Table as TableIcon,
    Trash,
    Copy as CopyIcon,
    Settings,
    Type as TypeIcon,
    Code2,
    PanelLeftClose,
    PanelLeftOpen,
    Maximize2,
    ChevronDown,
    Layout as LayoutIcon,
    AlignLeft,
    Download
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TableViewer } from '@/components/shared/table-viewer';
import { ContainerProps, Format } from '@/types';
import yaml from 'js-yaml';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEditor } from '@/lib/hooks/use-editor';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ALL_FORMATS, getLanguage } from '@/lib/formats';
import { Separator } from '@/components/ui/separator';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HTMLViewer } from '@/components/shared/html-viewer';
import { CodeViewer } from '@/components/shared/code-viewer';

export function EditorContainer({ initialContent, initialFormat }: ContainerProps) {
    const { resolvedTheme } = useTheme();
    const { content, setContent, format, setFormat, isSaved, setIsSaved } = useEditor({
        initialContent,
        initialFormat,
    });

    const [fileName, setFileName] = useState(`index.${getLanguage(initialFormat)}`);
    
    // Editor Settings from LocalStorage
    const [prefFontSize, setPrefFontSize] = useLocalStorage('editorFontSize', 14);
    const [prefTabSize, setPrefTabSize] = useLocalStorage('editorTabSize', 4);
    const [prefWordWrap, setPrefWordWrap] = useLocalStorage('editorWordWrap', 'on');
    
    const handleWordWrapToggle = () => {
        const newVal = prefWordWrap === 'on' ? 'off' : 'on';
        setPrefWordWrap(newVal);
    };

    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const [showPreview, setShowPreview] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const editorRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => {
            setCursorPos({ line: e.position.lineNumber, col: e.position.column });
        });
    };

    const handleSave = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        setIsSaved(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    const handleFormatChange = (newFormat: Format) => {
        setFormat(newFormat);
        setFileName(prev => {
            const parts = prev.split('.');
            if (parts.length > 1) parts.pop();
            return [...parts, getLanguage(newFormat)].join('.');
        });
    };

    const handleAutoFormat = async () => {
        try {
            if (format === 'json') {
                setContent(JSON.stringify(JSON.parse(content), null, prefTabSize));
            } else if (format === 'yaml') {
                setContent(yaml.dump(yaml.load(content)));
            }
        } catch {
            console.error("Format error");
        }
    };

    const handleNewFile = () => {
        setContent("");
        setIsSaved(true);
    };

    const handleNewTable = () => {
        const csvHeader = "id,name,value\n1,example,data";
        setContent(csvHeader);
        setFormat("csv");
        setFileName("table.csv");
    };

    const tableRows = useMemo<Record<string, string>[] | null>(() => {
        if (format === 'csv' || format === 'json' || format === 'yaml') {
            try {
                if (format === 'csv') {
                    const lines = content.trim().split('\n');
                    if (lines.length < 2) return null;
                    const headers = lines[0].split(',');
                    return lines.slice(1).map(line => {
                        const values = line.split(',');
                        return headers.reduce((obj, header, i) => {
                            obj[header.trim()] = values[i]?.trim();
                            return obj;
                        }, {} as Record<string, string>);
                    });
                }
                if (format === 'json') {
                    const data = JSON.parse(content);
                    if (Array.isArray(data) && data.length > 0) {
                        return data as Record<string, string>[];
                    }
                }
            } catch {
                return null;
            }
        }
        return null;
    }, [content, format]);

    const handleTableDataChange = (newData: Record<string, string>[]) => {
        if (format === 'csv') {
            if (newData.length === 0) return;
            const headers = Object.keys(newData[0]);
            const csv = [
                headers.join(','),
                ...newData.map(row => headers.map(h => row[h]).join(','))
            ].join('\n');
            setContent(csv);
        } else if (format === 'json') {
            setContent(JSON.stringify(newData, null, prefTabSize));
        }
    };

    const monacoWordWrap = (prefWordWrap === 'on' || prefWordWrap === 'off') ? prefWordWrap : 'off';

    return (
        <div className={`flex flex-col w-full bg-background transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-full border-t"}`}>
            {/* Header / Standard Toolbar */}
            <div className="flex h-11 items-center justify-between px-3 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground gap-2">
                                <span className="text-foreground">{format}</span>
                                <ChevronDown className="size-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[150px]">
                            {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                <DropdownMenuItem key={fmt} onClick={() => handleFormatChange(fmt as Format)} className="text-[10px] font-bold uppercase">
                                    {fmt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-4" />

                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded-md">
                            <FileEdit className="size-3.5 text-primary" />
                        </div>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="bg-transparent border-none outline-none text-[11px] font-bold text-foreground min-w-[120px] placeholder:text-muted-foreground/50"
                            spellCheck={false}
                        />
                        {!isSaved && <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md text-muted-foreground"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-md text-muted-foreground" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize2 className="size-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-md text-muted-foreground">
                                <Settings className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] p-3 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <TypeIcon className="size-3" /> Font Size
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="24" 
                                        value={prefFontSize} 
                                        onChange={(e) => setPrefFontSize(Number(e.target.value))}
                                        className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="text-[10px] font-bold tabular-nums w-4 text-center">{prefFontSize}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Code2 className="size-3" /> Tab Size
                                </label>
                                <div className="flex gap-2">
                                    {[2, 4, 8].map(size => (
                                        <Button 
                                            key={size}
                                            variant={prefTabSize === size ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-7 flex-1 text-[10px] font-bold"
                                            onClick={() => setPrefTabSize(size)}
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <AlignLeft className="size-3" /> Word Wrap
                                </label>
                                <Button 
                                    variant={prefWordWrap === 'on' ? 'secondary' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 w-full text-[10px] font-bold"
                                    onClick={handleWordWrapToggle}
                                >
                                    {prefWordWrap === 'on' ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="space-y-1.5 pt-1">
                                <Button variant="ghost" size="sm" onClick={handleNewFile} className="w-full justify-start h-8 text-[10px] font-bold uppercase gap-2">
                                    <Plus className="size-3.5" /> New File
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleNewTable} className="w-full justify-start h-8 text-[10px] font-bold uppercase gap-2">
                                    <TableIcon className="size-3.5" /> New Table
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleSave} className="w-full justify-start h-8 text-[10px] font-bold uppercase gap-2 text-primary">
                                    <Save className="size-3.5" /> Save
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setContent("")} className="w-full justify-start h-8 text-[10px] font-bold uppercase gap-2 text-destructive">
                                    <Trash className="size-3.5" /> Clear
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Split Canvas */}
            <div className="flex-1 flex overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={showPreview ? 40 : 100} minSize={20}>
                        <div className="flex flex-col h-full border-r bg-muted/5">
                            <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                <div className="flex items-center gap-2">
                                    <Code2 className="size-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={handleAutoFormat} className="size-7 text-muted-foreground hover:text-foreground" title="Format">
                                        <AlignLeft className="size-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleWordWrapToggle} className="size-7 text-muted-foreground hover:text-foreground" title="Wrap">
                                        <TypeIcon className="size-3.5" />
                                    </Button>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                    <Button variant="ghost" size="icon" onClick={handleCopy} className="size-7 text-muted-foreground hover:text-foreground" title="Copy">
                                        <CopyIcon className="size-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleSave} className="size-7 text-muted-foreground hover:text-primary" title="Save">
                                        <Download className="size-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setContent("")} className="size-7 text-muted-foreground hover:text-destructive" title="Clear">
                                        <Trash className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                                <Editor
                                    height="100%"
                                    language={getLanguage(format)}
                                    theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                                    value={content}
                                    onChange={(val) => setContent(val || "")}
                                    onMount={handleEditorDidMount}
                                    options={{
                                        fontSize: prefFontSize,
                                        tabSize: prefTabSize,
                                        wordWrap: monacoWordWrap,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        lineNumbers: 'on',
                                        glyphMargin: false,
                                        folding: true,
                                        lineDecorationsWidth: 10,
                                        lineNumbersMinChars: 3,
                                        padding: { top: 10, bottom: 10 },
                                        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                        fontLigatures: true,
                                    }}
                                />
                                <div className="absolute bottom-4 right-6 px-2 py-1 bg-background/50 backdrop-blur-sm border rounded text-[9px] font-bold tabular-nums text-muted-foreground select-none pointer-events-none">
                                    LN {cursorPos.line}, COL {cursorPos.col}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                    {showPreview && (
                        <>
                            <ResizableHandle withHandle className="bg-border/50" />
                            <ResizablePanel defaultSize={60} minSize={20}>
                                <div className="h-full bg-background flex flex-col">
                                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/5">
                                        <div className="flex items-center gap-2">
                                            <LayoutIcon className="size-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preview</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto custom-scrollbar p-0">
                                        <Tabs defaultValue="preview" className="h-full flex flex-col">
                                            <div className="px-4 border-b bg-muted/5">
                                                <TabsList className="h-9 bg-transparent p-0 gap-4">
                                                    <TabsTrigger value="preview" className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest">Live View</TabsTrigger>
                                                    {tableRows && <TabsTrigger value="table" className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest">Table View</TabsTrigger>}
                                                    <TabsTrigger value="raw" className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest">Raw Output</TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <div className="flex-1 overflow-hidden">
                                                <TabsContent value="preview" className="h-full m-0 p-0 border-none outline-none overflow-auto">
                                                    {format === 'html' ? (
                                                        <HTMLViewer content={content} />
                                                    ) : format === 'markdown' ? (
                                                        <div className="p-8 max-w-4xl mx-auto prose dark:prose-invert">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <CodeViewer content={content} language={getLanguage(format)} />
                                                    )}
                                                </TabsContent>
                                                {tableRows && (
                                                    <TabsContent value="table" className="h-full m-0 p-0 border-none outline-none overflow-auto p-6">
                                                        <TableViewer data={tableRows} onDataChange={handleTableDataChange} />
                                                    </TabsContent>
                                                )}
                                                <TabsContent value="raw" className="h-full m-0 p-0 border-none outline-none">
                                                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all h-full overflow-auto bg-muted/5">
                                                        {content}
                                                    </pre>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>

            {/* Footer / Status Bar */}
            <div className="h-7 border-t bg-muted/30 px-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className={`size-1.5 rounded-full ${isSaved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">{isSaved ? 'Synced' : 'Modified'}</span>
                    </div>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="text-[9px] font-bold text-muted-foreground">{content.length} characters</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{format}</span>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="text-[9px] font-bold text-muted-foreground tabular-nums">UTF-8</span>
                </div>
            </div>
        </div>
    );
}
