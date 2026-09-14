"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Image as ImageIcon, X, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MonacoEditor as Editor } from "@/components/shared/lazy-monaco";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

import { CodeVideoConfig, DEFAULT_CONFIG, RESOLUTIONS } from "./types";
import { getTheme, getBackground } from "./themes";
import { buildRenderModel, renderFrame, FontInfo } from "./renderer";
import { exportVideo, exportPng, downloadBlob, ExportCancelledError, supportsWebCodecs } from "./use-video-export";
import { SettingsPanel } from "./settings-panel";

const MONACO_LANGUAGE_MAP: Record<string, string> = {
    markup: "html",
    bash: "shell",
    jsx: "javascript",
    tsx: "typescript",
};

const PREVIEW_WIDTH = 1000;
type PersistedSettings = Omit<CodeVideoConfig, "code">;

const DEFAULT_SETTINGS: PersistedSettings = {
    languageId: DEFAULT_CONFIG.languageId,
    themeId: DEFAULT_CONFIG.themeId,
    backgroundId: DEFAULT_CONFIG.backgroundId,
    fileName: DEFAULT_CONFIG.fileName,
    fontSize: DEFAULT_CONFIG.fontSize,
    padding: DEFAULT_CONFIG.padding,
    showLineNumbers: DEFAULT_CONFIG.showLineNumbers,
    showWindowChrome: DEFAULT_CONFIG.showWindowChrome,
    cps: DEFAULT_CONFIG.cps,
    resolutionId: DEFAULT_CONFIG.resolutionId,
    fps: DEFAULT_CONFIG.fps,
};

function formatTime(seconds: number): string {
    const s = Math.max(0, seconds);
    const m = Math.floor(s / 60);
    const rem = (s % 60).toFixed(1).padStart(4, "0");
    return `${m}:${rem}`;
}

function withExtension(fileName: string, ext: string) {
    const base = (fileName || "code").replace(/\.[^./\\]+$/, "");
    return `${base || "code"}.${ext}`;
}

export function CodeVideoContainer({ fontClassName }: { fontClassName: string }) {
    const { resolvedTheme } = useTheme();
    const [settings, setSettings] = useLocalStorage<PersistedSettings>("codeVideoSettings", DEFAULT_SETTINGS);
    const [code, setCode] = useState(DEFAULT_CONFIG.code);

    const config: CodeVideoConfig = useMemo(() => ({ ...settings, code }), [settings, code]);
    const updateSettings = (patch: Partial<PersistedSettings>) => setSettings((prev) => ({ ...prev, ...patch }));

    const theme = useMemo(() => getTheme(config.themeId), [config.themeId]);
    const background = useMemo(() => getBackground(config.backgroundId), [config.backgroundId]);
    const resolution = useMemo(() => RESOLUTIONS.find((r) => r.id === config.resolutionId) ?? RESOLUTIONS[1], [config.resolutionId]);

    const model = useMemo(
        () => buildRenderModel(config.code, config.languageId, theme, config.cps),
        [config.code, config.languageId, theme, config.cps]
    );

    // --- font: resolve next/font's scoped family name once, and make sure the actual file is loaded before we draw with it ---
    const fontProbeRef = useRef<HTMLSpanElement>(null);
    const [font, setFont] = useState<FontInfo>({ family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" });
    const [fontReady, setFontReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const probe = fontProbeRef.current;
        const family = probe ? getComputedStyle(probe).fontFamily : font.family;
        (async () => {
            try {
                if (typeof document !== "undefined" && document.fonts) {
                    await document.fonts.load(`16px ${family}`);
                    await document.fonts.ready;
                }
            } catch {
                // Falls back to the browser's default monospace — a cosmetic miss, not a correctness one.
            }
            if (!cancelled) {
                setFont({ family });
                setFontReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- playback ---
    const [t, setT] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;
        let raf = 0;
        let last = performance.now();
        const step = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            setT((prev) => {
                const next = prev + dt;
                if (next >= model.totalDuration) {
                    setIsPlaying(false);
                    return model.totalDuration;
                }
                return next;
            });
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [isPlaying, model.totalDuration]);

    useEffect(() => {
        setT((prev) => Math.min(prev, model.totalDuration));
    }, [model.totalDuration]);

    const handleTogglePlay = () => {
        if (!isPlaying && t >= model.totalDuration - 0.001) setT(0);
        setIsPlaying((p) => !p);
    };
    const handleRestart = () => {
        setT(0);
        setIsPlaying(true);
    };

    // --- preview canvas ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewHeight = Math.round(PREVIEW_WIDTH * (resolution.height / resolution.width));

    useEffect(() => {
        if (!fontReady) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        renderFrame(ctx, canvas.width, canvas.height, model, config, theme, background, font, t);
    }, [t, model, config, theme, background, font, fontReady, previewHeight]);

    // --- export ---
    const [exportState, setExportState] = useState<"idle" | "video" | "png">("idle");
    const [exportProgress, setExportProgress] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    // Static export prerenders this on the server, where `window` doesn't exist, so the
    // real check must run after mount — otherwise the server/client markup mismatches.
    const [webCodecsSupported, setWebCodecsSupported] = useState(true);
    useEffect(() => {
        setWebCodecsSupported(supportsWebCodecs());
    }, []);

    const handleExportVideo = async () => {
        if (!fontReady || exportState !== "idle") return;
        setIsPlaying(false);
        const controller = new AbortController();
        abortRef.current = controller;
        setExportState("video");
        setExportProgress(0);
        try {
            const { blob, extension, usedFallback } = await exportVideo({
                model,
                config,
                theme,
                background,
                font,
                width: resolution.width,
                height: resolution.height,
                fps: config.fps,
                onProgress: setExportProgress,
                signal: controller.signal,
            });
            downloadBlob(blob, withExtension(config.fileName, extension));
            if (usedFallback) {
                toast.info("Exported as real-time WebM — this browser doesn't support the fast WebCodecs encoder at these settings.");
            } else {
                toast.success("Video exported.");
            }
        } catch (e) {
            if (e instanceof ExportCancelledError) {
                toast.info("Export cancelled.");
            } else {
                console.error(e);
                toast.error("Export failed — try a lower resolution or frame rate.");
            }
        } finally {
            setExportState("idle");
            abortRef.current = null;
        }
    };

    const handleExportPng = async () => {
        if (!fontReady || exportState !== "idle") return;
        try {
            setExportState("png");
            const blob = await exportPng(config, theme, background, model, font);
            downloadBlob(blob, withExtension(config.fileName, "png"));
            toast.success("PNG exported.");
        } catch (e) {
            console.error(e);
            toast.error("PNG export failed.");
        } finally {
            setExportState("idle");
        }
    };

    const handleCancelExport = () => abortRef.current?.abort();

    const monacoLanguage = MONACO_LANGUAGE_MAP[config.languageId] ?? config.languageId;

    return (
        <div className={`flex h-full w-full flex-col bg-background ${fontClassName}`}>
            <span ref={fontProbeRef} aria-hidden className="pointer-events-none absolute -z-10 opacity-0">
                0
            </span>

            <div className="min-h-0 min-w-0 flex-1">
                <ResizablePanelGroup direction="horizontal" className="min-h-0 min-w-0">
                    <ResizablePanel defaultSize={42} minSize={28} className="min-h-0 min-w-0">
                        <ResizablePanelGroup direction="vertical" className="min-h-0 min-w-0">
                            <ResizablePanel defaultSize={55} minSize={20} className="min-h-0 min-w-0">
                                <div className="flex h-full flex-col border-r bg-muted/5">
                                    <div className="flex h-11 shrink-0 items-center justify-between border-b bg-muted/10 px-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source</span>
                                        <span className="text-[10px] font-medium text-muted-foreground">{config.code.length.toLocaleString()} chars</span>
                                    </div>
                                    <div className="relative min-h-0 flex-1">
                                        <Editor
                                            height="100%"
                                            language={monacoLanguage}
                                            value={code}
                                            onChange={(value) => setCode(value ?? "")}
                                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                automaticLayout: true,
                                                padding: { top: 12 },
                                                scrollBeyondLastLine: false,
                                                wordWrap: "on",
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={45} minSize={25} className="min-h-0 min-w-0">
                                <SettingsPanel config={config} onChange={updateSettings} />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={58} minSize={30} className="min-h-0 min-w-0">
                        <div className="flex h-full flex-col bg-background">
                            <div className="flex h-11 shrink-0 items-center justify-between border-b bg-muted/10 px-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preview</span>
                                <span className="text-[10px] font-medium text-muted-foreground">
                                    {resolution.width}×{resolution.height} · {config.fps}fps
                                </span>
                            </div>

                            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
                                {!fontReady ? (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Loader2 className="size-5 animate-spin" />
                                        <span className="text-xs">Loading font…</span>
                                    </div>
                                ) : (
                                    <canvas
                                        ref={canvasRef}
                                        width={PREVIEW_WIDTH}
                                        height={previewHeight}
                                        className="max-h-full max-w-full rounded-lg"
                                        style={{ aspectRatio: `${resolution.width} / ${resolution.height}` }}
                                    />
                                )}
                            </div>

                            <div className="shrink-0 space-y-3 border-t bg-muted/10 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon-sm" onClick={handleTogglePlay} disabled={!fontReady}>
                                        {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={handleRestart} disabled={!fontReady} title="Restart">
                                        <RotateCcw className="size-3.5" />
                                    </Button>
                                    <span className="w-24 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                                        {formatTime(t)} / {formatTime(model.totalDuration)}
                                    </span>
                                    <Slider
                                        value={[Math.min(t, model.totalDuration)]}
                                        min={0}
                                        max={model.totalDuration}
                                        step={0.02}
                                        onValueChange={([v]) => {
                                            setIsPlaying(false);
                                            setT(v);
                                        }}
                                        disabled={!fontReady}
                                        className="flex-1"
                                    />
                                </div>

                                {exportState !== "idle" ? (
                                    <div className="flex items-center gap-3">
                                        <Progress value={exportState === "video" ? exportProgress * 100 : 100} className="h-1.5 flex-1" />
                                        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                                            {exportState === "video" ? `${Math.round(exportProgress * 100)}%` : "…"}
                                        </span>
                                        {exportState === "video" && (
                                            <Button variant="ghost" size="icon-sm" onClick={handleCancelExport} title="Cancel export">
                                                <X className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={handleExportVideo} disabled={!fontReady}>
                                            <Video className="size-3.5" /> Export video
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={handleExportPng} disabled={!fontReady}>
                                            <ImageIcon className="size-3.5" /> Download PNG
                                        </Button>
                                        <span className="text-[10px] text-muted-foreground">
                                            {webCodecsSupported ? "Exports as MP4 (H.264)." : "This browser will export a real-time WebM."}
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
