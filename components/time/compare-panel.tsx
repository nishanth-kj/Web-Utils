"use client";

import React, {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    ArrowLeftRight,
    ArrowRight,
    Check,
    Copy,
    Move,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COMPARE_PANEL_DEFAULT = { x: 24, y: 24, width: 420, height: 220 };
const COMPARE_PANEL_MIN = { width: 320, height: 180 };

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

function parseFlexible(str: string): { date: Date | null; isMillis: boolean } {
    const trimmed = str.trim();
    if (!trimmed) return { date: null, isMillis: false };
    if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        const isMs = trimmed.length > 10;
        const ms = isMs ? num : num * 1000;
        const d = new Date(ms);
        return { date: isNaN(d.getTime()) ? null : d, isMillis: isMs };
    }
    const d = new Date(trimmed);
    return { date: isNaN(d.getTime()) ? null : d, isMillis: false };
}

function formatDuration(deltaMs: number): string {
    const abs = Math.abs(deltaMs);
    const sec = Math.floor(abs / 1000) % 60;
    const min = Math.floor(abs / (1000 * 60)) % 60;
    const hr = Math.floor(abs / (1000 * 60 * 60)) % 24;
    const day = Math.floor(abs / (1000 * 60 * 60 * 24));
    const parts: string[] = [];
    if (day) parts.push(`${day}d`);
    if (hr) parts.push(`${hr}h`);
    if (min) parts.push(`${min}m`);
    if (sec || parts.length === 0) parts.push(`${sec}s`);
    return parts.join(" ");
}

// ----------------------------------------------------------------------
// Compare Panel
// ----------------------------------------------------------------------
export function ComparePanel({
    primaryDate,
    onClose,
    boundsRef,
}: {
    primaryDate: Date;
    onClose: () => void;
    boundsRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [leftInput, setLeftInput] = useState("");
    const [rightInput, setRightInput] = useState("");
    const [copied, setCopied] = useState(false);

    const [pos, setPos] = useState({
        x: COMPARE_PANEL_DEFAULT.x,
        y: COMPARE_PANEL_DEFAULT.y,
    });

    const [size, setSize] = useState({
        width: COMPARE_PANEL_DEFAULT.width,
        height: COMPARE_PANEL_DEFAULT.height,
    });

    const dragState = useRef<{
        startX: number;
        startY: number;
        origX: number;
        origY: number;
    } | null>(null);

    const resizeState = useRef<{
        direction: ResizeDirection;
        startX: number;
        startY: number;
        origX: number;
        origY: number;
        origW: number;
        origH: number;
    } | null>(null);

    const { date: leftDate, isMillis: leftIsMillis } = React.useMemo(
        () =>
            leftInput.trim()
                ? parseFlexible(leftInput)
                : { date: primaryDate, isMillis: false },
        [leftInput, primaryDate]
    );

    const { date: rightDate, isMillis: rightIsMillis } = React.useMemo(
        () => parseFlexible(rightInput),
        [rightInput]
    );

    const deltaMs =
        leftDate && rightDate
            ? leftDate.getTime() - rightDate.getTime()
            : null;

    const isFuture = deltaMs !== null && deltaMs < 0;

    const copyDelta = () => {
        if (deltaMs === null) return;

        navigator.clipboard.writeText(String(Math.abs(deltaMs)));
        setCopied(true);

        setTimeout(() => setCopied(false), 1500);
    };

    const getBounds = useCallback(() => {
        return boundsRef.current?.getBoundingClientRect() ?? null;
    }, [boundsRef]);

    const handleDragPointerDown = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        if (e.button !== 0) return;

        const target = e.target as HTMLElement;

        if (
            target.closest("button") ||
            target.closest("input") ||
            target.closest("[data-no-drag]")
        ) {
            return;
        }

        e.preventDefault();

        dragState.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: pos.x,
            origY: pos.y,
        };

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleDragPointerMove = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        if (!dragState.current) return;

        const bounds = getBounds();
        if (!bounds) return;

        const { startX, startY, origX, origY } = dragState.current;

        const maxX = Math.max(0, bounds.width - size.width);
        const maxY = Math.max(0, bounds.height - size.height);

        setPos({
            x: Math.min(
                Math.max(0, origX + e.clientX - startX),
                maxX
            ),
            y: Math.min(
                Math.max(0, origY + e.clientY - startY),
                maxY
            ),
        });
    };

    const handleDragPointerUp = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        dragState.current = null;

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
    };

    const handleResizePointerDown = (
        e: React.PointerEvent<HTMLDivElement>,
        direction: ResizeDirection
    ) => {
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        resizeState.current = {
            direction,
            startX: e.clientX,
            startY: e.clientY,
            origX: pos.x,
            origY: pos.y,
            origW: size.width,
            origH: size.height,
        };

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleResizePointerMove = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        const state = resizeState.current;
        if (!state) return;

        const bounds = getBounds();
        if (!bounds) return;

        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;

        let nextX = state.origX;
        let nextY = state.origY;
        let nextW = state.origW;
        let nextH = state.origH;

        if (state.direction.includes("e")) nextW = state.origW + dx;
        if (state.direction.includes("w")) {
            nextW = state.origW - dx;
            nextX = state.origX + dx;
        }

        if (state.direction.includes("s")) nextH = state.origH + dy;
        if (state.direction.includes("n")) {
            nextH = state.origH - dy;
            nextY = state.origY + dy;
        }

        if (nextW < COMPARE_PANEL_MIN.width) {
            if (state.direction.includes("w")) {
                nextX =
                    state.origX +
                    state.origW -
                    COMPARE_PANEL_MIN.width;
            }
            nextW = COMPARE_PANEL_MIN.width;
        }

        if (nextH < COMPARE_PANEL_MIN.height) {
            if (state.direction.includes("n")) {
                nextY =
                    state.origY +
                    state.origH -
                    COMPARE_PANEL_MIN.height;
            }
            nextH = COMPARE_PANEL_MIN.height;
        }

        if (nextX < 0) {
            nextW += nextX;
            nextX = 0;
        }

        if (nextY < 0) {
            nextH += nextY;
            nextY = 0;
        }

        if (nextX + nextW > bounds.width) {
            if (state.direction.includes("w")) {
                nextX = Math.max(0, bounds.width - nextW);
            } else {
                nextW = bounds.width - nextX;
            }
        }

        if (nextY + nextH > bounds.height) {
            if (state.direction.includes("n")) {
                nextY = Math.max(0, bounds.height - nextH);
            } else {
                nextH = bounds.height - nextY;
            }
        }

        nextW = Math.max(COMPARE_PANEL_MIN.width, nextW);
        nextH = Math.max(COMPARE_PANEL_MIN.height, nextH);

        setPos({ x: nextX, y: nextY });
        setSize({ width: nextW, height: nextH });
    };

    const handleResizePointerUp = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        resizeState.current = null;

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
    };

    const ResizeHandle = ({
        direction,
        className,
    }: {
        direction: ResizeDirection;
        className: string;
    }) => (
        <div
            data-no-drag
            onPointerDown={(e) =>
                handleResizePointerDown(e, direction)
            }
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className={cn(
                "absolute z-30 touch-none",
                className
            )}
        />
    );

    return (
        <div
            style={{
                left: pos.x,
                top: pos.y,
                width: size.width,
                height: size.height,
            }}
            className="absolute z-20 flex flex-col rounded-md border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-200 overflow-visible select-none"
        >
            <div
                onPointerDown={handleDragPointerDown}
                onPointerMove={handleDragPointerMove}
                onPointerUp={handleDragPointerUp}
                className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 cursor-grab active:cursor-grabbing shrink-0 rounded-t-md touch-none"
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <Move className="size-3.5 text-muted-foreground" />
                    <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Compare
                    </h3>
                </div>

                <Button
                    data-no-drag
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={onClose}
                >
                    <X className="size-3.5" />
                </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-3">
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Left
                        </div>
                        <Input
                            value={leftInput}
                            onChange={(e) => setLeftInput(e.target.value)}
                            placeholder={primaryDate.toISOString()}
                            className="h-8 font-mono text-xs select-text"
                        />
                    </div>

                    <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-2.5" />

                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Right
                        </div>
                        <Input
                            value={rightInput}
                            onChange={(e) => setRightInput(e.target.value)}
                            placeholder="Timestamp or date..."
                            className="h-8 font-mono text-xs select-text"
                        />
                    </div>
                </div>

                {((leftInput.trim() && !leftDate) ||
                    (rightInput.trim() && !rightDate)) && (
                    <p className="text-xs font-medium text-destructive mt-2">
                        Couldn't parse one of those as a date or timestamp.
                    </p>
                )}

                {leftDate && rightDate && deltaMs !== null && (
                    <div
                        onClick={copyDelta}
                        className="mt-3 flex flex-col gap-1.5 p-3 rounded-md border bg-background cursor-pointer hover:bg-muted/30 transition-colors select-text"
                    >
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                                variant="secondary"
                                className="text-[9px] uppercase tracking-wider py-0 h-4"
                            >
                                {leftIsMillis || rightIsMillis
                                    ? "millis"
                                    : "parsed"}
                            </Badge>

                            <span className="font-mono text-xs">
                                Left is{" "}
                                <span className="font-semibold">
                                    {formatDuration(deltaMs)}
                                </span>{" "}
                                {isFuture ? "before" : "after"} right
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">
                                {Math.abs(deltaMs)} ms
                            </span>

                            {copied ? (
                                <Check className="size-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="size-3.5" />
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ResizeHandle
                direction="n"
                className="top-0 left-3 right-3 h-1.5 cursor-ns-resize"
            />
            <ResizeHandle
                direction="s"
                className="bottom-0 left-3 right-3 h-1.5 cursor-ns-resize"
            />
            <ResizeHandle
                direction="w"
                className="left-0 top-3 bottom-3 w-1.5 cursor-ew-resize"
            />
            <ResizeHandle
                direction="e"
                className="right-0 top-3 bottom-3 w-1.5 cursor-ew-resize"
            />

            <ResizeHandle
                direction="nw"
                className="left-0 top-0 size-3 cursor-nwse-resize"
            />
            <ResizeHandle
                direction="ne"
                className="right-0 top-0 size-3 cursor-nesw-resize"
            />
            <ResizeHandle
                direction="sw"
                className="left-0 bottom-0 size-3 cursor-nesw-resize"
            />
            <ResizeHandle
                direction="se"
                className="right-0 bottom-0 size-3 cursor-nwse-resize"
            />
        </div>
    );
}
