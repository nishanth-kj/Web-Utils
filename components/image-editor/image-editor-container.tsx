"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdjustmentControls } from "./adjustment-controls";
import { CropOverlay } from "./crop-overlay";
import {
    cloneCanvas,
    cropCanvas,
    downloadBlob,
    exportCanvas,
    flipCanvas,
    loadImageAsCanvas,
    renderWithFilter,
    resizeCanvas,
    rotateCanvas90,
} from "./canvas-ops";
import { buildCanvasFilter, CropRect, DEFAULT_ADJUSTMENTS, DEFAULT_CROP_RECT, ExportFormat, ImageAdjustments, withExtension } from "./types";

export function ImageEditorContainer() {
    const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
    const [workingCanvas, setWorkingCanvas] = useState<HTMLCanvasElement | null>(null);
    const [fileName, setFileName] = useState("image");
    const [isDragging, setIsDragging] = useState(false);

    const [cropMode, setCropMode] = useState(false);
    const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);

    const [resizeWidth, setResizeWidth] = useState(0);
    const [resizeHeight, setResizeHeight] = useState(0);
    const [keepAspect, setKeepAspect] = useState(true);

    const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
    const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
    const [exportQuality, setExportQuality] = useState(0.92);

    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const preview = previewCanvasRef.current;
        if (!preview || !workingCanvas) return;
        preview.width = workingCanvas.width;
        preview.height = workingCanvas.height;
        const ctx = preview.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, preview.width, preview.height);
        ctx.filter = buildCanvasFilter(adjustments);
        ctx.drawImage(workingCanvas, 0, 0);
    }, [workingCanvas, adjustments]);

    const loadFile = async (f: File) => {
        if (!f.type.startsWith("image/")) {
            toast.error("Please choose an image file.");
            return;
        }
        try {
            const canvas = await loadImageAsCanvas(f);
            setFileName(f.name.replace(/\.[^./\\]+$/, ""));
            setOriginalCanvas(canvas);
            setWorkingCanvas(cloneCanvas(canvas));
            setResizeWidth(canvas.width);
            setResizeHeight(canvas.height);
            setKeepAspect(true);
            setAdjustments(DEFAULT_ADJUSTMENTS);
            setCropMode(false);
            setCropRect(DEFAULT_CROP_RECT);
        } catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "Could not load that image.");
        }
    };

    const commitCanvas = (next: HTMLCanvasElement) => {
        setWorkingCanvas(next);
        setResizeWidth(next.width);
        setResizeHeight(next.height);
    };

    const handleToggleCrop = () => {
        setCropRect(DEFAULT_CROP_RECT);
        setCropMode((v) => !v);
    };

    const handleApplyCrop = () => {
        if (!workingCanvas) return;
        commitCanvas(cropCanvas(workingCanvas, cropRect));
        setCropMode(false);
    };

    const handleRotate = (clockwise: boolean) => {
        if (!workingCanvas) return;
        commitCanvas(rotateCanvas90(workingCanvas, clockwise));
    };

    const handleFlip = (horizontal: boolean) => {
        if (!workingCanvas) return;
        commitCanvas(flipCanvas(workingCanvas, horizontal));
    };

    const handleResizeWidthChange = (v: number) => {
        setResizeWidth(v);
        if (keepAspect && workingCanvas) {
            setResizeHeight(Math.round((v * workingCanvas.height) / workingCanvas.width));
        }
    };

    const handleResizeHeightChange = (v: number) => {
        setResizeHeight(v);
        if (keepAspect && workingCanvas) {
            setResizeWidth(Math.round((v * workingCanvas.width) / workingCanvas.height));
        }
    };

    const handleApplyResize = () => {
        if (!workingCanvas) return;
        commitCanvas(resizeCanvas(workingCanvas, resizeWidth, resizeHeight));
    };

    const handleResetAdjustments = () => setAdjustments(DEFAULT_ADJUSTMENTS);

    const handleResetAll = () => {
        if (!originalCanvas) return;
        commitCanvas(cloneCanvas(originalCanvas));
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setCropMode(false);
        setCropRect(DEFAULT_CROP_RECT);
    };

    const handleExport = async () => {
        if (!workingCanvas) return;
        try {
            const filtered = renderWithFilter(workingCanvas, buildCanvasFilter(adjustments));
            const blob = await exportCanvas(filtered, exportFormat, exportQuality);
            downloadBlob(blob, withExtension(fileName, exportFormat === "png" ? "png" : "jpg"));
            toast.success("Image exported.");
        } catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "Export failed.");
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) loadFile(dropped);
    };

    if (!workingCanvas) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background p-6">
                <div
                    className={`flex w-full max-w-md flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                >
                    <ImageIcon className="size-8 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Drop an image here, or click to upload</p>
                    <p className="text-xs text-muted-foreground">Crop, resize, and adjust — everything stays in your browser.</p>
                    <Button size="sm" className="mt-1 gap-1.5">
                        <Upload className="size-3.5" /> Choose image
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) loadFile(f);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="min-h-0 min-w-0 flex-1">
                <div className="flex h-full min-h-0 min-w-0 flex-col md:flex-row">
                    <div className="h-64 shrink-0 border-b md:h-full md:w-[320px] md:border-b-0 md:border-r">
                        <AdjustmentControls
                            cropMode={cropMode}
                            onToggleCrop={handleToggleCrop}
                            onApplyCrop={handleApplyCrop}
                            resizeWidth={resizeWidth}
                            resizeHeight={resizeHeight}
                            keepAspect={keepAspect}
                            onKeepAspectChange={setKeepAspect}
                            onResizeWidthChange={handleResizeWidthChange}
                            onResizeHeightChange={handleResizeHeightChange}
                            onApplyResize={handleApplyResize}
                            onRotate={handleRotate}
                            onFlip={handleFlip}
                            adjustments={adjustments}
                            onAdjustmentsChange={(patch) => setAdjustments((prev) => ({ ...prev, ...patch }))}
                            onResetAdjustments={handleResetAdjustments}
                            onResetAll={handleResetAll}
                            exportFormat={exportFormat}
                            onExportFormatChange={setExportFormat}
                            exportQuality={exportQuality}
                            onExportQualityChange={setExportQuality}
                            onExport={handleExport}
                        />
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <div className="flex h-11 shrink-0 items-center justify-between border-b bg-muted/10 px-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Preview · {workingCanvas.width}×{workingCanvas.height}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 gap-1.5 px-2 text-[10px] font-semibold"
                                onClick={() => {
                                    setOriginalCanvas(null);
                                    setWorkingCanvas(null);
                                }}
                            >
                                <X className="size-3" /> New file
                            </Button>
                        </div>
                        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
                            <div className="relative inline-block max-h-full max-w-full">
                                <canvas
                                    ref={previewCanvasRef}
                                    className="max-h-full max-w-full rounded-lg"
                                    style={{ display: "block", aspectRatio: `${workingCanvas.width} / ${workingCanvas.height}` }}
                                />
                                {cropMode && <CropOverlay rect={cropRect} onChange={setCropRect} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
