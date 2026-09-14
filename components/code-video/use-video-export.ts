import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { renderFrame, measureStaticSize, RenderModel, FontInfo } from "./renderer";
import { CodeTheme, BackgroundPreset } from "./themes";
import { CodeVideoConfig } from "./types";

export class ExportCancelledError extends Error {
    constructor() {
        super("Export cancelled");
        this.name = "ExportCancelledError";
    }
}

export class UnsupportedExportError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnsupportedExportError";
    }
}

interface ExportParams {
    model: RenderModel;
    config: CodeVideoConfig;
    theme: CodeTheme;
    background: BackgroundPreset;
    font: FontInfo;
    width: number;
    height: number;
    fps: number;
    onProgress: (fraction: number) => void;
    signal: AbortSignal;
}

// H.264 level limits (ITU-T H.264 Table A-1), enough to pick a level string
// that legally covers the requested resolution/framerate combination.
const H264_LEVELS: { hex: string; maxMBPS: number; maxFS: number }[] = [
    { hex: "1F", maxMBPS: 108000, maxFS: 3600 },
    { hex: "20", maxMBPS: 216000, maxFS: 5120 },
    { hex: "28", maxMBPS: 245760, maxFS: 8192 },
    { hex: "2A", maxMBPS: 522240, maxFS: 8704 },
    { hex: "32", maxMBPS: 589824, maxFS: 22080 },
    { hex: "33", maxMBPS: 983040, maxFS: 36864 },
    { hex: "34", maxMBPS: 2073600, maxFS: 36864 },
    { hex: "3C", maxMBPS: 4177920, maxFS: 139264 },
    { hex: "3D", maxMBPS: 8355840, maxFS: 139264 },
    { hex: "3E", maxMBPS: 16711680, maxFS: 139264 },
];

function buildCodecString(width: number, height: number, fps: number): string {
    const mbW = Math.ceil(width / 16);
    const mbH = Math.ceil(height / 16);
    const fs = mbW * mbH;
    const mbps = fs * fps;
    const level = H264_LEVELS.find((l) => fs <= l.maxFS && mbps <= l.maxMBPS) ?? H264_LEVELS[H264_LEVELS.length - 1];
    return `avc1.6400${level.hex}`;
}

function clampBitrate(bits: number): number {
    return Math.max(4_000_000, Math.min(120_000_000, Math.round(bits)));
}

export function supportsWebCodecs(): boolean {
    return typeof window !== "undefined" && "VideoEncoder" in window && "VideoFrame" in window;
}

function yieldToUI(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function exportMp4(params: ExportParams): Promise<Blob> {
    const { model, config, theme, background, font, width, height, fps, onProgress, signal } = params;
    const codec = buildCodecString(width, height, fps);
    const bitrate = clampBitrate(width * height * fps * 0.07);

    const support = await VideoEncoder.isConfigSupported({ codec, width, height, bitrate });
    if (!support.supported) {
        throw new UnsupportedExportError(`This browser can't hardware-encode ${width}×${height} @ ${fps}fps H.264.`);
    }

    const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: { codec: "avc", width, height, frameRate: fps },
        fastStart: "in-memory",
    });

    const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error("VideoEncoder error", e),
    });
    encoder.configure({ codec, width, height, bitrate, bitrateMode: "variable" });

    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;

    const totalFrames = Math.max(1, Math.round(model.totalDuration * fps));
    const frameDurationUs = Math.round(1_000_000 / fps);

    try {
        for (let i = 0; i < totalFrames; i++) {
            if (signal.aborted) throw new ExportCancelledError();

            const t = i / fps;
            renderFrame(ctx, width, height, model, config, theme, background, font, t);

            const frame = new VideoFrame(offscreen, {
                timestamp: i * frameDurationUs,
                duration: frameDurationUs,
            });
            encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
            frame.close();

            onProgress(i / totalFrames);

            while (encoder.encodeQueueSize > 24) {
                if (signal.aborted) throw new ExportCancelledError();
                await yieldToUI();
            }
            if (i % 3 === 0) await yieldToUI();
        }

        await encoder.flush();
        muxer.finalize();
        onProgress(1);

        const { buffer } = muxer.target;
        return new Blob([buffer], { type: "video/mp4" });
    } finally {
        if (encoder.state !== "closed") encoder.close();
    }
}

export async function exportWebmRealtime(params: ExportParams): Promise<Blob> {
    const { model, config, theme, background, font, width, height, fps, onProgress, signal } = params;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;

    const stream = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(fps);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: clampBitrate(width * height * fps * 0.07) });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
    };

    const stopped = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    recorder.start();

    let cancelled = false;
    await new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = () => {
            if (signal.aborted) {
                cancelled = true;
                resolve();
                return;
            }
            const elapsed = (performance.now() - start) / 1000;
            const t = Math.min(elapsed, model.totalDuration);
            renderFrame(ctx, width, height, model, config, theme, background, font, t);
            onProgress(Math.min(1, t / model.totalDuration));
            if (t >= model.totalDuration) {
                resolve();
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    recorder.stop();
    const blob = await stopped;
    if (cancelled) throw new ExportCancelledError();
    return blob;
}

export async function exportVideo(params: ExportParams): Promise<{ blob: Blob; extension: string; usedFallback: boolean }> {
    if (supportsWebCodecs()) {
        try {
            const blob = await exportMp4(params);
            return { blob, extension: "mp4", usedFallback: false };
        } catch (e) {
            if (e instanceof ExportCancelledError) throw e;
            if (!(e instanceof UnsupportedExportError)) throw e;
            // Fall through to the real-time WebM path below.
        }
    }
    const blob = await exportWebmRealtime(params);
    return { blob, extension: "webm", usedFallback: true };
}

export async function exportPng(config: CodeVideoConfig, theme: CodeTheme, background: BackgroundPreset, model: RenderModel, font: FontInfo): Promise<Blob> {
    const { width, height } = measureStaticSize(config, model, font, 2);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
    renderFrame(ctx, width, height, model, config, theme, background, font, model.totalDuration, { staticFull: true, scale: 2 });

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("PNG export failed"));
        }, "image/png");
    });
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
