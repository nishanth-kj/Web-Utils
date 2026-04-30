"use client";

import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    RefreshCw, 
    Copy, 
    Check, 
    Settings2, 
    Zap,
    Hash,
    Binary
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function UuidPage() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(5);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generateUuids = () => {
        const newUuids = Array.from({ length: count }, () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            // Fallback for older browsers
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        });
        setUuids(newUuids);
    };

    useEffect(() => {
        generateUuids();
    }, []);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <Shield className="size-8 text-primary" />
                            UUID v4 Generator
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Generate cryptographically strong unique identifiers instantly.
                        </p>
                    </div>
                    <Button onClick={generateUuids} size="lg" className="h-12 px-6 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                        <RefreshCw className="size-4" /> Generate New
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Controls */}
                    <Card className="md:col-span-1 border-border/50 bg-muted/5 h-fit">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Settings2 className="size-3" /> Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Batch Size</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 5, 10, 20, 50].map(n => (
                                        <Button 
                                            key={n} 
                                            variant={count === n ? "secondary" : "outline"} 
                                            className="h-8 text-xs font-bold"
                                            onClick={() => setCount(n)}
                                        >
                                            {n}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Zap className="size-3 text-amber-500" />
                                    <span>V4 (Random) Algorithm</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Hash className="size-3 text-primary" />
                                    <span>128-bit identifiers</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Binary className="size-3 text-primary" />
                                    <span>36 characters total</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results List */}
                    <Card className="md:col-span-2 border-border/50 shadow-md overflow-hidden">
                        <div className="divide-y divide-border">
                            {uuids.map((uuid, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all group">
                                    <code className="text-sm font-mono font-bold text-primary select-all">
                                        {uuid}
                                    </code>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleCopy(uuid, i)}
                                    >
                                        {copiedIndex === i ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
