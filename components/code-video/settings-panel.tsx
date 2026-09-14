"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { CodeVideoConfig, FPS_OPTIONS, RESOLUTIONS } from "./types";
import { LANGUAGES } from "./languages";
import { THEMES, BACKGROUNDS } from "./themes";

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

export function SettingsPanel({
    config,
    onChange,
}: {
    config: CodeVideoConfig;
    onChange: (patch: Partial<CodeVideoConfig>) => void;
}) {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <div className="flex h-11 items-center border-b bg-muted/10 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Style &amp; export settings</span>
            </div>

            <div className="space-y-5 p-4">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Language">
                        <Select value={config.languageId} onValueChange={(v) => onChange({ languageId: v })}>
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map((l) => (
                                    <SelectItem key={l.id} value={l.id}>
                                        {l.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="File name">
                        <Input
                            value={config.fileName}
                            onChange={(e) => onChange({ fileName: e.target.value })}
                            className="h-8 text-xs"
                            spellCheck={false}
                        />
                    </Field>
                </div>

                <Field label="Syntax theme">
                    <Select value={config.themeId} onValueChange={(v) => onChange({ themeId: v })}>
                        <SelectTrigger size="sm" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {THEMES.map((th) => (
                                <SelectItem key={th.id} value={th.id}>
                                    <span className="mr-2 inline-block size-2.5 rounded-full align-middle" style={{ backgroundColor: th.windowBg, border: `1px solid ${th.borderColor}` }} />
                                    {th.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Background">
                    <div className="grid grid-cols-7 gap-2">
                        {BACKGROUNDS.map((bg) => (
                            <button
                                key={bg.id}
                                type="button"
                                title={bg.name}
                                onClick={() => onChange({ backgroundId: bg.id })}
                                className={cn(
                                    "aspect-square rounded-md ring-offset-2 ring-offset-background transition-all",
                                    config.backgroundId === bg.id ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-foreground/30"
                                )}
                                style={{ background: bg.swatch }}
                            />
                        ))}
                    </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Resolution">
                        <Select value={config.resolutionId} onValueChange={(v) => onChange({ resolutionId: v })}>
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RESOLUTIONS.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Frame rate">
                        <Select value={String(config.fps)} onValueChange={(v) => onChange({ fps: Number(v) as CodeVideoConfig["fps"] })}>
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FPS_OPTIONS.map((f) => (
                                    <SelectItem key={f} value={String(f)}>
                                        {f} fps{f === 120 ? " (slow to render)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Field label={`Typing speed — ${config.cps} chars/sec`}>
                    <Slider value={[config.cps]} min={8} max={60} step={1} onValueChange={([v]) => onChange({ cps: v })} />
                </Field>

                <Field label={`Font size — ${config.fontSize}px`}>
                    <Slider value={[config.fontSize]} min={14} max={36} step={1} onValueChange={([v]) => onChange({ fontSize: v })} />
                </Field>

                <Field label={`Padding — ${config.padding}px`}>
                    <Slider value={[config.padding]} min={12} max={56} step={2} onValueChange={([v]) => onChange({ padding: v })} />
                </Field>

                <div className="space-y-3 pt-1">
                    <RowField label="Line numbers">
                        <Switch checked={config.showLineNumbers} onCheckedChange={(v) => onChange({ showLineNumbers: v })} />
                    </RowField>
                    <RowField label="Window chrome">
                        <Switch checked={config.showWindowChrome} onCheckedChange={(v) => onChange({ showWindowChrome: v })} />
                    </RowField>
                </div>
            </div>
        </div>
    );
}
