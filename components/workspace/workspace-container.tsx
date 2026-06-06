"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
    FileEdit,
    Terminal as TerminalIcon,
    Table as TableIcon,
    Code,
    Eye,
    Copy as CopyIcon,
    Braces,
    Layout,
    ChevronDown,
    Maximize2,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    Type as TypeIcon,
    Code2,
    Download,
    Trash
} from "lucide-react";
import { TableViewer } from '@/components/shared/table-viewer';
import { HTMLViewer } from '@/components/shared/html-viewer';
import { CodeViewer } from '@/components/shared/code-viewer';
import { JsonTreeViewer } from '@/components/json/tree-viewer';
import { PreviewPane } from '@/components/shared/preview-pane';
import { ContainerProps, Format } from '@/types';
import yaml from 'js-yaml';
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
import {  ALL_FORMATS, getLanguage } from '@/lib/formats';
import { Separator } from '@/components/ui/separator';
import { format as formatSql } from 'sql-formatter';
import * as prettier from 'prettier/standalone';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginPostcss from 'prettier/plugins/postcss';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';

export function WorkspaceContainer({ initialContent, initialFormat }: ContainerProps) {
    const { resolvedTheme } = useTheme();
    const { content, setContent, format, setFormat, isSaved, setIsSaved } = useEditor({
        initialContent,
        initialFormat,
    });

    // Shell State
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>([
        'system: workspace activated',
        'system: terminal ready'
    ]);

    // UI State
    const [fileName, setFileName] = useState(`index.${getLanguage(initialFormat)}`);

    
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

    const [showEditor, setShowEditor] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState("preview");
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const editorRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Preview Settings
    const [useBootstrap] = useState(true);
    const [useTailwind] = useState(true);

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

    const handleSave = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsSaved?.(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
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
            setIsSaved(true);
            setTerminalOutput(prev => [...prev, 'system: code formatted successfully']);
        } catch (e) {
            console.error(e);
            setTerminalOutput(prev => [...prev, `error: format failed - ${e instanceof Error ? e.message : 'unknown'}`]);
        }
    };

    const handleTerminalSubmit = () => {
        if (!terminalInput.trim()) return;
        const cmd = terminalInput.toLowerCase().trim();
        const newOutput = [...terminalOutput, `$ ${terminalInput}`];

        switch(cmd) {
            case 'help':
                newOutput.push('available commands: clear, format, time, stats, info');
                break;
            case 'clear':
                setTerminalOutput([]);
                setTerminalInput('');
                return;
            case 'format':
                handleAutoFormat();
                break;
            case 'time':
                newOutput.push(`epoch: ${Math.floor(Date.now() / 1000)}`);
                break;
            case 'stats':
                newOutput.push(`chars: ${content.length}`);
                newOutput.push(`lines: ${content.split('\n').length}`);
                break;
            case 'info':
                newOutput.push(`format: ${format}`);
                newOutput.push(`file: ${fileName}`);
                break;
            default:
                newOutput.push(`error: command not found: ${cmd}`);
        }
        setTerminalOutput(newOutput);
        setTerminalInput('');
    };

    const isTabularData = useMemo(() => {
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object';
        } catch {
            return false;
        }
    }, [content]);

    const parsedJson = useMemo(() => {
        try { return JSON.parse(content); } catch { return null; }
    }, [content]);

    return (
        <div className={`flex flex-col w-full bg-background transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[200] h-screen" : "h-full"}`}>
            {/* Unified Workspace Toolbar */}
            <div className="flex items-center justify-between px-4 h-14 border-b bg-muted/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <FileEdit className="size-4 text-primary" />
                        </div>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-semibold text-foreground min-w-[140px]"
                            spellCheck={false}
                        />
                        {!isSaved && <div className="size-2 rounded-full bg-amber-500 animate-pulse" />}
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium uppercase tracking-widest text-muted-foreground gap-2">
                                <span className="text-foreground">{format}</span>
                                <ChevronDown className="size-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[180px]">
                            {ALL_FORMATS.slice(0, 10).map((fmt) => (
                                <DropdownMenuItem key={fmt} onClick={() => handleFormatChange(fmt as Format)} className="text-xs uppercase">
                                    {fmt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Split Canvas */}
            <div className="flex-1 flex overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {showEditor && (
                        <>
                            <ResizablePanel defaultSize={50} minSize={20}>
                                <div className="flex flex-col h-full border-r bg-muted/5">
                                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="size-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={handleAutoFormat} className="size-7 text-muted-foreground hover:text-foreground" title="Format">
                                                <Braces className="size-3.5" />
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
                                        <span>{content.length} characters</span>
                                    </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                        </>
                    )}

                    <ResizablePanel defaultSize={showEditor ? 50 : 100}>
                        <div className="flex flex-col h-full bg-background border-l">
                            <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10">
                                <div className="flex items-center h-8">
                                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase ring-offset-background transition-all bg-background text-foreground shadow-sm h-7">
                                        <Eye className="size-3 mr-2" /> Preview
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 relative overflow-hidden">
                                <PreviewPane 
                                    format={format as any}
                                    content={content}
                                    setContent={setContent}
                                    useBootstrap={useBootstrap}
                                    useTailwind={useTailwind}
                                />
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
