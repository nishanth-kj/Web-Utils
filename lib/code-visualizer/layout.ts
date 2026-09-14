import type { ExecutionStep, HeapObject, StackFrame } from "./types";

export const FRAME_NODE_WIDTH = 220;
export const HEAP_NODE_WIDTH = 200;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 32;
const FRAME_GAP_Y = 24;
const HEAP_GAP_X = 32;
const HEAP_GAP_Y = 24;
const HEAP_COLS = 3;
const COLUMN_GAP_X = 160;

export interface FrameNodePosition {
    frame: StackFrame;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface HeapNodePosition {
    object: HeapObject;
    x: number;
    y: number;
    width: number;
    height: number;
}

function frameHeight(frame: StackFrame): number {
    return HEADER_HEIGHT + Math.max(frame.variables.length, 1) * ROW_HEIGHT + 8;
}

function heapHeight(obj: HeapObject): number {
    return HEADER_HEIGHT + Math.max(obj.entries.length, 1) * ROW_HEIGHT + 8;
}

/**
 * Frames stack vertically on the left in call order (global on top, most recently
 * called function at the bottom — the order ExecutionStep.frames is already in).
 * Heap objects wrap into a grid on the right in creation order (their numeric id
 * suffix), mirroring the "Frames | Objects" split of Python Tutor's own layout.
 */
export function layoutStep(step: ExecutionStep): { frames: FrameNodePosition[]; heap: HeapNodePosition[] } {
    const frames: FrameNodePosition[] = [];
    let y = 0;
    for (const frame of step.frames) {
        const height = frameHeight(frame);
        frames.push({ frame, x: 0, y, width: FRAME_NODE_WIDTH, height });
        y += height + FRAME_GAP_Y;
    }

    const heapObjects = Object.values(step.heap).sort((a, b) => {
        const an = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
        const bn = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
        return an - bn;
    });

    const heapOriginX = FRAME_NODE_WIDTH + COLUMN_GAP_X;
    const heap: HeapNodePosition[] = [];
    const colY: number[] = new Array(HEAP_COLS).fill(0);
    for (let i = 0; i < heapObjects.length; i++) {
        const col = i % HEAP_COLS;
        const obj = heapObjects[i];
        const height = heapHeight(obj);
        heap.push({
            object: obj,
            x: heapOriginX + col * (HEAP_NODE_WIDTH + HEAP_GAP_X),
            y: colY[col],
            width: HEAP_NODE_WIDTH,
            height,
        });
        colY[col] += height + HEAP_GAP_Y;
    }

    return { frames, heap };
}
