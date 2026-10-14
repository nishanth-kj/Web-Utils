export type Rotation = 0 | 90 | 180 | 270;

export interface VideoFilters {
    brightness: number;
    contrast: number;
    saturation: number;
    grayscale: boolean;
    sepia: boolean;
    invert: boolean;
    rotation: Rotation;
    flipH: boolean;
    flipV: boolean;
}

export const DEFAULT_FILTERS: VideoFilters = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    sepia: false,
    invert: false,
    rotation: 0,
    flipH: false,
    flipV: false,
};

export function buildCanvasFilter(f: VideoFilters): string {
    const parts = [`brightness(${f.brightness}%)`, `contrast(${f.contrast}%)`, `saturate(${f.saturation}%)`];
    if (f.grayscale) parts.push("grayscale(100%)");
    if (f.sepia) parts.push("sepia(100%)");
    if (f.invert) parts.push("invert(100%)");
    return parts.join(" ");
}

export function withExtension(fileName: string, ext: string): string {
    const base = (fileName || "video").replace(/\.[^./\\]+$/, "");
    return `${base || "video"}.${ext}`;
}

export function formatTime(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = (s % 60).toString().padStart(2, "0");
    return `${m}:${rem}`;
}
