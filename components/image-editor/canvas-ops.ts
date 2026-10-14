import { CropRect, ExportFormat } from "./types";

export function loadImageAsCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error("Canvas is not supported in this browser."));
                return;
            }
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not load that image."));
        };
        img.src = url;
    });
}

export function cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext("2d")?.drawImage(source, 0, 0);
    return canvas;
}

export function rotateCanvas90(source: HTMLCanvasElement, clockwise: boolean): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = source.height;
    canvas.height = source.width;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(((clockwise ? 90 : -90) * Math.PI) / 180);
    ctx.drawImage(source, -source.width / 2, -source.height / 2);
    return canvas;
}

export function flipCanvas(source: HTMLCanvasElement, horizontal: boolean): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    if (horizontal) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
    }
    ctx.drawImage(source, 0, 0);
    return canvas;
}

export function cropCanvas(source: HTMLCanvasElement, rect: CropRect): HTMLCanvasElement {
    const sx = Math.round(rect.x * source.width);
    const sy = Math.round(rect.y * source.height);
    const sw = Math.max(1, Math.round(rect.width * source.width));
    const sh = Math.max(1, Math.round(rect.height * source.height));

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas;
}

export function resizeCanvas(source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export function renderWithFilter(source: HTMLCanvasElement, filter: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.filter = filter;
    ctx.drawImage(source, 0, 0);
    return canvas;
}

export function exportCanvas(canvas: HTMLCanvasElement, format: ExportFormat, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Export failed."))),
            format === "png" ? "image/png" : "image/jpeg",
            format === "jpeg" ? quality : undefined
        );
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
