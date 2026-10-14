export class ExportCancelledError extends Error {
    constructor() {
        super("Export cancelled");
        this.name = "ExportCancelledError";
    }
}

export function supportsVideoExport(): boolean {
    return (
        typeof window !== "undefined" &&
        "MediaRecorder" in window &&
        typeof HTMLCanvasElement.prototype.captureStream === "function"
    );
}

interface ExportParams {
    video: HTMLVideoElement;
    canvas: HTMLCanvasElement;
    drawFrame: () => void;
    trimStart: number;
    trimEnd: number;
    fps: number;
    muted: boolean;
    volume: number;
    onProgress: (fraction: number) => void;
    signal: AbortSignal;
}

function pickMimeType(): string {
    const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
}

function waitForSeek(video: HTMLVideoElement, time: number): Promise<void> {
    return new Promise((resolve) => {
        const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
    });
}

export async function exportTrimmedVideo(params: ExportParams): Promise<Blob> {
    const { video, canvas, drawFrame, trimStart, trimEnd, fps, muted, volume, onProgress, signal } = params;

    const canvasStream = canvas.captureStream(fps);
    let audioTracks: MediaStreamTrack[] = [];
    if (!muted) {
        try {
            const capture = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
            audioTracks = capture?.getAudioTracks() ?? [];
        } catch {
            audioTracks = [];
        }
    }

    const combined = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(combined, { mimeType });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
    };
    const stopped = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    const prevMuted = video.muted;
    const prevVolume = video.volume;
    video.muted = muted;
    video.volume = volume;

    await waitForSeek(video, trimStart);

    recorder.start();
    try {
        await video.play();
    } catch (e) {
        recorder.stop();
        video.muted = prevMuted;
        video.volume = prevVolume;
        throw e instanceof Error ? e : new Error("Playback was blocked by the browser.");
    }

    let cancelled = false;
    await new Promise<void>((resolve) => {
        const tick = () => {
            if (signal.aborted) {
                cancelled = true;
                resolve();
                return;
            }
            drawFrame();
            onProgress(Math.min(1, Math.max(0, (video.currentTime - trimStart) / (trimEnd - trimStart))));
            if (video.currentTime >= trimEnd || video.ended) {
                resolve();
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    video.pause();
    recorder.stop();
    const blob = await stopped;

    video.muted = prevMuted;
    video.volume = prevVolume;

    if (cancelled) throw new ExportCancelledError();
    onProgress(1);
    return blob;
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
