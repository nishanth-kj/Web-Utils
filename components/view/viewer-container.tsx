"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PreviewPane } from '@/components/view/preview-pane';
import { ContainerProps, Format } from '@/types';
import yaml from 'js-yaml';
import { formatSql, formatWithPrettier } from '@/lib/format-code';
import { parseMultipleJson } from '@/lib/json-parser';
import { formatXml, findXmlError } from '@/lib/xml';
import { labelForFormat } from '@/lib/format-labels';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { MonacoEditor as Editor } from '@/components/shared/lazy-monaco';
import { useTheme } from 'next-themes';
import {
    Code2,
    Eye,
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
    ArrowLeftRight
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
import { useEditor, writeEditorFormat, writeSessionContent } from '@/lib/hooks/use-editor';
import { CONVERSIONS, type Conversion } from '@/lib/convert';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { getLanguage, PREVIEWABLE_FORMATS } from '@/lib/formats';
import { buildPreviewDocument, openSandboxedPreview, svgToDataUrl } from '@/lib/preview-document';
import { Separator } from '@/components/ui/separator';

// Prettier parser per format; formats missing here have their own formatter
// (JSON, YAML, XML family, SQL) or none at all.
const PRETTIER_PARSERS: Partial<Record<Format, string>> = {
    html: 'html',
    css: 'css',
    javascript: 'babel',
    typescript: 'babel-ts',
    react: 'babel-ts',
    markdown: 'markdown',
};

export function ViewerContainer({ initialContent, initialFormat }: ContainerProps) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    // Side-by-side panes leave each about 180px wide on a phone; stack them instead.
    const isMobile = useIsMobile();
    const { content, setContent, format, setFormat } = useEditor({
        initialContent,
        initialFormat,
    });

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
        if (!content.trim()) return;
        try {
            if (format === 'json') {
                setContent(parseMultipleJson(content).map((doc) => JSON.stringify(doc, null, 2)).join('\n\n'));
            } else if (format === 'yaml') {
                setContent(yaml.loadAll(content).map((doc) => yaml.dump(doc)).join('---\n'));
            } else if (format === 'xml' || format === 'svg' || format === 'android-xml') {
                const xmlError = findXmlError(content);
                if (xmlError) throw new Error(xmlError);
                setContent(formatXml(content));
            } else if (format === 'sql') {
                setContent(await formatSql(content));
            } else {
                const parser = PRETTIER_PARSERS[format];
                if (!parser) {
                    toast.info(`Formatting isn't available for ${labelForFormat(format)}.`);
                    return;
                }
                setContent(await formatWithPrettier(content, parser));
            }
        } catch (error) {
            toast.error(`Couldn't format this ${labelForFormat(format)}`, {
                description: error instanceof Error ? error.message : String(error),
            });
        }
    };

    // Switching format keeps the user's text (issue #37). It is saved as the
    // target format's draft synchronously, before navigating, because the
    // debounced autosave would otherwise lose the race against the new page
    // loading its own sample. An untouched sample is simply replaced.
    const handleFormatSwitch = (fmt: Format) => {
        if (fmt === format) return;
        if (content.trim() && content !== initialContent) {
            writeSessionContent(fmt, content);
        }
        setFormat(fmt);
        router.push(`/view/${fmt}`);
    };

    // The code editor opens with this text and format instead of its own
    // JSON draft (issue #37).
    const handleOpenInEditor = () => {
        writeSessionContent(format, content);
        writeEditorFormat(format);
        router.push('/editor');
    };

    const conversions = CONVERSIONS[format] ?? [];

    const handleConvert = (conversion: Conversion) => {
        try {
            writeSessionContent(conversion.to, conversion.convert(content));
        } catch (error) {
            toast.error(`Couldn't convert to ${labelForFormat(conversion.to)}`, {
                description: error instanceof Error ? error.message : String(error),
            });
            return;
        }
        toast.success(`Converted to ${labelForFormat(conversion.to)}`);
        router.push(`/view/${conversion.to}`);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(
            () => toast.success('Copied to clipboard'),
            () => toast.error("Couldn't copy: the browser blocked clipboard access.")
        );
    };

    const openFullPage = () => {
        const markup = format === 'svg' ? `<img src="${svgToDataUrl(content)}" alt="SVG preview" style="max-width:100%">` : content;
        openSandboxedPreview(buildPreviewDocument(markup, {
            useBootstrap: format === 'html' && useBootstrap,
            useTailwind: format === 'html' && useTailwind,
            background: '#ffffff',
        }));
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
                            {/* Only formats with a statically generated /view/[type] page. */}
                            {PREVIEWABLE_FORMATS.map((fmt) => (
                                <DropdownMenuItem key={fmt} onClick={() => handleFormatSwitch(fmt)} className="text-[10px] font-bold uppercase">
                                    {labelForFormat(fmt)}
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
                            aria-label="File name"
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
                        aria-label={showEditor ? "Hide source editor" : "Show source editor"}
                        className="size-8 rounded-md text-muted-foreground"
                        onClick={() => setShowEditor(!showEditor)}
                    >
                        {showEditor ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Editor settings" className="size-8 rounded-md text-muted-foreground">
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
                                        aria-label="Font size"
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

                    <Button variant="ghost" size="icon" aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} className="size-8 rounded-md text-muted-foreground" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize2 className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Split UI with Resizable Panels */}
            <div className="flex-1 flex min-w-0 min-h-0 overflow-hidden">
                <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="min-w-0 min-h-0">
                    {showEditor && (
                        <>
                            <ResizablePanel defaultSize={50} minSize={20} className="min-w-0 min-h-0">
                                <div className="flex flex-col h-full min-w-0 min-h-0 border-b md:border-b-0 md:border-r bg-muted/5">
                                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="size-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={handleOpenInEditor} className="size-7" title="Open in Editor" aria-label="Open in Editor">
                                                <FileEdit className="size-3.5" />
                                            </Button>
                                            <Separator orientation="vertical" className="h-4 mx-1" />
                                            <Button variant="ghost" size="icon" onClick={handleAutoFormat} className="size-7" title="Format" aria-label="Format document">
                                                <AlignLeft className="size-3.5" />
                                            </Button>
                                            {conversions.length > 0 && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[10px] font-bold uppercase" title="Convert to another format">
                                                            <ArrowLeftRight className="size-3.5" />
                                                            <span className="hidden sm:inline">Convert</span>
                                                            <span className="sr-only sm:hidden">Convert</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {conversions.map((conversion) => (
                                                            <DropdownMenuItem key={conversion.to} onClick={() => handleConvert(conversion)} className="text-xs">
                                                                {conversion.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={handleWordWrapToggle} className="size-7" title="Toggle word wrap" aria-label="Toggle word wrap">
                                                <Type className="size-3.5" />
                                            </Button>
                                            <Separator orientation="vertical" className="h-4 mx-1" />
                                            <Button variant="ghost" size="icon" onClick={handleCopy} className="size-7" title="Copy" aria-label="Copy source">
                                                <Copy className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleDownload} className="size-7" title="Download" aria-label="Download file">
                                                <Download className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleClear} className="size-7 text-destructive" title="Clear" aria-label="Clear editor">
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative min-w-0 min-h-0 overflow-hidden">
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

                    <ResizablePanel defaultSize={showEditor ? 50 : 100} className="min-w-0 min-h-0">
                        <div className="flex flex-col h-full min-w-0 min-h-0 bg-background">
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
                                        {(format === 'html' || format === 'svg') && (
                                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase rounded-md px-3" onClick={openFullPage}>
                                                <ExternalLink className="size-3 mr-2" /> Full Page
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 relative overflow-auto m-0 p-0 border-none bg-background">
                                    <PreviewPane
                                        format={format}
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
