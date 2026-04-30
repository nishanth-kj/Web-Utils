"use client";

import React, { useState } from 'react';
import { 
    FilePlus, 
    Download, 
    Info, 
    FileText, 
    Binary, 
    Type,
    FileBox,
    Database,
    Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DummyFilePage() {
    const [size, setSize] = useState(1);
    const [unit, setUnit] = useState<'KB' | 'MB' | 'GB'>('MB');
    const [extension, setExtension] = useState('bin');
    const [fileName, setFileName] = useState('test-file');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateFile = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const multiplier = unit === 'KB' ? 1024 : unit === 'MB' ? 1024 * 1024 : 1024 * 1024 * 1024;
            const byteSize = size * multiplier;
            
            // For large files, we use a more efficient way if possible, 
            // but for browser-side, we'll create a blob from an arraybuffer
            try {
                const buffer = new Uint8Array(byteSize);
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.${extension}`;
                link.click();
                URL.revokeObjectURL(url);
            } catch (e) {
                alert("File too large for browser memory. Try a smaller size.");
            }
            setIsGenerating(false);
        }, 500);
    };

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <FilePlus className="size-8 text-primary" />
                            Dummy File Generator
                        </h1>
                        <p className="text-muted-foreground">
                            Create placeholder files for testing uploads, storage, or network performance.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 border-border/50 shadow-md bg-muted/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Name</label>
                                    <Input 
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        placeholder="test-file"
                                        className="h-10 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extension</label>
                                    <Input 
                                        value={extension}
                                        onChange={(e) => setExtension(e.target.value)}
                                        placeholder="bin"
                                        className="h-10 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">File Size</label>
                                <div className="flex gap-4">
                                    <Input 
                                        type="number"
                                        min="1"
                                        value={size}
                                        onChange={(e) => setSize(parseInt(e.target.value) || 1)}
                                        className="h-12 text-lg font-bold w-32"
                                    />
                                    <Tabs 
                                        value={unit} 
                                        onValueChange={(v) => setUnit(v as any)} 
                                        className="flex-1"
                                    >
                                        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
                                            <TabsTrigger value="KB" className="font-black text-xs">KB</TabsTrigger>
                                            <TabsTrigger value="MB" className="font-black text-xs">MB</TabsTrigger>
                                            <TabsTrigger value="GB" className="font-black text-xs">GB</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button 
                                    className="w-full h-14 text-sm font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20"
                                    onClick={generateFile}
                                    disabled={isGenerating || size <= 0}
                                >
                                    {isGenerating ? (
                                        <Cpu className="size-5 animate-spin" />
                                    ) : (
                                        <Download className="size-5" />
                                    )}
                                    {isGenerating ? 'Generating...' : 'Generate & Download'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Info className="size-4 text-primary" /> Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                            <p>
                                This tool creates a file of the specified size filled with null bytes (0x00).
                            </p>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-3 text-primary" />
                                    <span>Simulate log files</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Binary className="size-3 text-primary" />
                                    <span>Test binary uploads</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="size-3 text-primary" />
                                    <span>Stress test storage</span>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <p className="italic">
                                Note: Generating very large files (GB+) may cause your browser to hang temporarily as it allocates memory.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
