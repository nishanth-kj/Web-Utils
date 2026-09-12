"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
    FilePlus,
    Download,
    Info,
    FileText,
    Binary,
    Database,
    Cpu,
    X,
    AlertTriangle,
    Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Unit = 'KB' | 'MB' | 'GB';

const UNIT_MULTIPLIERS: Record<Unit, number> = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
};

const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB per write/yield

// Holding the whole file in memory as a single Blob risks crashing the tab
// above this size. Browsers with the File System Access API stream straight
// to disk instead and aren't bound by this limit (bounded by MAX_STREAM_BYTES
// instead, mainly to stop an accidental extra zero from filling the disk).
const MAX_IN_MEMORY_BYTES = 500 * 1024 * 1024; // 500 MB
const MAX_STREAM_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

interface SaveFilePickerOptions {
    suggestedName: string;
}

interface FileSystemWritableFileStream {
    write(data: Uint8Array): Promise<void>;
    close(): Promise<void>;
    abort(): Promise<void>;
}

interface FileSystemFileHandleLike {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

// TypeScript's DOM lib doesn't declare this Chromium-only API yet.
type FileSystemAccessWindow = Window & {
    showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike>;
};

function canStreamToDisk(): boolean {
    return typeof window !== 'undefined' && typeof (window as FileSystemAccessWindow).showSaveFilePicker === 'function';
}

function formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = -1;
    do {
        value /= 1024;
        unitIndex++;
    } while (value >= 1024 && unitIndex < units.length - 1);
    return `${value.toFixed(value < 10 ? 2 : 1)} ${units[unitIndex]}`;
}

export function DummyFilePage() {
    const [sizeInput, setSizeInput] = useState('1');
    const [unit, setUnit] = useState<Unit>('MB');
    const [extension, setExtension] = useState('bin');
    const [fileName, setFileName] = useState('test-file');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    // Seeded as false (matching the server, which has no `window`) so the
    // first client render agrees with SSR; the real capability is detected
    // right after mount instead of read directly during render.
    const [streamingSupported, setStreamingSupported] = useState(false);
    const cancelRef = useRef(false);

    useEffect(() => {
        setStreamingSupported(canStreamToDisk());
    }, []);

    const parsedSize = Math.max(0, Math.floor(Number(sizeInput) || 0));
    const byteSize = parsedSize * UNIT_MULTIPLIERS[unit];
    const overStreamLimit = streamingSupported && byteSize > MAX_STREAM_BYTES;
    const overMemoryLimit = !streamingSupported && byteSize > MAX_IN_MEMORY_BYTES;
    const isValidSize = parsedSize > 0 && !overStreamLimit && !overMemoryLimit;

    const handleSizeBlur = () => {
        if (!sizeInput.trim() || Number.isNaN(Number(sizeInput)) || Number(sizeInput) <= 0) {
            setSizeInput('1');
        }
    };

    const handleCancel = () => {
        cancelRef.current = true;
    };

    const generateWithFileSystemAccess = async (filename: string, totalBytes: number) => {
        const picker = (window as FileSystemAccessWindow).showSaveFilePicker!;
        const handle = await picker({ suggestedName: filename });
        const writable = await handle.createWritable();
        const chunk = new Uint8Array(CHUNK_SIZE);
        let written = 0;

        try {
            while (written < totalBytes) {
                if (cancelRef.current) {
                    await writable.abort();
                    return;
                }
                const remaining = totalBytes - written;
                const toWrite = remaining < CHUNK_SIZE ? chunk.subarray(0, remaining) : chunk;
                await writable.write(toWrite);
                written += toWrite.byteLength;
                setProgress(Math.round((written / totalBytes) * 100));
            }
            await writable.close();
        } catch (err) {
            await writable.abort().catch(() => {});
            throw err;
        }
    };

    const generateWithBlob = async (filename: string, totalBytes: number) => {
        const parts: Uint8Array<ArrayBuffer>[] = [];
        let written = 0;

        while (written < totalBytes) {
            if (cancelRef.current) return;
            const remaining = totalBytes - written;
            const size = Math.min(CHUNK_SIZE, remaining);
            parts.push(new Uint8Array(size)); // zero-filled null bytes
            written += size;
            setProgress(Math.round((written / totalBytes) * 100));
            // Yield to the event loop so the tab stays responsive while building large files.
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        if (cancelRef.current) return;

        const blob = new Blob(parts, { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            URL.revokeObjectURL(url);
        }
    };

    const generateFile = async () => {
        if (!isValidSize || isGenerating) return;

        setError(null);
        setProgress(0);
        setIsGenerating(true);
        cancelRef.current = false;

        const safeName = fileName.trim() || 'test-file';
        const safeExt = extension.trim().replace(/^\.+/, '') || 'bin';
        const filename = `${safeName}.${safeExt}`;

        try {
            if (streamingSupported) {
                await generateWithFileSystemAccess(filename, byteSize);
            } else {
                await generateWithBlob(filename, byteSize);
            }
        } catch (err) {
            const isUserCancel = err instanceof DOMException && err.name === 'AbortError';
            if (!isUserCancel) {
                setError(err instanceof Error ? err.message : 'File generation failed. Try a smaller size.');
            }
        } finally {
            setIsGenerating(false);
            setProgress(0);
            cancelRef.current = false;
        }
    };

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <FilePlus className="size-8 text-primary" />
                            Dummy File Generator
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Create placeholder files for testing uploads, storage, or network performance.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 border-border/50 shadow-md bg-muted/5">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Settings2 className="size-3" /> Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Name</label>
                                    <Input
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        placeholder="test-file"
                                        disabled={isGenerating}
                                        className="h-10 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extension</label>
                                    <Input
                                        value={extension}
                                        onChange={(e) => setExtension(e.target.value)}
                                        placeholder="bin"
                                        disabled={isGenerating}
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
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        onBlur={handleSizeBlur}
                                        disabled={isGenerating}
                                        className="h-12 text-lg font-bold w-32"
                                    />
                                    <Tabs
                                        value={unit}
                                        onValueChange={(v) => setUnit(v as Unit)}
                                        className="flex-1"
                                    >
                                        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
                                            <TabsTrigger value="KB" disabled={isGenerating} className="font-black text-xs">KB</TabsTrigger>
                                            <TabsTrigger value="MB" disabled={isGenerating} className="font-black text-xs">MB</TabsTrigger>
                                            <TabsTrigger value="GB" disabled={isGenerating} className="font-black text-xs">GB</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">
                                    ≈ {formatBytes(byteSize)} ({byteSize.toLocaleString()} bytes)
                                </p>
                            </div>

                            {(overMemoryLimit || overStreamLimit) && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="size-4" />
                                    <AlertDescription>
                                        {overMemoryLimit
                                            ? `Your browser can't stream files to disk, so sizes above ${formatBytes(MAX_IN_MEMORY_BYTES)} risk crashing the tab. Use Chrome or Edge for larger files, or pick a smaller size.`
                                            : `${formatBytes(MAX_STREAM_BYTES)} is the largest file this tool will generate in one go. Pick a smaller size.`}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="size-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {isGenerating && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                        <span>Generating…</span>
                                        <span className="tabular-nums">{progress}%</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <Button
                                    className="flex-1 h-14 text-sm font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20"
                                    onClick={generateFile}
                                    disabled={isGenerating || !isValidSize}
                                >
                                    {isGenerating ? (
                                        <Cpu className="size-5 animate-spin" />
                                    ) : (
                                        <Download className="size-5" />
                                    )}
                                    {isGenerating ? 'Generating…' : 'Generate & Download'}
                                </Button>
                                {isGenerating && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 px-4"
                                        onClick={handleCancel}
                                        aria-label="Cancel generation"
                                    >
                                        <X className="size-5" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Info className="size-3 text-primary" /> Info
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
                            {streamingSupported ? (
                                <p>
                                    Your browser supports streaming files directly to disk, so generation
                                    isn&apos;t limited by available memory (up to {formatBytes(MAX_STREAM_BYTES)} per file).
                                </p>
                            ) : (
                                <p className="italic">
                                    Your browser builds the file in memory before download, so sizes are capped
                                    at {formatBytes(MAX_IN_MEMORY_BYTES)} to avoid crashing the tab. Chrome or
                                    Edge can stream larger files directly to disk instead.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
