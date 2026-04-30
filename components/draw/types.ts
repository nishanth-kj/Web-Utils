import { LucideIcon } from "lucide-react";

export type ElementType = 'selection' | 'hand' | 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'line' | 'freehand' | 'eraser' | 'text';

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
