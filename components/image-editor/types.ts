export interface ImageAdjustments {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: boolean;
    sepia: boolean;
    invert: boolean;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: false,
    sepia: false,
    invert: false,
};

export function buildCanvasFilter(a: ImageAdjustments): string {
    const parts = [`brightness(${a.brightness}%)`, `contrast(${a.contrast}%)`, `saturate(${a.saturation}%)`];
    if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
    if (a.grayscale) parts.push("grayscale(100%)");
    if (a.sepia) parts.push("sepia(100%)");
    if (a.invert) parts.push("invert(100%)");
    return parts.join(" ");
}

// Fractions (0-1) of the working canvas's width/height, so the crop box
// never goes stale when the overlay is resized or the canvas is replaced.
export interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const DEFAULT_CROP_RECT: CropRect = { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };

export type ExportFormat = "png" | "jpeg";

export function withExtension(fileName: string, ext: string): string {
    const base = (fileName || "image").replace(/\.[^./\\]+$/, "");
    return `${base || "image"}.${ext}`;
}
