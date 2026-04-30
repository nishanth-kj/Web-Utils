"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Book, Code, Sparkles, Terminal } from 'lucide-react';
import Footer from "@/components/common/Footer";

export default function DocumentationPage() {
    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <HelpCircle className="size-8 text-indigo-500" />
                        Documentation
                    </h1>
                    <p className="text-muted-foreground">
                        Learn how to use Web Utils to supercharge your developer workflow.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Book className="size-5 text-indigo-500" /> Getting Started
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                Web Utils is a suite of carefully crafted utilities running entirely in your browser. No data is sent to external servers, ensuring complete privacy and security for your sensitive code and tokens.
                            </p>
                            <p>
                                Simply select a tool from the sidebar to begin.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Code className="size-5 text-indigo-500" /> Code Editors
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                All text-based tools use the Monaco Editor (the core of VS Code). This provides you with powerful features like:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Syntax highlighting & validation</li>
                                <li>Minimap for large files</li>
                                <li>Multiple cursors</li>
                                <li>Command Palette (F1)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="size-5 text-indigo-500" /> Formatting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                Need to format an ugly JSON or un-minified HTML block? Most editors have a "Format" button near the top right, or you can right-click anywhere in the editor and select <strong>"Format Document"</strong>.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Terminal className="size-5 text-indigo-500" /> Keyboard Shortcuts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <ul className="space-y-2">
                                <li className="flex justify-between items-center">
                                    <span>Command Palette</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono font-bold">Ctrl + K</kbd>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span>Toggle Sidebar</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono font-bold">Ctrl + B</kbd>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span>Format Document</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono font-bold">Shift + Alt + F</kbd>
                                </li>
                            </ul>
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
