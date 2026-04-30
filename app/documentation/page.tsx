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
                                Need to format an ugly JSON or un-minified HTML block? Most editors have a &quot;Format&quot; button near the top right, or you can right-click anywhere in the editor and select <strong>&quot;Format Document&quot;</strong>.
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

                {/* Learn Section */}
                <div className="space-y-6 pt-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Sparkles className="size-6 text-amber-500" />
                        How Things Work
                    </h2>
                    
                    <div className="grid gap-6 md:grid-cols-1">
                        <Card className="border-amber-500/20 bg-amber-500/5 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Book className="size-5 text-amber-500" /> Blockchain Technology
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                                <p>
                                    At its core, a blockchain is a <strong>distributed ledger</strong>. Imagine a digital spreadsheet that is copied thousands of times across a network of computers. This network is designed to regularly update this spreadsheet.
                                </p>
                                <div className="grid md:grid-cols-3 gap-4 py-2">
                                    <div className="space-y-1">
                                        <div className="font-bold text-foreground">1. Blocks</div>
                                        <p className="text-xs">Data is bundled into blocks. Each block has a unique hash and the hash of the previous block.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-bold text-foreground">2. Hashing</div>
                                        <p className="text-xs">A cryptographic fingerprint. If any data in the block changes, the hash changes completely.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-bold text-foreground">3. Consensus</div>
                                        <p className="text-xs">The network must agree on the validity of a block before it is added to the chain.</p>
                                    </div>
                                </div>
                                <p>
                                    This structure makes the blockchain <strong>immutable</strong>—once a block is added, it cannot be changed without changing all subsequent blocks, which would require the consensus of the entire network.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}
