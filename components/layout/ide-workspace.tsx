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
import { PreviewPane } from "@/components/shared/preview-pane";
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
                                <div className="bg-transparent h-12 w-full flex items-center justify-start gap-2 p-0">
                                    <div className="border-b-2 border-indigo-600 flex items-center h-12 px-4 gap-2 font-bold text-xs uppercase tracking-wider text-indigo-600">
                                        <Eye className="size-3.5" /> Preview
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 relative overflow-hidden">
                                <PreviewPane format={language as any} content={code} />
                            </div>
                        </Tabs>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
