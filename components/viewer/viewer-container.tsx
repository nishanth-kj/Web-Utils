"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { HTMLViewer } from './html-viewer';
import { CodeViewer } from './code-viewer';
import { TableViewer } from './table-viewer';
import yaml from 'js-yaml';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Code2,
    Eye,
    FileJson,
    FileCode,
    FileText,
    FileEdit,
    FileSearch,
    Type,
    Layout,
    Table as TableIcon,
    Sparkles,
    ArrowRightLeft,
    Zap,
    Maximize2,
    ExternalLink,
    Search,
    Hash,
    PanelLeftClose,
    PanelLeftOpen,
    AlignLeft,
    Copy
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Format = 'html' | 'json' | 'yaml' | 'react' | 'markdown' | 'xml' | 'svg' | 'csv';

interface ViewerContainerProps {
    initialContent: string;
    initialFormat: Format;
}

export function ViewerContainer({ initialContent, initialFormat }: ViewerContainerProps) {
    const [content, setContent] = useState(initialContent);
    const [format, setFormat] = useState<Format>(initialFormat);
    const [activeTab, setActiveTab] = useState("preview");
    const [prompt, setPrompt] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [useBootstrap, setUseBootstrap] = useState(true);
    const [useTailwind, setUseTailwind] = useState(true);
    const [showEditor, setShowEditor] = useState(true);
    const codeViewerRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (codeViewerRef.current) {
            codeViewerRef.current.scrollTop = e.currentTarget.scrollTop;
            codeViewerRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    useEffect(() => {
        setContent(initialContent);
        setFormat(initialFormat);
    }, [initialContent, initialFormat]);

    // ... existing logic ...

    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
            <Code2 className="size-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Editor</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
                <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={useBootstrap} onChange={(e) => setUseBootstrap(e.target.checked)} className="size-3 accent-indigo-600 rounded" />
                    <span className="text-[10px] font-bold text-zinc-500">BS</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={useTailwind} onChange={(e) => setUseTailwind(e.target.checked)} className="size-3 accent-indigo-600 rounded" />
                    <span className="text-[10px] font-bold text-zinc-500">TW</span>
                </label>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono">{format.toUpperCase()}</span>
                <button onClick={() => navigator.clipboard.writeText(content)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400"><Zap className="size-3" /></button>
            </div>
        </div>
    </div>

    // ... in render ...
    { format === 'html' && <HTMLViewer content={content} useBootstrap={useBootstrap} useTailwind={useTailwind} /> }

    const handleFormat = () => {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(content);
                setContent(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            // Silently fail if invalid code
        }
    };

    const handleConvert = () => {
        if (!prompt) return;
        const p = prompt.toLowerCase();
        if (p.includes("to json") && format === 'csv') {
            const data = tableData || [];
            if (data.length > 0) {
                setContent(JSON.stringify(data, null, 2));
                setFormat('json');
            }
        } else if (p.includes("to csv") && format === 'json') {
            const data = tableData || [];
            if (Array.isArray(data) && data.length > 0) {
                const headers = Object.keys(data[0]);
                const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
                setContent(csv);
                setFormat('csv');
            }
        } else if (p.includes("beautify") || p.includes("format")) {
            try {
                if (format === 'json') setContent(JSON.stringify(JSON.parse(content), null, 2));
            } catch (e) { }
        }
        setPrompt("");
    };

    const formattedContent = useMemo(() => {
        try {
            if (format === 'json') return JSON.stringify(JSON.parse(content), null, 2);
            if (format === 'yaml') return yaml.dump(yaml.load(content));
            return content;
        } catch (e) { return content; }
    }, [content, format]);

    const tableData = useMemo(() => {
        try {
            if (format === 'json') return JSON.parse(content);
            if (format === 'csv') {
                const lines = content.trim().split('\n');
                if (lines.length < 2) return [];
                const headers = lines[0].split(',');
                return lines.slice(1).map(line => {
                    const values = line.split(',');
                    return headers.reduce((acc, header, i) => ({ ...acc, [header]: values[i] }), {});
                });
            }
            return null;
        } catch (e) { return null; }
    }, [content, format]);

    const handleTableDataChange = (newData: any[]) => {
        if (format === 'json') setContent(JSON.stringify(newData, null, 2));
        else if (format === 'csv' && newData.length > 0) {
            const headers = Object.keys(newData[0]);
            setContent([headers.join(','), ...newData.map(row => headers.map(h => row[h]).join(','))].join('\n'));
        }
    };

    const canPreview = ['html', 'json', 'markdown', 'svg', 'csv'].includes(format);
    const canEditTable = (format === 'json' && Array.isArray(tableData)) || format === 'csv';

    const getLanguage = (fmt: Format) => {
        if (fmt === 'react') return 'tsx';
        if (fmt === 'markdown') return 'markdown';
        if (['svg', 'xml'].includes(fmt)) return 'xml';
        return fmt;
    };

    const openFullPage = () => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Preview - Web Viewer Pro</title>
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

    return (
        <div className={`flex flex-col w-full bg-white dark:bg-zinc-950 transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-[calc(100vh-64px)]"}`}>
            {/* Top Toolbar */}
            <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-2 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                            <Sparkles className="size-4" />
                        </div>
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
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-mono hidden sm:inline-block">{format.toUpperCase()}</span>
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




                        <div className="flex-1 relative overflow-hidden custom-scrollbar">
                            <CodeViewer
                                ref={codeViewerRef}
                                content={content}
                                language={getLanguage(format)}
                                className="absolute inset-0 pointer-events-none p-6 font-mono text-sm leading-[1.5] border-none rounded-none overflow-hidden"
                                showLineNumbers={false}
                            />
                            <textarea
                                className="absolute inset-0 w-full h-full p-6 font-mono text-sm bg-transparent resize-none outline-none focus:ring-0 text-transparent caret-zinc-800 dark:caret-zinc-200 leading-[1.5] custom-scrollbar z-10 whitespace-pre"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onScroll={handleScroll}
                                placeholder={`Paste ${format.toUpperCase()}...`}
                                spellCheck={false}
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
                                    {format === 'html' && <HTMLViewer content={content} />}
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
                                    {!['html', 'json', 'markdown', 'svg', 'csv'].includes(format) && (
                                        <div className="flex flex-col items-center justify-center text-center h-full p-20 opacity-40">
                                            <Layout className="size-16 mb-4 text-indigo-500" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No Preview Format Available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "code" && <div className="p-8"><CodeViewer content={formattedContent} language={getLanguage(format)} /></div>}
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
            `}</style>
        </div>
    );
}
