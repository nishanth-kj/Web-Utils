"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const STEP = 1.2;
const PADDING = 24;

const clamp = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

interface ZoomablePreviewProps {
    src: string;
    width: number;
    height: number;
    alt: string;
    dimmed?: boolean;
}

// Scrollable, pannable and zoomable view of a fixed-size image. Fits the
// panel until the user zooms, then keeps their zoom level.
export function ZoomablePreview({ src, width, height, alt, dimmed }: ZoomablePreviewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [isFit, setIsFit] = useState(true);
    const [isPanning, setIsPanning] = useState(false);
    const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
    // Content point to keep under the cursor (or centre) after a zoom.
    const anchor = useRef<{ contentX: number; contentY: number; viewX: number; viewY: number; factor: number } | null>(null);

    const fitZoom = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return 1;
        const available = Math.min((el.clientWidth - PADDING * 2) / width, (el.clientHeight - PADDING * 2) / height);
        return clamp(Math.min(available, 2));
    }, [width, height]);

    // Keep fitting while in fit mode: on new diagrams and panel resizes.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || !isFit) return;
        const update = () => setZoom(fitZoom());
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [isFit, fitZoom]);

    // `next` maps the current zoom to the new one; the view point (default:
    // the panel centre) stays put while zooming.
    const zoomTo = useCallback((next: (current: number) => number, viewX?: number, viewY?: number) => {
        const el = scrollRef.current;
        if (!el) return;
        setZoom((current) => {
            const target = clamp(next(current));
            const x = viewX ?? el.clientWidth / 2;
            const y = viewY ?? el.clientHeight / 2;
            anchor.current = { contentX: el.scrollLeft + x, contentY: el.scrollTop + y, viewX: x, viewY: y, factor: target / current };
            return target;
        });
        setIsFit(false);
    }, []);

    useLayoutEffect(() => {
        const el = scrollRef.current;
        const a = anchor.current;
        if (!el || !a) return;
        el.scrollLeft = a.contentX * a.factor - a.viewX;
        el.scrollTop = a.contentY * a.factor - a.viewY;
        anchor.current = null;
    }, [zoom]);

    // Ctrl/Cmd + wheel (and trackpad pinch) zooms around the pointer; a plain
    // wheel keeps scrolling. Needs a non-passive listener to stop page zoom.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (event: WheelEvent) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            const rect = el.getBoundingClientRect();
            const factor = Math.exp(-event.deltaY * 0.002);
            zoomTo((current) => current * factor, event.clientX - rect.left, event.clientY - rect.top);
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [zoomTo]);

    // Drag to pan with a mouse; touch devices already scroll natively.
    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        const el = scrollRef.current;
        if (!el) return;
        pan.current = { x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop };
        el.setPointerCapture(event.pointerId);
        setIsPanning(true);
    };
    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const el = scrollRef.current;
        if (!el || !pan.current) return;
        el.scrollLeft = pan.current.left - (event.clientX - pan.current.x);
        el.scrollTop = pan.current.top - (event.clientY - pan.current.y);
    };
    const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!pan.current) return;
        pan.current = null;
        scrollRef.current?.releasePointerCapture(event.pointerId);
        setIsPanning(false);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "+" || event.key === "=") zoomTo((current) => current * STEP);
        else if (event.key === "-") zoomTo((current) => current / STEP);
        else if (event.key === "0") setIsFit(true);
        else return;
        event.preventDefault();
    };

    return (
        <div className="relative h-full">
            <div
                ref={scrollRef}
                tabIndex={0}
                aria-label="Diagram preview. Drag to pan, Ctrl or Command plus scroll to zoom, plus and minus keys to zoom, 0 to fit."
                className={cn(
                    "h-full overflow-auto custom-scrollbar outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isPanning ? "cursor-grabbing select-none" : "cursor-grab"
                )}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPan}
                onPointerCancel={endPan}
                onKeyDown={onKeyDown}
            >
                {/* Flex + margin:auto centres a small diagram without clipping a large one. */}
                <div className="flex min-h-full min-w-full w-max" style={{ padding: PADDING }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- data: URL of a generated SVG */}
                    <img
                        src={src}
                        alt={alt}
                        draggable={false}
                        className={cn("m-auto block max-w-none transition-opacity", dimmed && "opacity-40")}
                        style={{ width: width * zoom, height: height * zoom }}
                    />
                </div>
            </div>

            <div className="absolute right-3 top-3 flex items-center gap-0.5 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => zoomTo((current) => current / STEP)} aria-label="Zoom out" title="Zoom out">
                    <Minus className="size-3.5" />
                </Button>
                <button
                    type="button"
                    onClick={() => zoomTo(() => 1)}
                    className="min-w-12 rounded px-1 text-center text-[11px] font-semibold tabular-nums text-muted-foreground hover:text-foreground"
                    title="Actual size (100%)"
                    aria-label={`Zoom ${Math.round(zoom * 100)} percent. Reset to 100 percent`}
                >
                    {Math.round(zoom * 100)}%
                </button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => zoomTo((current) => current * STEP)} aria-label="Zoom in" title="Zoom in">
                    <Plus className="size-3.5" />
                </Button>
                <Button
                    variant={isFit ? "secondary" : "ghost"}
                    size="icon"
                    className="size-7"
                    onClick={() => setIsFit(true)}
                    aria-label="Fit diagram to panel"
                    title="Fit to panel"
                >
                    <Maximize className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
