"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Panel, 
    Group as PanelGroup, 
    Separator as PanelResizeHandle 
} from 'react-resizable-panels';
import { 
    Play, 
    Save, 
    RotateCcw, 
    Eye, 
    Braces, 
    Clock, 
    Terminal as TerminalIcon,
    Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonTreeViewer } from "@/components/json/tree-viewer";
import { useTheme } from "next-themes";

export function IdeWorkspace() {
    const [code, setCode] = useState('{\n  "name": "Web Utils Pro",\n  "status": "Ready",\n  "timestamp": 1711206600\n}');
    const [language, setLanguage] = useState('json');
    const { theme } = useTheme();

    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>([
        'system: ide workspace activated',
        'system: terminal ready'
    ]);

    const handleTerminalSubmit = () => {
        if (!terminalInput.trim()) return;
        
        const cmd = terminalInput.toLowerCase();
        const newOutput = [...terminalOutput, `$${terminalInput}`];

        switch(cmd) {
            case 'help':
                newOutput.push('available commands:');
                newOutput.push(' - clear: clear the terminal');
                newOutput.push(' - json-format: format the editor content');
                newOutput.push(' - time: show current epoch');
                newOutput.push(' - build: simulate build process');
                break;
            case 'clear':
                setTerminalOutput([]);
                setTerminalInput('');
                return;
            case 'json-format':
                try {
                    const formatted = JSON.stringify(JSON.parse(code), null, 2);
                    setCode(formatted);
                    newOutput.push('success: json formatted');
                } catch(e: unknown) {
                    console.error('Error : ', e);
                    newOutput.push(`error: invalid json `);
                }
                break;
            case 'time':
                newOutput.push(`current epoch: ${Math.floor(Date.now() / 1000)}`);
                break;
            case 'build':
                newOutput.push('build: starting optimization...');
                newOutput.push('build: generated 18 static pages');
                newOutput.push('build: success in 234ms');
                break;
            default:
                newOutput.push(`error: command not found: ${cmd}`);
        }

        setTerminalOutput(newOutput);
        setTerminalInput('');
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value) setCode(value);
    };

    let parsedJson = null;
    try {
        parsedJson = JSON.parse(code);
    } catch (e: unknown) {
        console.error('Error : ', e);
    }

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* IDE Toolbar */}
            <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-white dark:bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
                        >
                            <option value="json">scratchpad.json</option>
                            <option value="html">index.html</option>
                            <option value="javascript">main.js</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold">
                        <RotateCcw className="size-3.5" /> Reset
                    </Button>
                    <Button size="sm" className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                        <Save className="size-3.5" /> Save
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                        <Play className="size-3.5" /> Run
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <PanelGroup orientation="horizontal" className="flex-1">
                {/* Editor Panel */}
                <Panel defaultSize={60} minSize={30}>
                    <div className="h-full relative group">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            theme={theme === 'dark' ? 'vs-dark' : 'light'}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontWeight: "500",
                                padding: { top: 20 },
                                roundedSelection: true,
                                cursorSmoothCaretAnimation: "on",
                                smoothScrolling: true,
                                contextmenu: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500/20 transition-colors border-x border-zinc-200 dark:border-zinc-800" />

                {/* Right Panel (Tools & Preview) */}
                <Panel defaultSize={40} minSize={20}>
                    <div className="h-full bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
                        <Tabs defaultValue="preview" className="h-full flex flex-col">
                            <div className="px-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/20">
                                <TabsList className="bg-transparent h-12 w-full justify-start gap-2 p-0">
                                    <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 border-b-2 border-transparent rounded-none h-12 px-4 gap-2 font-bold text-xs uppercase tracking-wider transition-all">
                                        <Eye className="size-3.5" /> Preview
                                    </TabsTrigger>
                                    <TabsTrigger value="json" className="data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 border-b-2 border-transparent rounded-none h-12 px-4 gap-2 font-bold text-xs uppercase tracking-wider transition-all">
                                        <Braces className="size-3.5" /> JSON Tree
                                    </TabsTrigger>
                                    <TabsTrigger value="time" className="data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 border-b-2 border-transparent rounded-none h-12 px-4 gap-2 font-bold text-xs uppercase tracking-wider transition-all">
                                        <Clock className="size-3.5" /> Time
                                    </TabsTrigger>
                                    <TabsTrigger value="terminal" className="data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 border-b-2 border-transparent rounded-none h-12 px-4 gap-2 font-bold text-xs uppercase tracking-wider transition-all">
                                        <TerminalIcon className="size-3.5" /> Terminal
                                    </TabsTrigger>
                                    <TabsTrigger value="console" className="ml-auto data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 border-b-2 border-transparent rounded-none h-12 px-4 gap-2 font-bold text-xs uppercase tracking-wider transition-all">
                                        <Eye className="size-3.5" /> Console
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                                <TabsContent value="preview" className="h-full m-0">
                                    {language === 'html' ? (
                                        <div className="h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white overflow-hidden shadow-sm">
                                            <iframe 
                                                title="Preview"
                                                srcDoc={code}
                                                className="w-full h-full border-none"
                                                sandbox="allow-scripts"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 font-medium bg-zinc-50/50 dark:bg-zinc-950/50">
                                            <div className="flex flex-col items-center gap-2">
                                                <Globe className="size-8 opacity-20" />
                                                <span>HTML Preview Available</span>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="json" className="h-full m-0">
                                    <JsonTreeViewer data={parsedJson} />
                                </TabsContent>
                                <TabsContent value="time" className="h-full m-0">
                                    <div className="p-4 space-y-4">
                                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                                            <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Selected Timestamp</h4>
                                            <p className="text-2xl font-black text-zinc-900 dark:text-white">1711206600</p>
                                            <div className="h-px bg-indigo-500/10 my-2" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Local Time</span>
                                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">2024-03-23 20:30:00</p>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase">UTC Time</span>
                                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">2024-03-23 15:00:00</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="terminal" className="h-full m-0 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                                    <div className="p-4 font-mono text-[13px] h-full flex flex-col gap-1 lowercase">
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold mb-2">
                                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span>web-utils-shell v1.0</span>
                                        </div>
                                        <p className="text-zinc-500 pb-2 border-b border-zinc-900 mb-2 tracking-tighter">type &apos;help&apos; to see available commands</p>
                                        
                                        <div className="flex-1 overflow-auto space-y-1 custom-scrollbar">
                                            {terminalOutput.map((line, i) => (
                                                <p key={i} className="text-zinc-400 break-all leading-tight">
                                                    {line.startsWith('>') ? (
                                                        <span className="text-indigo-400 font-bold mr-2 tracking-widest">{line.substring(0, 1)}</span>
                                                    ) : line.startsWith('$') ? (
                                                        <span className="text-emerald-500 font-bold mr-2">$</span>
                                                    ) : null}
                                                    {line.startsWith('>') || line.startsWith('$') ? line.substring(1) : line}
                                                </p>
                                            ))}
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-indigo-500 font-black">$</span>
                                            <input 
                                                className="bg-transparent border-none outline-none text-zinc-100 w-full" 
                                                autoFocus 
                                                spellCheck={false}
                                                value={terminalInput}
                                                onChange={(e) => setTerminalInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleTerminalSubmit();
                                                }}
                                                placeholder="run command..."
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="console" className="h-full m-0">
                                    <div className="p-4 font-mono text-[11px] space-y-2 text-zinc-500">
                                        <p><span className="text-emerald-500">[System]</span> Workspace initialized successfully.</p>
                                        <p><span className="text-indigo-500">[Info]</span> Loaded language: {language}</p>
                                        <p className="animate-pulse"><span className="text-zinc-400">_</span></p>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
