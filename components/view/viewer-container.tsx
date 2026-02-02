"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HTMLViewer } from '@/components/shared/html-viewer';
import { CodeViewer } from '@/components/shared/code-viewer';
import { TableViewer } from '@/components/shared/table-viewer';
import { Format, ViewerProps } from '@/types';
import yaml from 'js-yaml';
import { Button } from "@/components/ui/button";
import {
    Code2,
    Eye,
    Layout,
    Table as TableIcon,
    Maximize2,
    ExternalLink,
    PanelLeftClose,
    PanelLeftOpen,
    AlignLeft,
    Copy,
    FileEdit,
    ChevronDown,
    Zap,
    Layers
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ALL_FORMATS, PREVIEWABLE_FORMATS, getLanguage } from '@/lib/formats';

export function ViewerContainer({ initialContent, initialFormat }: ViewerProps) {
    const router = useRouter();
    const [content, setContent] = useState(initialContent);
    const [format, setFormat] = useState<Format>(initialFormat);
    const [activeTab, setActiveTab] = useState("preview");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [useBootstrap, setUseBootstrap] = useState(true);
    const [useTailwind, setUseTailwind] = useState(true);
    const [enableJS, setEnableJS] = useState(true);
    const [showEditor, setShowEditor] = useState(true);
    const codeViewerRef = useRef<HTMLDivElement>(null);

    const [prevInitialContent, setPrevInitialContent] = useState(initialContent);
    const [prevInitialFormat, setPrevInitialFormat] = useState(initialFormat);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(`web-viewer-content-${format}`);
            if (saved) {
                setContent(saved);
            }
        }
    }, [format]);

    if (initialContent !== prevInitialContent || initialFormat !== prevInitialFormat) {
        setPrevInitialContent(initialContent);
        setPrevInitialFormat(initialFormat);

        // Only update content from props if we don't have something in sessionStorage for this format
        let hasSaved = false;
        if (typeof window !== 'undefined') {
            hasSaved = !!sessionStorage.getItem(`web-viewer-content-${initialFormat}`);
        }

        if (!hasSaved) {
            setContent(initialContent);
        }
        setFormat(initialFormat);
    }

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (codeViewerRef.current) {
            codeViewerRef.current.scrollTop = e.currentTarget.scrollTop;
            codeViewerRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
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
        } catch (e) {
            console.error(e);
        }
    };

    let formattedContent = content;
    try {
        if (format === 'json') formattedContent = JSON.stringify(JSON.parse(content), null, 2);
        else if (format === 'yaml') formattedContent = yaml.dump(yaml.load(content));
    } catch (e) {
        console.error(e);
        formattedContent = content;
    }

    let tableData: Record<string, string>[] | null = null;
    try {
        if (format === 'json') {
            const parsed = JSON.parse(content);
            tableData = Array.isArray(parsed) ? parsed : null;
        }
        if (format === 'csv') {
            const lines = content.trim().split('\n');
            if (lines.length >= 2) {
                const headers = lines[0].split(',');
                tableData = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return headers.reduce((acc, header, i) => ({ ...acc, [header]: values[i] }), {});
                });
            }
        }
    } catch (e) {
        console.error(e);
        tableData = null;
    }

    const handleTableDataChange = (newData: Record<string, string>[]) => {
        if (format === 'json') setContent(JSON.stringify(newData, null, 2));
        else if (format === 'csv' && newData.length > 0) {
            const headers = Object.keys(newData[0]);
            setContent([headers.join(','), ...newData.map(row => headers.map(h => row[h]).join(','))].join('\n'));
        }
    };

    const canEditTable = (format === 'json' && Array.isArray(tableData)) || format === 'csv';

    const openFullPage = () => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Preview - Web Utils Pro</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-white p-4">
                    ${content}
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const jumpToEditor = () => {
        router.push('/editor');
    };

    return (
        <div className={`flex flex-col w-full bg-white dark:bg-zinc-950 transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-[calc(100vh-64px)]"}`}>
            {/* Top Toolbar */}
            <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-2 gap-4">
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 gap-2">
                                    <span className="text-zinc-600 dark:text-zinc-300">{format}</span>
                                    <ChevronDown className="size-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[150px] rounded-lg">
                                {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                    <DropdownMenuItem key={fmt} onClick={() => setFormat(fmt)} className="text-[10px] font-bold uppercase tracking-wider">
                                        {fmt}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={jumpToEditor}
                            className="h-8 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm text-xs font-bold gap-2"
                        >
                            <FileEdit className="size-3.5" /> Jump to Editor
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-zinc-500"
                            onClick={() => setShowEditor(!showEditor)}
                            title={showEditor ? "Close Source Code" : "Open Source Code"}
                        >
                            {showEditor ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg text-zinc-500" onClick={() => setIsFullscreen(!isFullscreen)}>
                            <Maximize2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Split Editor/Preview */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Syntax Highlighted Editor */}
                {showEditor && (
                    <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10 transition-all duration-300">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-2">
                                <Code2 className="size-4 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Editor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {format === 'html' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setUseBootstrap(!useBootstrap)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${useBootstrap ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-200 dark:border-indigo-800" : "text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                        >
                                            <Layers className="size-3" /> Bootstrap
                                        </button>
                                        <button
                                            onClick={() => setUseTailwind(!useTailwind)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${useTailwind ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 border-cyan-200 dark:border-cyan-800" : "text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                        >
                                            <Zap className="size-3" /> Tailwind
                                        </button>
                                        <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
                                        <button
                                            onClick={() => setEnableJS(!enableJS)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${enableJS ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-800" : "text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                        >
                                            <Code2 className="size-3" /> JavaScript
                                        </button>
                                    </div>
                                )}
                                <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleFormat}
                                        className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-500 transition-colors"
                                        title="Format Code"
                                    >
                                        <AlignLeft className="size-3" />
                                        <span className="text-[10px] font-bold">Format</span>
                                    </button>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(content)}
                                        className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-500 transition-colors"
                                        title="Copy Code"
                                    >
                                        <Copy className="size-3" />
                                        <span className="text-[10px] font-bold">Copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative overflow-hidden custom-scrollbar">
                            <CodeViewer
                                ref={codeViewerRef}
                                content={content}
                                language={getLanguage(format)}
                                className="viewer-code-view absolute inset-0 pointer-events-none p-6 font-mono text-sm leading-[1.5] border-none rounded-none overflow-hidden"
                                showLineNumbers={false}
                                wrapLines={false}
                            />
                            <textarea
                                className="absolute inset-0 w-full h-full p-6 font-mono text-sm bg-transparent resize-none outline-none focus:ring-0 text-transparent caret-zinc-800 dark:caret-zinc-200 leading-[1.5] custom-scrollbar z-10 whitespace-pre"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onScroll={handleScroll}
                                placeholder={`Paste ${format.toUpperCase()}...`}
                                spellCheck={false}
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                            />
                        </div>
                    </div>
                )}

                {/* Right: Correct Preview */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                            <button onClick={() => setActiveTab("preview")} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "preview" ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-zinc-500"}`}>
                                <Eye className="size-3.5" /> Preview
                            </button>

                            {canEditTable && (
                                <button onClick={() => setActiveTab("interactive")} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "interactive" ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-zinc-500"}`}>
                                    <TableIcon className="size-3.5" /> Data Table
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 rounded-md px-2" onClick={openFullPage}>
                                <ExternalLink className="size-3" /> Full Page
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-zinc-50/30 dark:bg-transparent custom-scrollbar relative">
                        <div className="absolute inset-0">
                            {activeTab === "preview" && (
                                <div className="p-0 h-full flex flex-col">
                                    {format === 'html' && <HTMLViewer content={content} useBootstrap={useBootstrap} useTailwind={useTailwind} enableJS={enableJS} />}
                                    {format === 'json' && <div className="p-4 bg-white dark:bg-zinc-900 border-none shadow-sm h-full overflow-auto"><CodeViewer content={formattedContent} language="json" /></div>}
                                    {format === 'markdown' && (
                                        <div className="prose prose-zinc dark:prose-invert max-w-none bg-white dark:bg-zinc-900 p-8 border-none min-h-full shadow-sm">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                        </div>
                                    )}
                                    {format === 'svg' && (
                                        <div className="flex items-center justify-center p-8 bg-white dark:bg-zinc-900 border-none min-h-full shadow-sm" dangerouslySetInnerHTML={{ __html: content }} />
                                    )}
                                    {format === 'csv' && <div className="p-4"><TableViewer data={tableData || []} onDataChange={handleTableDataChange} /></div>}
                                    {!PREVIEWABLE_FORMATS.includes(format) && (
                                        <div className="flex flex-col items-center justify-center text-center h-full p-20 opacity-40">
                                            <Layout className="size-16 mb-4 text-indigo-500" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No Preview Format Available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "interactive" && <div className="p-8"><TableViewer data={tableData || []} onDataChange={handleTableDataChange} /></div>}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(161, 161, 170, 0.4); }
                
                /* Editor Typography Alignment */
                textarea { font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important; font-variant-ligatures: none; letter-spacing: normal; tab-size: 4; }
                .viewer-code-view { font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important; scrollbar-gutter: stable; font-variant-ligatures: none; letter-spacing: normal; tab-size: 4; }
                .viewer-code-view code, .viewer-code-view pre { font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important; tab-size: 4; }
                
                /* Match textarea scrollbar behavior */
                textarea { scrollbar-gutter: stable; }
            `}</style>
        </div>
    );
}
