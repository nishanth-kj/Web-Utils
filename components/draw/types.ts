

export type ElementType = 'selection' | 'hand' | 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'line' | 'freehand' | 'eraser' | 'text' | 'image';

export interface Element {
    id: number;
    type: ElementType;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    points?: { x: number, y: number }[];
    color: string;
    strokeWidth: number;
    zIndex: number;
    text?: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface RoughOptions {
    stroke?: string;
    strokeWidth?: number;
    roughness?: number;
    bowing?: number;
    seed?: number;
}

export interface RoughGenerator {
    line: (x1: number, y1: number, x2: number, y2: number, options: RoughOptions) => unknown;
    rectangle: (x: number, y: number, width: number, height: number, options: RoughOptions) => unknown;
    polygon: (pts: [number, number][], options: RoughOptions) => unknown;
    ellipse: (x: number, y: number, width: number, height: number, options: RoughOptions) => unknown;
    curve: (pts: [number, number][], options: RoughOptions) => unknown;
}

export interface RoughCanvas {
    draw: (drawable: unknown) => void;
    generator: RoughGenerator;
}
