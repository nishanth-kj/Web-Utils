"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Film, Pause, Play, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FilterControls } from "./filter-controls";
import { DEFAULT_FILTERS, VideoFilters, buildCanvasFilter, formatTime, withExtension } from "./types";
import { ExportCancelledError, downloadBlob, exportTrimmedVideo, supportsVideoExport } from "./use-video-export";

export function VideoEditorContainer() {
    const [file, setFile] = useState<File | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState("video");
    const [isDragging, setIsDragging] = useState(false);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);

    const [filters, setFilters] = useState<VideoFilters>(DEFAULT_FILTERS);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);

    const [exportState, setExportState] = useState<"idle" | "exporting">("idle");
    const [exportProgress, setExportProgress] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const [canExport, setCanExport] = useState(true);
    useEffect(() => {
        setCanExport(supportsVideoExport());
    }, []);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const drawFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2 || !video.videoWidth) return;

        const swapped = filters.rotation === 90 || filters.rotation === 270;
        const w = swapped ? video.videoHeight : video.videoWidth;
        const h = swapped ? video.videoWidth : video.videoHeight;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        ctx.save();
        ctx.filter = buildCanvasFilter(filters);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((filters.rotation * Math.PI) / 180);
        ctx.scale(filters.flipH ? -1 : 1, filters.flipV ? -1 : 1);
        ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2, video.videoWidth, video.videoHeight);
        ctx.restore();
    }, [filters]);

    useEffect(() => {
        if (!isPlaying) drawFrame();
    }, [filters, drawFrame, isPlaying]);

    const loadFile = (f: File) => {
        if (!f.type.startsWith("video/")) {
            toast.error("Please choose a video file.");
            return;
        }
        setFile(f);
        setFileName(f.name.replace(/\.[^./\\]+$/, ""));
        setFilters(DEFAULT_FILTERS);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setTrimRange([0, 0]);
        setObjectUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(f);
        });
    };

    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;
        setDuration(video.duration);
        setTrimRange([0, video.duration]);
        drawFrame();
    };

    // --- playback loop: owns the canvas while the tool isn't exporting ---
    useEffect(() => {
        if (!isPlaying || exportState !== "idle") return;
        let raf = 0;
        const tick = () => {
            const video = videoRef.current;
            if (!video) return;
            drawFrame();
            setCurrentTime(video.currentTime);
            if (video.currentTime >= trimRange[1] - 0.01 || video.ended) {
                video.pause();
                setIsPlaying(false);
                return;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isPlaying, exportState, trimRange, drawFrame]);

    const handleTogglePlay = async () => {
        const video = videoRef.current;
        if (!video || exportState !== "idle") return;
        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
            return;
        }
        if (currentTime >= trimRange[1] - 0.05 || currentTime < trimRange[0] - 0.001) {
            video.currentTime = trimRange[0];
            setCurrentTime(trimRange[0]);
        }
        video.muted = muted;
        video.volume = volume;
        try {
            await video.play();
            setIsPlaying(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRestart = () => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = trimRange[0];
        setCurrentTime(trimRange[0]);
        drawFrame();
    };

    const handleSeek = (value: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        setIsPlaying(false);
        video.currentTime = value;
        setCurrentTime(value);
    };

    const handleTrimChange = ([start, end]: number[]) => {
        setTrimRange([start, end]);
        const video = videoRef.current;
        if (!video) return;
        if (currentTime < start || currentTime > end) {
            video.currentTime = start;
            setCurrentTime(start);
        }
    };

    const handleReset = () => setFilters(DEFAULT_FILTERS);

    const handleExport = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || exportState !== "idle") return;
        video.pause();
        setIsPlaying(false);

        const controller = new AbortController();
        abortRef.current = controller;
        setExportState("exporting");
        setExportProgress(0);
        try {
            const blob = await exportTrimmedVideo({
                video,
                canvas,
                drawFrame,
                trimStart: trimRange[0],
                trimEnd: trimRange[1],
                fps: 30,
                muted,
                volume,
                onProgress: setExportProgress,
                signal: controller.signal,
            });
            downloadBlob(blob, withExtension(fileName, "webm"));
            toast.success("Video exported.");
        } catch (e) {
            if (e instanceof ExportCancelledError) {
                toast.info("Export cancelled.");
            } else {
                console.error(e);
                toast.error(e instanceof Error ? e.message : "Export failed.");
            }
        } finally {
            setExportState("idle");
            abortRef.current = null;
            const v = videoRef.current;
            if (v) {
                v.currentTime = trimRange[0];
                setCurrentTime(trimRange[0]);
            }
        }
    };

    const handleCancelExport = () => abortRef.current?.abort();

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) loadFile(dropped);
    };

    if (!file || !objectUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background p-6">
                <div
                    className={`flex w-full max-w-md flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                >
                    <Film className="size-8 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Drop a video file here, or click to upload</p>
                    <p className="text-xs text-muted-foreground">Trim, adjust, and export — everything stays in your browser.</p>
                    <Button size="sm" className="mt-1 gap-1.5">
                        <Upload className="size-3.5" /> Choose video
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) loadFile(f);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="min-h-0 min-w-0 flex-1">
                <ResizablePanelGroup direction="horizontal" className="min-h-0 min-w-0">
                    <ResizablePanel defaultSize={30} minSize={22} className="min-h-0 min-w-0">
                        <FilterControls
                            filters={filters}
                            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                            onReset={handleReset}
                            volume={volume}
                            onVolumeChange={setVolume}
                            muted={muted}
                            onMutedChange={setMuted}
                        />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={70} minSize={40} className="min-h-0 min-w-0">
                        <div className="flex h-full flex-col bg-background">
                            <div className="flex h-11 shrink-0 items-center justify-between border-b bg-muted/10 px-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preview</span>
                                <Button variant="ghost" size="sm" className="h-6 gap-1.5 px-2 text-[10px] font-semibold" onClick={() => { setFile(null); setObjectUrl((p) => { if (p) URL.revokeObjectURL(p); return null; }); }}>
                                    <X className="size-3" /> New file
                                </Button>
                            </div>

                            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
                                <video
                                    ref={videoRef}
                                    src={objectUrl}
                                    className="absolute h-px w-px opacity-0"
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onSeeked={drawFrame}
                                    playsInline
                                />
                                <canvas ref={canvasRef} className="max-h-full max-w-full rounded-lg bg-black" />
                            </div>

                            <div className="shrink-0 space-y-3 border-t bg-muted/10 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon-sm" onClick={handleTogglePlay} disabled={exportState !== "idle"} title={isPlaying ? "Pause" : "Play"}>
                                        {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={handleRestart} disabled={exportState !== "idle"} title="Jump to trim start">
                                        <RotateCcw className="size-3.5" />
                                    </Button>
                                    <span className="w-20 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                    <Slider
                                        value={[Math.min(currentTime, duration)]}
                                        min={0}
                                        max={duration || 1}
                                        step={0.05}
                                        onValueChange={([v]) => handleSeek(v)}
                                        disabled={exportState !== "idle"}
                                        className="flex-1"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="w-20 shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trim</span>
                                    <Slider
                                        value={trimRange}
                                        min={0}
                                        max={duration || 1}
                                        step={0.05}
                                        minStepsBetweenThumbs={1}
                                        onValueChange={(v) => handleTrimChange(v)}
                                        disabled={exportState !== "idle"}
                                        className="flex-1"
                                    />
                                    <span className="w-24 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                                        {formatTime(trimRange[0])}–{formatTime(trimRange[1])}
                                    </span>
                                </div>

                                {exportState === "exporting" ? (
                                    <div className="flex items-center gap-3">
                                        <Progress value={exportProgress * 100} className="h-1.5 flex-1" />
                                        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">{Math.round(exportProgress * 100)}%</span>
                                        <Button variant="ghost" size="icon-sm" onClick={handleCancelExport} title="Cancel export">
                                            <X className="size-3.5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={handleExport} disabled={!canExport || trimRange[1] - trimRange[0] < 0.1}>
                                            <Film className="size-3.5" />
                                            Export trimmed video
                                        </Button>
                                        <span className="text-[10px] text-muted-foreground">
                                            {canExport ? "Exports the trimmed range as WebM, in real time." : "Your browser doesn't support in-browser video export."}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
