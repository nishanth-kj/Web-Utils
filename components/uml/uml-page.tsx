"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AlertTriangle, ChevronDown, Copy, Download, FileImage, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MonacoEditor as Editor } from "@/components/shared/lazy-monaco";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { svgToDataUrl } from "@/lib/preview-document";
import { diagramToPng, renderUml, type UmlDiagram } from "@/lib/uml/render";
import { DEFAULT_UML_SOURCE, UML_SAMPLES, type UmlSample } from "@/lib/uml/samples";
import { ZoomablePreview } from "@/components/uml/zoomable-preview";

const STORAGE_KEY = "web-uml-source";
const RENDER_DELAY_MS = 250;

function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export function UmlPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const isMobile = useIsMobile();

    const [source, setSource] = useState(DEFAULT_UML_SOURCE);
    const [diagram, setDiagram] = useState<UmlDiagram | null>(null);
    const [error, setError] = useState<string | null>(null);
    const latestRender = useRef(0);

    // Restore this tab's draft once mounted; sessionStorage doesn't exist
    // while the page is prerendered.
    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved !== null) setSource(saved);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => sessionStorage.setItem(STORAGE_KEY, source), 300);
        return () => clearTimeout(timer);
    }, [source]);

    // Re-render shortly after typing stops. A newer render supersedes an older
    // one still in flight, and the last good diagram stays visible on errors.
    useEffect(() => {
        const renderId = ++latestRender.current;
        const timer = setTimeout(async () => {
            try {
                if (!source.trim()) throw new Error("Write a diagram, or load one of the examples.");
                const result = await renderUml(source, isDark);
                if (renderId !== latestRender.current) return;
                setDiagram(result);
                setError(null);
            } catch (err) {
                if (renderId !== latestRender.current) return;
                setError(err instanceof Error ? err.message : String(err));
            }
        }, RENDER_DELAY_MS);
        return () => clearTimeout(timer);
    }, [source, isDark]);

    const imageSrc = useMemo(() => (diagram ? svgToDataUrl(diagram.svg) : null), [diagram]);

    const loadSample = (sample: UmlSample) => {
        const previous = source;
        setSource(sample.source);
        // Never silently drop the user's own diagram.
        if (previous.trim() && !UML_SAMPLES.some((s) => s.source === previous)) {
            toast(`Loaded the ${sample.label.toLowerCase()} example`, {
                action: { label: "Undo", onClick: () => setSource(previous) },
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(source).then(
            () => toast.success("Copied the diagram source"),
            () => toast.error("Couldn't copy: the browser blocked clipboard access.")
        );
    };

    const handleDownloadSvg = () => {
        if (diagram) downloadBlob(new Blob([diagram.svg], { type: "image/svg+xml" }), "diagram.svg");
    };

    const handleDownloadPng = async () => {
        if (!diagram) return;
        try {
            downloadBlob(await diagramToPng(diagram, isDark ? "#0a0a0a" : "#ffffff"), "diagram.png");
        } catch {
            toast.error("Couldn't export a PNG in this browser. Download the SVG instead.");
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/10 px-4 py-2 sm:py-0">
                <div className="flex shrink-0 items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-1.5">
                        <Workflow className="size-4 text-primary" />
                    </div>
                    <h1 className="text-xs font-black uppercase tracking-widest text-foreground">UML Diagram Editor</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                                Examples <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {UML_SAMPLES.map((sample) => (
                                <DropdownMenuItem key={sample.id} onClick={() => loadSample(sample)} className="text-xs">
                                    {sample.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={handleCopy}>
                        <Copy className="size-3.5" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={handleDownloadSvg} disabled={!diagram}>
                        <Download className="size-3.5" /> SVG
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={handleDownloadPng} disabled={!diagram}>
                        <FileImage className="size-3.5" /> PNG
                    </Button>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="min-h-0 min-w-0">
                    <ResizablePanel defaultSize={40} minSize={20} className="min-h-0 min-w-0">
                        <div className="h-full border-b md:border-b-0 md:border-r">
                            <Editor
                                height="100%"
                                language="plaintext"
                                value={source}
                                onChange={(value) => setSource(value ?? "")}
                                theme={isDark ? "vs-dark" : "light"}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: "on",
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12 },
                                    lineNumbersMinChars: 3,
                                }}
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={60} minSize={20} className="min-h-0 min-w-0">
                        <div className="flex h-full flex-col">
                            {error && (
                                <div role="alert" aria-label="Diagram syntax error" className="flex max-h-40 shrink-0 gap-2 overflow-auto border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                    <pre className="whitespace-pre-wrap break-words font-mono text-xs">{error}</pre>
                                </div>
                            )}
                            <div className="min-h-0 flex-1">
                                {imageSrc && diagram ? (
                                    <ZoomablePreview
                                        src={imageSrc}
                                        width={diagram.width}
                                        height={diagram.height}
                                        alt="Rendered UML diagram"
                                        dimmed={Boolean(error)}
                                    />
                                ) : (
                                    !error && (
                                        <p role="status" className="p-6 text-sm text-muted-foreground">
                                            Rendering diagram…
                                        </p>
                                    )
                                )}
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
