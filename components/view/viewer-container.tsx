"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PreviewPane } from '@/components/shared/preview-pane';
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
    Settings,
    AlignLeft,
    Copy,
    FileEdit,
    ChevronDown,
    Download,
    Trash2,
    Type,
    Layout as LayoutIcon
} from "lucide-react";
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
import { useLocalStorage } from '@/hooks/use-local-storage';
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
    
    // Editor Settings from LocalStorage
    const [prefFontSize, setPrefFontSize] = useLocalStorage('editorFontSize', 14);
    const [prefTabSize, setPrefTabSize] = useLocalStorage('editorTabSize', 4);
    const [prefWordWrap, setPrefWordWrap] = useLocalStorage('editorWordWrap', 'off');
    
    const [fileName, setFileName] = useState(`view.${getLanguage(initialFormat)}`);

    const handleWordWrapToggle = () => {
        const newVal = prefWordWrap === "on" ? "off" : "on";
        setPrefWordWrap(newVal);
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear the editor?")) {
            setContent("");
        }
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleAutoFormat = async () => {
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
                    'markdown': 'babel',
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
            console.error(e);
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
        <div className={`flex flex-col w-full bg-background transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-full"}`}>
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
                                <DropdownMenuItem key={fmt} onClick={() => {
                                    setFormat(fmt);
                                    router.push(`/view/${fmt}`);
                                }} className="text-[10px] font-bold uppercase">
                                    {fmt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-4" />

                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded-md">
                            <Eye className="size-3.5 text-primary" />
                        </div>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="bg-transparent border-none outline-none text-[11px] font-bold text-foreground min-w-[120px] placeholder:text-muted-foreground/50"
                            spellCheck={false}
                        />
                    </div>
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
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-md text-muted-foreground">
                                <Settings className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] p-3 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Type className="size-3" /> Font Size
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
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                                            <Button variant="ghost" size="icon" onClick={() => router.push('/editor')} className="size-7" title="Open in Editor">
                                                <FileEdit className="size-3.5" />
                                            </Button>
                                            <Separator orientation="vertical" className="h-4 mx-1" />
                                            <Button variant="ghost" size="icon" onClick={handleAutoFormat} className="size-7" title="Format">
                                                <AlignLeft className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleWordWrapToggle} className="size-7" title="Wrap">
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
                                                fontSize: prefFontSize,
                                                tabSize: prefTabSize,
                                                wordWrap: prefWordWrap as "on" | "off",
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
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                    <div className="flex items-center h-8">
                                        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase ring-offset-background transition-all bg-background text-foreground shadow-sm h-7">
                                            <Eye className="size-3 mr-2" /> Preview
                                        </div>
                                    </div>
                                    
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

                                <div className="flex-1 relative overflow-auto m-0 p-0 border-none bg-background">
                                    <PreviewPane 
                                        format={format as any}
                                        content={content}
                                        setContent={setContent}
                                        useBootstrap={useBootstrap}
                                        useTailwind={useTailwind}
                                    />
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
