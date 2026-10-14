"use client";

import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { VideoFilters } from "./types";

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

export function FilterControls({
    filters,
    onChange,
    onReset,
    volume,
    onVolumeChange,
    muted,
    onMutedChange,
}: {
    filters: VideoFilters;
    onChange: (patch: Partial<VideoFilters>) => void;
    onReset: () => void;
    volume: number;
    onVolumeChange: (v: number) => void;
    muted: boolean;
    onMutedChange: (v: boolean) => void;
}) {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <div className="flex h-11 items-center justify-between border-b bg-muted/10 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adjustments</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-semibold" onClick={onReset}>
                    Reset
                </Button>
            </div>

            <div className="space-y-5 p-4">
                <Field label="Rotate &amp; flip">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="icon-sm" title="Rotate left" onClick={() => onChange({ rotation: (((filters.rotation - 90) % 360) + 360) % 360 as VideoFilters["rotation"] })}>
                            <RotateCcw className="size-3.5" />
                        </Button>
                        <Button variant="outline" size="icon-sm" title="Rotate right" onClick={() => onChange({ rotation: ((filters.rotation + 90) % 360) as VideoFilters["rotation"] })}>
                            <RotateCw className="size-3.5" />
                        </Button>
                        <Button variant={filters.flipH ? "default" : "outline"} size="icon-sm" title="Flip horizontal" onClick={() => onChange({ flipH: !filters.flipH })}>
                            <FlipHorizontal2 className="size-3.5" />
                        </Button>
                        <Button variant={filters.flipV ? "default" : "outline"} size="icon-sm" title="Flip vertical" onClick={() => onChange({ flipV: !filters.flipV })}>
                            <FlipVertical2 className="size-3.5" />
                        </Button>
                    </div>
                </Field>

                <Field label={`Brightness — ${filters.brightness}%`}>
                    <Slider value={[filters.brightness]} min={0} max={200} step={1} onValueChange={([v]) => onChange({ brightness: v })} />
                </Field>

                <Field label={`Contrast — ${filters.contrast}%`}>
                    <Slider value={[filters.contrast]} min={0} max={200} step={1} onValueChange={([v]) => onChange({ contrast: v })} />
                </Field>

                <Field label={`Saturation — ${filters.saturation}%`}>
                    <Slider value={[filters.saturation]} min={0} max={200} step={1} onValueChange={([v]) => onChange({ saturation: v })} />
                </Field>

                <div className="space-y-3 pt-1">
                    <RowField label="Grayscale">
                        <Switch checked={filters.grayscale} onCheckedChange={(v) => onChange({ grayscale: v })} />
                    </RowField>
                    <RowField label="Sepia">
                        <Switch checked={filters.sepia} onCheckedChange={(v) => onChange({ sepia: v })} />
                    </RowField>
                    <RowField label="Invert">
                        <Switch checked={filters.invert} onCheckedChange={(v) => onChange({ invert: v })} />
                    </RowField>
                </div>

                <Field label="Volume">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => onMutedChange(!muted)} title={muted ? "Unmute" : "Mute"}>
                            {muted || volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                        </Button>
                        <Slider value={[muted ? 0 : volume * 100]} min={0} max={100} step={1} onValueChange={([v]) => { onVolumeChange(v / 100); if (v > 0) onMutedChange(false); }} className="flex-1" />
                    </div>
                </Field>
            </div>
        </div>
    );
}
