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
    Check,
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
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useEditor } from '@/lib/hooks/use-editor';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PREVIEWABLE_FORMATS, ALL_FORMATS, getLanguage } from '@/lib/formats';
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
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const { content, setContent, format, setFormat, isSaved, setIsSaved } = useEditor({
        initialContent,
        initialFormat,
    });

    const [fileName, setFileName] = useState(`index.${getLanguage(initialFormat)}`);
    const [copied, setCopied] = useState(false);
    
    // Editor Settings from LocalStorage
    const [prefFontSize, setPrefFontSize] = useLocalStorage('editorFontSize', 14);
    const [prefTabSize, setPrefTabSize] = useLocalStorage('editorTabSize', 4);
    const [prefWordWrap, setPrefWordWrap] = useLocalStorage('editorWordWrap', 'on');
    
    const [wordWrap, setWordWrap] = useState<"on" | "off">(prefWordWrap as "on" | "off");

    // Sync local wordWrap with preference when preference changes
    React.useEffect(() => {
        setWordWrap(prefWordWrap as "on" | "off");
    }, [prefWordWrap]);

    const handleWordWrapToggle = () => {
        const newVal = wordWrap === "on" ? "off" : "on";
        setWordWrap(newVal);
        setPrefWordWrap(newVal);
    };

    const [viewMode, setViewMode] = useState<'code' | 'table'>('code');
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const [showPreview, setShowPreview] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState("preview");
    const [useBootstrap, setUseBootstrap] = useState(false);
    const [useTailwind, setUseTailwind] = useState(false);
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
        <div className={`flex flex-col w-full bg-background transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-full border-t"}`}>
            {/* Header / Standard Toolbar */}
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
                                    value={content}
                                    onChange={(value) => setContent(value || "")}
                                    onMount={handleEditorDidMount}
                                    theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: prefFontSize,
                                        tabSize: prefTabSize,
                                        wordWrap: wordWrap,
                                        automaticLayout: true,
                                        padding: { top: 16 },
                                        lineNumbersMinChars: 3,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                                {/* Subtle Editor Footer */}
                                <div className="absolute bottom-0 right-4 h-6 flex items-center gap-4 text-[10px] font-bold text-muted-foreground/40 uppercase z-10 pointer-events-none">
                                    <span>Line {cursorPos.line}, Col {cursorPos.col}</span>
                                    <span>{content.length} chars</span>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                    {showPreview && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50} minSize={20}>
                                <div className="flex flex-col h-full bg-background border-l">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                            <TabsList className="h-8 bg-muted/50">
                                                <TabsTrigger value="preview" className="text-[10px] font-bold uppercase py-1.5 h-7">
                                                    <Eye className="size-3 mr-2" /> Preview
                                                </TabsTrigger>
                                                <TabsTrigger value="viewer" className="text-[10px] font-bold uppercase py-1.5 h-7">
                                                    <Code className="size-3 mr-2" /> Source
                                                </TabsTrigger>
                                                {isTabularData && (
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
                                            </div>
                                        </div>

                                        <div className="flex-1 relative overflow-hidden">
                                            <TabsContent value="preview" className="flex-1 relative overflow-auto m-0 p-0 border-none">
                                                <div className="absolute inset-0">
                                                    {format === 'html' && <HTMLViewer content={content} useBootstrap={useBootstrap} useTailwind={useTailwind} enableJS={true} />}
                                                    {format === 'markdown' && (
                                                        <div className="prose prose-zinc dark:prose-invert max-w-none bg-background p-8 min-h-full">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                    {format === 'svg' && <div className="flex items-center justify-center p-8 bg-background h-full overflow-auto" dangerouslySetInnerHTML={{ __html: content }} />}
                                                    {['json', 'xml', 'yaml', 'css', 'js'].includes(format) && (
                                                        <CodeViewer content={content} language={getLanguage(format)} wrapLines={true} />
                                                    )}
                                                    {!['html', 'markdown', 'svg', 'json', 'xml', 'yaml', 'css', 'js'].includes(format) && (
                                                        <div className="flex flex-col items-center justify-center text-center h-full p-20 opacity-30">
                                                            <LayoutIcon className="size-16 mb-4 text-primary" />
                                                            <p className="text-sm font-bold uppercase tracking-widest">No Live Preview</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="viewer" className="h-full m-0 p-0 bg-background">
                                                <CodeViewer content={content} language={getLanguage(format)} wrapLines={wordWrap === 'on'} />
                                            </TabsContent>

                                            <TabsContent value="table" className="h-full m-0 p-8 overflow-auto">
                                                <TableViewer data={JSON.parse(content || '[]')} onDataChange={(newData) => {
                                                    setContent(JSON.stringify(newData, null, 2));
                                                    setIsSaved(false);
                                                }} />
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </div>
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>

        </div>
    );
}
