"use client";

import { useRef } from "react";
import { CropRect } from "./types";

const MIN_SIZE = 0.05;
type Handle = "move" | "nw" | "ne" | "sw" | "se";

function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
}

export function CropOverlay({ rect, onChange }: { rect: CropRect; onChange: (rect: CropRect) => void }) {
    const overlayRef = useRef<HTMLDivElement>(null);

    const startDrag = (handle: Handle, startEvent: React.PointerEvent) => {
        startEvent.preventDefault();
        startEvent.stopPropagation();
        const overlay = overlayRef.current;
        if (!overlay) return;
        const bounds = overlay.getBoundingClientRect();
        const startRect = { ...rect };
        const startX = startEvent.clientX;
        const startY = startEvent.clientY;

        const onMove = (e: PointerEvent) => {
            const dx = (e.clientX - startX) / bounds.width;
            const dy = (e.clientY - startY) / bounds.height;
            let next = { ...startRect };

            if (handle === "move") {
                next.x = clamp(startRect.x + dx, 0, 1 - startRect.width);
                next.y = clamp(startRect.y + dy, 0, 1 - startRect.height);
            } else {
                let { x, y, width, height } = startRect;
                if (handle === "nw" || handle === "sw") {
                    const newX = clamp(startRect.x + dx, 0, startRect.x + startRect.width - MIN_SIZE);
                    width = startRect.width - (newX - startRect.x);
                    x = newX;
                }
                if (handle === "ne" || handle === "se") {
                    width = clamp(startRect.width + dx, MIN_SIZE, 1 - startRect.x);
                }
                if (handle === "nw" || handle === "ne") {
                    const newY = clamp(startRect.y + dy, 0, startRect.y + startRect.height - MIN_SIZE);
                    height = startRect.height - (newY - startRect.y);
                    y = newY;
                }
                if (handle === "sw" || handle === "se") {
                    height = clamp(startRect.height + dy, MIN_SIZE, 1 - startRect.y);
                }
                next = { x, y, width, height };
            }
            onChange(next);
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const handleClass = "absolute size-3 rounded-full border-2 border-primary bg-white shadow-sm";

    return (
        <div ref={overlayRef} className="absolute inset-0 cursor-move select-none">
            <div className="absolute inset-0 bg-black/50" style={{ clipPath: `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, ${rect.x * 100}% ${rect.y * 100}%, ${(rect.x + rect.width) * 100}% ${rect.y * 100}%, ${(rect.x + rect.width) * 100}% ${(rect.y + rect.height) * 100}%, ${rect.x * 100}% ${(rect.y + rect.height) * 100}%, ${rect.x * 100}% ${rect.y * 100}%)` }} />
            <div
                className="absolute border-2 border-primary"
                style={{
                    left: `${rect.x * 100}%`,
                    top: `${rect.y * 100}%`,
                    width: `${rect.width * 100}%`,
                    height: `${rect.height * 100}%`,
                }}
                onPointerDown={(e) => startDrag("move", e)}
            >
                <div className={`${handleClass} -left-1.5 -top-1.5 cursor-nwse-resize`} onPointerDown={(e) => startDrag("nw", e)} />
                <div className={`${handleClass} -right-1.5 -top-1.5 cursor-nesw-resize`} onPointerDown={(e) => startDrag("ne", e)} />
                <div className={`${handleClass} -bottom-1.5 -left-1.5 cursor-nesw-resize`} onPointerDown={(e) => startDrag("sw", e)} />
                <div className={`${handleClass} -bottom-1.5 -right-1.5 cursor-nwse-resize`} onPointerDown={(e) => startDrag("se", e)} />
            </div>
        </div>
    );
}
