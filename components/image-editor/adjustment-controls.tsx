"use client";

import { Crop, Download, FlipHorizontal2, FlipVertical2, Lock, RotateCcw, RotateCw, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportFormat, ImageAdjustments } from "./types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
            {children}
        </div>
    );
}

function RowField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <label className="text-[11px] font-semibold text-foreground">{label}</label>
            {children}
        </div>
    );
}

export function AdjustmentControls({
    cropMode,
    onToggleCrop,
    onApplyCrop,
    resizeWidth,
    resizeHeight,
    keepAspect,
    onKeepAspectChange,
    onResizeWidthChange,
    onResizeHeightChange,
    onApplyResize,
    onRotate,
    onFlip,
    adjustments,
    onAdjustmentsChange,
    onResetAdjustments,
    onResetAll,
    exportFormat,
    onExportFormatChange,
    exportQuality,
    onExportQualityChange,
    onExport,
}: {
    cropMode: boolean;
    onToggleCrop: () => void;
    onApplyCrop: () => void;
    resizeWidth: number;
    resizeHeight: number;
    keepAspect: boolean;
    onKeepAspectChange: (v: boolean) => void;
    onResizeWidthChange: (v: number) => void;
    onResizeHeightChange: (v: number) => void;
    onApplyResize: () => void;
    onRotate: (clockwise: boolean) => void;
    onFlip: (horizontal: boolean) => void;
    adjustments: ImageAdjustments;
    onAdjustmentsChange: (patch: Partial<ImageAdjustments>) => void;
    onResetAdjustments: () => void;
    onResetAll: () => void;
    exportFormat: ExportFormat;
    onExportFormatChange: (f: ExportFormat) => void;
    exportQuality: number;
    onExportQualityChange: (q: number) => void;
    onExport: () => void;
}) {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <div className="flex h-11 items-center justify-between border-b bg-muted/10 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tools &amp; adjustments</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-semibold" onClick={onResetAll}>
                    Reset all
                </Button>
            </div>

            <div className="space-y-5 p-4">
                <Field label="Crop">
                    <div className="flex flex-wrap gap-2">
                        <Button variant={cropMode ? "default" : "outline"} size="sm" className="h-8 gap-1.5 text-xs" onClick={onToggleCrop}>
                            <Crop className="size-3.5" /> {cropMode ? "Cancel" : "Crop"}
                        </Button>
                        {cropMode && (
                            <Button size="sm" className="h-8 text-xs" onClick={onApplyCrop}>
                                Apply crop
                            </Button>
                        )}
                    </div>
                </Field>

                <Field label="Rotate &amp; flip">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="icon-sm" title="Rotate left" onClick={() => onRotate(false)}>
                            <RotateCcw className="size-3.5" />
                        </Button>
                        <Button variant="outline" size="icon-sm" title="Rotate right" onClick={() => onRotate(true)}>
                            <RotateCw className="size-3.5" />
                        </Button>
                        <Button variant="outline" size="icon-sm" title="Flip horizontal" onClick={() => onFlip(true)}>
                            <FlipHorizontal2 className="size-3.5" />
                        </Button>
                        <Button variant="outline" size="icon-sm" title="Flip vertical" onClick={() => onFlip(false)}>
                            <FlipVertical2 className="size-3.5" />
                        </Button>
                    </div>
                </Field>

                <Field label="Resize">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={1}
                            value={Math.round(resizeWidth)}
                            onChange={(e) => onResizeWidthChange(Number(e.target.value) || 1)}
                            className="h-8 text-xs"
                        />
                        <Button variant="ghost" size="icon-sm" title={keepAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"} onClick={() => onKeepAspectChange(!keepAspect)}>
                            {keepAspect ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                        </Button>
                        <Input
                            type="number"
                            min={1}
                            value={Math.round(resizeHeight)}
                            onChange={(e) => onResizeHeightChange(Number(e.target.value) || 1)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <Button size="sm" className="mt-2 h-8 w-full text-xs" onClick={onApplyResize}>
                        Apply resize
                    </Button>
                </Field>

                <Field label={`Brightness — ${adjustments.brightness}%`}>
                    <Slider value={[adjustments.brightness]} min={0} max={200} step={1} onValueChange={([v]) => onAdjustmentsChange({ brightness: v })} />
                </Field>

                <Field label={`Contrast — ${adjustments.contrast}%`}>
                    <Slider value={[adjustments.contrast]} min={0} max={200} step={1} onValueChange={([v]) => onAdjustmentsChange({ contrast: v })} />
                </Field>

                <Field label={`Saturation — ${adjustments.saturation}%`}>
                    <Slider value={[adjustments.saturation]} min={0} max={200} step={1} onValueChange={([v]) => onAdjustmentsChange({ saturation: v })} />
                </Field>

                <Field label={`Blur — ${adjustments.blur}px`}>
                    <Slider value={[adjustments.blur]} min={0} max={20} step={0.5} onValueChange={([v]) => onAdjustmentsChange({ blur: v })} />
                </Field>

                <div className="space-y-3 pt-1">
                    <RowField label="Grayscale">
                        <Switch checked={adjustments.grayscale} onCheckedChange={(v) => onAdjustmentsChange({ grayscale: v })} />
                    </RowField>
                    <RowField label="Sepia">
                        <Switch checked={adjustments.sepia} onCheckedChange={(v) => onAdjustmentsChange({ sepia: v })} />
                    </RowField>
                    <RowField label="Invert">
                        <Switch checked={adjustments.invert} onCheckedChange={(v) => onAdjustmentsChange({ invert: v })} />
                    </RowField>
                </div>

                <Button variant="ghost" size="sm" className="h-7 w-full text-[11px]" onClick={onResetAdjustments}>
                    Reset adjustments
                </Button>

                <div className="space-y-3 border-t pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Format">
                            <Select value={exportFormat} onValueChange={(v) => onExportFormatChange(v as ExportFormat)}>
                                <SelectTrigger size="sm" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="png">PNG</SelectItem>
                                    <SelectItem value="jpeg">JPEG</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        {exportFormat === "jpeg" && (
                            <Field label={`Quality — ${Math.round(exportQuality * 100)}%`}>
                                <Slider value={[exportQuality * 100]} min={10} max={100} step={1} onValueChange={([v]) => onExportQualityChange(v / 100)} />
                            </Field>
                        )}
                    </div>
                    <Button size="sm" className="h-8 w-full gap-1.5 text-xs font-semibold" onClick={onExport}>
                        <Download className="size-3.5" /> Download image
                    </Button>
                </div>
            </div>
        </div>
    );
}
