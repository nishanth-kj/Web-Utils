"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HTMLViewer } from '@/components/shared/html-viewer';
import { CodeViewer } from '@/components/shared/code-viewer';
import { TableViewer } from '@/components/shared/table-viewer';
import { ContainerProps } from '@/types';
import yaml from 'js-yaml';
import * as prettier from 'prettier/standalone';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginPostcss from 'prettier/plugins/postcss';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import { format as formatSql } from 'sql-formatter';
import { Button } from "@/components/ui/button";
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
    Code2,
    Eye,
    Table as TableIcon,
    Maximize2,
    ExternalLink,
    PanelLeftClose,
    PanelLeftOpen,
    AlignLeft,
    Copy,
    FileEdit,
    ChevronDown,
    Download,
    Trash2,
    Type,
    Layout as LayoutIcon
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEditor } from '@/lib/hooks/use-editor';
import { ALL_FORMATS, PREVIEWABLE_FORMATS, getLanguage } from '@/lib/formats';
import { Separator } from '@/components/ui/separator';

export function ViewerContainer({ initialContent, initialFormat }: ContainerProps) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const { content, setContent, format, setFormat } = useEditor({
        initialContent,
        initialFormat,
    });

    const [activeTab, setActiveTab] = useState("preview");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [useBootstrap, setUseBootstrap] = useState(true);
    const [useTailwind, setUseTailwind] = useState(true);
    const [showEditor, setShowEditor] = useState(true);
    const [wordWrap, setWordWrap] = useState<"on" | "off">("off");

    const handleClear = () => {
        if (confirm("Are you sure you want to clear the editor?")) {
            setContent("");
        }
    };

    const handleDownload = () => {
        const extension = format === 'react' ? 'tsx' : format;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `file.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFormat = async () => {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(content);
                setContent(JSON.stringify(parsed, null, 2));
            } else if (format === 'yaml') {
                const parsed = yaml.load(content);
                setContent(yaml.dump(parsed));
            } else if (format === 'sql') {
                setContent(formatSql(content));
            } else {
                const parserMap: Record<string, string> = {
                    'html': 'html',
                    'css': 'css',
                    'javascript': 'babel',
                    'typescript': 'babel-ts',
                    'react': 'babel-ts',
                    'markdown': 'markdown',
                    'xml': 'html',
                };

                const parser = parserMap[format];
                if (parser) {
                    const formatted = await prettier.format(content, {
                        parser,
                        plugins: [
                            prettierPluginHtml,
                            prettierPluginPostcss,
                            prettierPluginBabel,
                            prettierPluginEstree,
                            prettierPluginMarkdown
                        ],
                        semi: true,
                        singleQuote: true,
                        tabWidth: 2,
                    });
                    setContent(formatted);
                }
            }
        } catch (e) {
            console.error('Formatting error:', e);
        }
    };

    const formattedContent = useMemo(() => {
        try {
            if (format === 'json') return JSON.stringify(JSON.parse(content), null, 2);
            if (format === 'yaml') return yaml.dump(yaml.load(content));
        } catch {
            return content;
        }
        return content;
    }, [content, format]);

    const tableData = useMemo(() => {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(content);
                return Array.isArray(parsed) ? parsed : null;
            }
            if (format === 'csv') {
                const lines = content.trim().split('\n');
                if (lines.length >= 2) {
                    const headers = lines[0].split(',');
                    return lines.slice(1).map((line: string) => {
                        const values = line.split(',');
                        return headers.reduce((acc: Record<string, string>, header: string, i: number) => ({ ...acc, [header]: values[i] }), {});
                    });
                }
            }
        } catch {
            return null;
        }
        return null;
    }, [content, format]);

    const canPreviewTable = (format === 'json' && Array.isArray(tableData)) || format === 'csv';

    const openFullPage = () => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Preview - Web Utils</title>
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
        <div className={`flex flex-col w-full bg-background transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-[calc(100vh-64px)]"}`}>
            {/* Minimalist Top Toolbar */}
            <div className="flex items-center justify-between px-6 h-14 border-b bg-muted/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground gap-2">
                                <span className="text-foreground">{format}</span>
                                <ChevronDown className="size-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[150px]">
                            {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                <DropdownMenuItem key={fmt} onClick={() => setFormat(fmt)} className="text-[10px] font-bold uppercase">
                                    {fmt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-4" />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/editor')}
                        className="h-8 text-xs font-semibold gap-2"
                    >
                        <FileEdit className="size-3.5" /> Open in Editor
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md text-muted-foreground"
                        onClick={() => setShowEditor(!showEditor)}
                    >
                        {showEditor ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-md text-muted-foreground" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize2 className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Split UI with Resizable Panels */}
            <div className="flex-1 flex overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {showEditor && (
                        <>
                            <ResizablePanel defaultSize={40} minSize={20}>
                                <div className="flex flex-col h-full border-r bg-muted/5">
                                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="size-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={handleFormat} className="size-7" title="Format">
                                                <AlignLeft className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")} className="size-7" title="Wrap">
                                                <Type className="size-3.5" />
                                            </Button>
                                            <Separator orientation="vertical" className="h-4 mx-1" />
                                            <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(content)} className="size-7">
                                                <Copy className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleDownload} className="size-7">
                                                <Download className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleClear} className="size-7 text-destructive">
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative overflow-hidden">
                                        <Editor
                                            height="100%"
                                            language={getLanguage(format)}
                                            value={content}
                                            onChange={(value) => setContent(value || "")}
                                            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                wordWrap: wordWrap,
                                                automaticLayout: true,
                                                padding: { top: 16 },
                                                lineNumbersMinChars: 3,
                                                scrollBeyondLastLine: false,
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                        </>
                    )}

                    <ResizablePanel defaultSize={showEditor ? 60 : 100}>
                        <div className="flex flex-col h-full bg-background">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                    <TabsList className="h-8 bg-muted/50">
                                        <TabsTrigger value="preview" className="text-[10px] font-bold uppercase py-1.5 h-7">
                                            <Eye className="size-3 mr-2" /> Preview
                                        </TabsTrigger>
                                        {canPreviewTable && (
                                            <TabsTrigger value="table" className="text-[10px] font-bold uppercase py-1.5 h-7">
                                                <TableIcon className="size-3 mr-2" /> Data
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                    
                                    <div className="flex items-center gap-2">
                                        {format === 'html' && (
                                            <div className="flex items-center gap-1">
                                                <Button 
                                                    variant={useBootstrap ? "secondary" : "ghost"} 
                                                    size="sm" 
                                                    className="h-7 text-[10px] uppercase px-2 font-bold"
                                                    onClick={() => setUseBootstrap(!useBootstrap)}
                                                >
                                                    BS
                                                </Button>
                                                <Button 
                                                    variant={useTailwind ? "secondary" : "ghost"} 
                                                    size="sm" 
                                                    className="h-7 text-[10px] uppercase px-2 font-bold"
                                                    onClick={() => setUseTailwind(!useTailwind)}
                                                >
                                                    TW
                                                </Button>
                                            </div>
                                        )}
                                        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase rounded-md px-3" onClick={openFullPage}>
                                            <ExternalLink className="size-3 mr-2" /> Full Page
                                        </Button>
                                    </div>
                                </div>

                                <TabsContent value="preview" className="flex-1 relative overflow-auto m-0 p-0 border-none">
                                    <div className="absolute inset-0">
                                        {format === 'html' && <HTMLViewer content={content} useBootstrap={useBootstrap} useTailwind={useTailwind} enableJS={true} />}
                                        {format === 'json' && <div className="p-4 bg-background h-full overflow-auto"><CodeViewer content={formattedContent} language="json" /></div>}
                                        {format === 'markdown' && (
                                            <div className="prose prose-zinc dark:prose-invert max-w-none bg-background p-8 min-h-full">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                            </div>
                                        )}
                                        {format === 'svg' && (
                                            <div className="flex items-center justify-center p-8 bg-background min-h-full" dangerouslySetInnerHTML={{ __html: content }} />
                                        )}
                                        {format === 'csv' && <div className="p-4 bg-background min-h-full"><TableViewer data={tableData || []} onDataChange={(newData) => {
                                            const headers = Object.keys(newData[0]);
                                            setContent([headers.join(','), ...newData.map(row => headers.map(h => row[h]).join(','))].join('\n'));
                                        }} /></div>}
                                        {!PREVIEWABLE_FORMATS.includes(format) && (
                                            <div className="flex flex-col items-center justify-center text-center h-full p-20 opacity-30">
                                                <LayoutIcon className="size-16 mb-4 text-primary" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No Live Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="table" className="flex-1 overflow-auto m-0 p-8 border-none bg-background">
                                    <TableViewer data={tableData || []} onDataChange={(newData) => {
                                        if (format === 'json') setContent(JSON.stringify(newData, null, 2));
                                        else if (format === 'csv') {
                                            const headers = Object.keys(newData[0]);
                                            setContent([headers.join(','), ...newData.map(row => headers.map(h => row[h]).join(','))].join('\n'));
                                        }
                                    }} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
