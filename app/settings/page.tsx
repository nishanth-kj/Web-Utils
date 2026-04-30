"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Moon, Sun, Monitor, Type, Code, Clock, Globe, Timer } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Footer from "@/components/common/Footer";

import { useLocalStorage } from '@/hooks/use-local-storage';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [fontSize, setFontSize] = useLocalStorage('editorFontSize', 14);
    const [tabSize, setTabSize] = useLocalStorage('editorTabSize', 4);
    const [wordWrap, setWordWrap] = useLocalStorage('editorWordWrap', 'on');
    const [timeZone, setTimeZone] = useLocalStorage('timeZone', 'UTC');
    const [timeFormat, setTimeFormat] = useLocalStorage('timeFormat', 'seconds');

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Settings className="size-8 text-indigo-500" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your preferences, workspace configuration, and themes.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Appearance */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of Web Utils.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant={theme === 'light' ? 'default' : 'outline'} 
                                    className={`flex-1 gap-2 transition-all ${theme === 'light' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`} 
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="size-4" /> Light
                                </Button>
                                <Button 
                                    variant={theme === 'dark' ? 'default' : 'outline'} 
                                    className={`flex-1 gap-2 transition-all ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="size-4" /> Dark
                                </Button>
                                <Button 
                                    variant={theme === 'system' ? 'default' : 'outline'} 
                                    className={`flex-1 gap-2 transition-all ${theme === 'system' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                    onClick={() => setTheme('system')}
                                >
                                    <Monitor className="size-4" /> System
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Editor Preferences */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Editor Configuration</CardTitle>
                            <CardDescription>Default settings for Monaco Editor workspaces.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Type className="size-4 text-muted-foreground" /> Default Font Size
                                </label>
                                <Input 
                                    type="number" 
                                    value={fontSize} 
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full bg-muted/50 border-transparent focus-visible:ring-indigo-500" 
                                />
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Code className="size-4 text-muted-foreground" /> Tab Size
                                </label>
                                <Input 
                                    type="number" 
                                    value={tabSize} 
                                    onChange={(e) => setTabSize(Number(e.target.value))}
                                    className="w-full bg-muted/50 border-transparent focus-visible:ring-indigo-500" 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time & Date Preferences */}
                    <Card className="border-border/50 shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="size-5 text-emerald-500" />
                                Time & Date Configuration
                            </CardTitle>
                            <CardDescription>Default preferences for epoch conversion and time display.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="size-4 text-muted-foreground" /> Default Time Zone
                                    </label>
                                    <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
                                        <Button 
                                            variant={timeZone === 'UTC' ? 'secondary' : 'ghost'} 
                                            size="sm" 
                                            className="h-8 text-xs font-bold"
                                            onClick={() => setTimeZone('UTC')}
                                        >
                                            UTC / GMT
                                        </Button>
                                        <Button 
                                            variant={timeZone === 'Local' ? 'secondary' : 'ghost'} 
                                            size="sm" 
                                            className="h-8 text-xs font-bold"
                                            onClick={() => setTimeZone('Local')}
                                        >
                                            Local Time
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Sets the primary display format for human-readable dates.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Timer className="size-4 text-muted-foreground" /> Default Epoch Format
                                    </label>
                                    <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
                                        <Button 
                                            variant={timeFormat === 'seconds' ? 'secondary' : 'ghost'} 
                                            size="sm" 
                                            className="h-8 text-xs font-bold"
                                            onClick={() => setTimeFormat('seconds')}
                                        >
                                            Seconds (10 digits)
                                        </Button>
                                        <Button 
                                            variant={timeFormat === 'millis' ? 'secondary' : 'ghost'} 
                                            size="sm" 
                                            className="h-8 text-xs font-bold"
                                            onClick={() => setTimeFormat('millis')}
                                        >
                                            Millis (13 digits)
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Default precision when using "Now" or generating timestamps.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card className="border-border/50 shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Data Management</CardTitle>
                            <CardDescription>Export or import your application settings and workspace data.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button 
                                variant="secondary" 
                                className="gap-2"
                                onClick={() => {
                                    const data = { ...localStorage };
                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `web-utils-settings-${new Date().toISOString().split('T')[0]}.json`;
                                    a.click();
                                }}
                            >
                                <Code className="size-4" /> Export Settings
                            </Button>
                            
                            <div className="relative">
                                <Input 
                                    type="file" 
                                    accept=".json"
                                    className="hidden" 
                                    id="import-settings"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                try {
                                                    const data = JSON.parse(event.target?.result as string);
                                                    Object.entries(data).forEach(([key, value]) => {
                                                        localStorage.setItem(key, value as string);
                                                    });
                                                    window.location.reload();
                                                } catch (err) {
                                                    alert('Invalid settings file');
                                                }
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                />
                                <Button 
                                    variant="outline" 
                                    className="gap-2"
                                    onClick={() => document.getElementById('import-settings')?.click()}
                                >
                                    <Monitor className="size-4" /> Import Settings
                                </Button>
                            </div>

                            <Button 
                                variant="destructive" 
                                className="gap-2"
                                onClick={() => {
                                    if (confirm('Are you sure you want to reset all settings? This will reload the page.')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                            >
                                <Settings className="size-4" /> Reset All
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}
