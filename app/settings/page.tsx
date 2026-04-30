"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Moon, Sun, Monitor, Type, Code } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Footer from "@/components/common/Footer";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="h-full overflow-auto bg-background p-6 custom-scrollbar w-full">
            <div className="max-w-4xl mx-auto space-y-8">
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
                                <Input type="number" defaultValue={14} className="w-full bg-muted/50 border-transparent focus-visible:ring-indigo-500" />
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Code className="size-4 text-muted-foreground" /> Tab Size
                                </label>
                                <Input type="number" defaultValue={4} className="w-full bg-muted/50 border-transparent focus-visible:ring-indigo-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="mt-16">
                <Footer />
            </div>
        </div>
    );
}
