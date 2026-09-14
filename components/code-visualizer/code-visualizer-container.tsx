"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node, type Viewport } from "reactflow";
import "reactflow/dist/style.css";
import { useTheme } from "next-themes";
import {
    AlertTriangle,
    Loader2,
    Pause,
    Play,
    RotateCcw,
    SkipBack,
    SkipForward,
    Terminal,
    Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonacoEditor as Editor, type OnMount } from "@/components/shared/lazy-monaco";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { computeFitViewport } from "@/lib/sql-visu/fit-view";
import { FrameNode, type FrameNodeData } from "./nodes/frame-node";
import { HeapNode, type HeapNodeData } from "./nodes/heap-node";
import { RefEdge } from "./edges/ref-edge";
import { traceJavaScript } from "@/lib/code-visualizer/js-tracer";
import { tracePython } from "@/lib/code-visualizer/py-tracer";
import { layoutStep } from "@/lib/code-visualizer/layout";
import type { ExecutionStep, TraceResult, VisualizerLanguage } from "@/lib/code-visualizer/types";

const SAMPLES: Record<VisualizerLanguage, string> = {
    javascript: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const nums = [1, 2, 3, 4, 5];
const doubled = [];
for (const n of nums) {
  doubled.push(n * 2);
}

let total = 0;
for (const n of doubled) {
  total += n;
}

console.log("total:", total);
console.log("fib(6):", fib(6));
`,
    python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

nums = [1, 2, 3, 4, 5]
doubled = []
for n in nums:
    doubled.append(n * 2)

total = 0
for n in doubled:
    total += n

print("total:", total)
print("fib(6):", fib(6))
`,
};

const nodeTypes = { frame: FrameNode, heap: HeapNode };
const edgeTypes = { ref: RefEdge };
const DEFAULT_VIEWPORT: Viewport = { x: 40, y: 40, zoom: 1 };
const STEP_DELAY_MS = 700;

function buildFlow(step: ExecutionStep | null): { nodes: Node[]; edges: Edge[] } {
    if (!step) return { nodes: [], edges: [] };
    const { frames, heap } = layoutStep(step);

    const nodes: Node[] = [
        ...frames.map(
            (f): Node<FrameNodeData> => ({
                id: f.frame.id,
                type: "frame",
                position: { x: f.x, y: f.y },
                data: { frame: f.frame },
                width: f.width,
                height: f.height,
                draggable: false,
            }),
        ),
        ...heap.map(
            (h): Node<HeapNodeData> => ({
                id: h.object.id,
                type: "heap",
                position: { x: h.x, y: h.y },
                data: { object: h.object },
                width: h.width,
                height: h.height,
                draggable: false,
            }),
        ),
    ];

    const edges: Edge[] = [];
    const markerEnd = { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "#0ea5e9" };
    for (const f of frames) {
        for (const v of f.frame.variables) {
            if (v.value.kind !== "ref") continue;
            edges.push({
                id: `${f.frame.id}:var:${v.name}`,
                source: f.frame.id,
                sourceHandle: `var:${v.name}`,
                target: v.value.objectId,
                targetHandle: "in",
                type: "ref",
                markerEnd,
            });
        }
    }
    for (const h of heap) {
        for (const entry of h.object.entries) {
            if (entry.value.kind !== "ref") continue;
            edges.push({
                id: `${h.object.id}:entry:${entry.key}`,
                source: h.object.id,
                sourceHandle: `entry:${entry.key}`,
                target: entry.value.objectId,
                targetHandle: "in",
                type: "ref",
                markerEnd,
            });
        }
    }

    return { nodes, edges };
}

export function CodeVisualizerContainer() {
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();

    const [language, setLanguage] = useState<VisualizerLanguage>("javascript");
    const [code, setCode] = useState(SAMPLES.javascript);
    const [trace, setTrace] = useState<TraceResult>({ steps: [], error: null });
    const [isTracing, setIsTracing] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [generation, setGeneration] = useState(0);

    const runToken = useRef(0);
    const flowContainerRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);

    const run = useCallback(async (source: string, lang: VisualizerLanguage) => {
        const token = ++runToken.current;
        if (!source.trim()) {
            setTrace({ steps: [], error: null });
            setStepIndex(0);
            return;
        }
        setIsTracing(true);
        setIsPlaying(false);
        try {
            const result = lang === "javascript" ? await traceJavaScript(source) : await tracePython(source);
            if (runToken.current !== token) return;
            setTrace(result);
            setStepIndex(0);
            // Frame the viewport to whichever step has the most nodes, not just step 0 (which
            // is usually near-empty) — otherwise the heap objects a later step grows into sit
            // outside the initial pan/zoom and the user has to manually scroll to find them.
            const widestStep = result.steps.reduce<ExecutionStep | null>((widest, step) => {
                const count = step.frames.length + Object.keys(step.heap).length;
                const widestCount = widest ? widest.frames.length + Object.keys(widest.heap).length : -1;
                return count > widestCount ? step : widest;
            }, null);
            const { nodes } = buildFlow(widestStep);
            const rect = flowContainerRef.current?.getBoundingClientRect();
            setViewport(computeFitViewport(nodes, rect?.width ?? 800, rect?.height ?? 600));
            setGeneration((g) => g + 1);
        } finally {
            if (runToken.current === token) setIsTracing(false);
        }
    }, []);

    useEffect(() => {
        const handle = setTimeout(() => run(code, language), 700);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, language]);

    const handleLanguageChange = (value: VisualizerLanguage) => {
        setLanguage(value);
        setCode(SAMPLES[value]);
    };

    const handleLoadSample = () => setCode(SAMPLES[language]);

    // --- step playback ---
    const stepCount = trace.steps.length;
    const clampedIndex = Math.min(stepIndex, Math.max(stepCount - 1, 0));
    const currentStep = stepCount > 0 ? trace.steps[clampedIndex] : null;

    useEffect(() => {
        if (!isPlaying) return;
        if (clampedIndex >= stepCount - 1) {
            setIsPlaying(false);
            return;
        }
        const handle = setTimeout(() => setStepIndex((i) => Math.min(i + 1, stepCount - 1)), STEP_DELAY_MS);
        return () => clearTimeout(handle);
    }, [isPlaying, clampedIndex, stepCount]);

    const handleTogglePlay = () => {
        if (!isPlaying && clampedIndex >= stepCount - 1) setStepIndex(0);
        setIsPlaying((p) => !p);
    };
    const handleReset = () => {
        setIsPlaying(false);
        setStepIndex(0);
    };
    const handleStepBack = () => {
        setIsPlaying(false);
        setStepIndex((i) => Math.max(0, i - 1));
    };
    const handleStepForward = () => {
        setIsPlaying(false);
        setStepIndex((i) => Math.min(stepCount - 1, i + 1));
    };

    // --- editor current-line highlight ---
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
    const decorationsRef = useRef<string[]>([]);
    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    useEffect(() => {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        if (!editor || !monaco) return;
        if (!currentStep) {
            decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
            return;
        }
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
            {
                range: new monaco.Range(currentStep.line, 1, currentStep.line, 1),
                options: { isWholeLine: true, className: "cv-current-line", marginClassName: "cv-current-line-margin" },
            },
        ]);
        editor.revealLineInCenter(currentStep.line);
    }, [currentStep]);

    // --- diagram ---
    const { nodes, edges } = useMemo(() => buildFlow(currentStep), [currentStep]);

    const monacoLanguage = language === "javascript" ? "javascript" : "python";

    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-muted/10 px-3">
                <Select value={language} onValueChange={(v) => handleLanguageChange(v as VisualizerLanguage)}>
                    <SelectTrigger size="sm" className="h-7 w-[130px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[10px] font-bold uppercase" onClick={handleLoadSample}>
                    <Wand2 className="size-3" /> Load Sample
                </Button>
                <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
                    {isTracing && (
                        <span className="flex items-center gap-1.5">
                            <Loader2 className="size-3 animate-spin" /> Running…
                        </span>
                    )}
                    {!isTracing && stepCount > 0 && (
                        <span className="font-medium tabular-nums">
                            Step {clampedIndex + 1} / {stepCount}
                        </span>
                    )}
                </div>
            </div>

            <div className="min-h-0 min-w-0 flex-1">
                <ResizablePanelGroup key={isMobile ? "mobile" : "desktop"} direction={isMobile ? "vertical" : "horizontal"} className="min-h-0 min-w-0">
                    <ResizablePanel defaultSize={40} minSize={25} className="min-h-0 min-w-0">
                        <ResizablePanelGroup direction="vertical" className="min-h-0 min-w-0">
                            <ResizablePanel defaultSize={72} minSize={30} className="min-h-0 min-w-0">
                                <div className={`flex h-full flex-col bg-muted/5 ${isMobile ? "border-b" : "border-r"}`}>
                                    <div className="relative min-h-0 flex-1">
                                        <Editor
                                            height="100%"
                                            language={monacoLanguage}
                                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                                            value={code}
                                            onChange={(value) => setCode(value ?? "")}
                                            onMount={handleEditorMount}
                                            options={{
                                                fontSize: 13,
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                padding: { top: 10, bottom: 10 },
                                                quickSuggestions: false,
                                                suggestOnTriggerCharacters: false,
                                                wordBasedSuggestions: "off",
                                                acceptSuggestionOnCommitCharacter: false,
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={28} minSize={15} className="min-h-0 min-w-0">
                                <div className={`flex h-full flex-col bg-muted/5 ${isMobile ? "border-b" : "border-r"}`}>
                                    <div className="flex h-8 shrink-0 items-center gap-1.5 border-b bg-muted/10 px-3">
                                        <Terminal className="size-3 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Output</span>
                                    </div>
                                    <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] text-foreground">
                                        {currentStep?.stdout || <span className="text-muted-foreground italic">No output yet.</span>}
                                    </pre>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={60} minSize={30} className="min-h-0 min-w-0">
                        <div className="flex h-full flex-col bg-background">
                            {trace.error && (
                                <Alert variant="destructive" className="m-3 mb-0">
                                    <AlertTriangle className="size-4" />
                                    <AlertDescription>{trace.error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="relative min-h-0 flex-1" ref={flowContainerRef}>
                                {stepCount === 0 && !isTracing && !trace.error && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <p className="text-sm text-muted-foreground">Write some code to see it execute, step by step.</p>
                                    </div>
                                )}
                                {stepCount > 0 && (
                                    <ReactFlow
                                        key={generation}
                                        nodes={nodes}
                                        edges={edges}
                                        nodeTypes={nodeTypes}
                                        edgeTypes={edgeTypes}
                                        defaultViewport={viewport}
                                        proOptions={{ hideAttribution: true }}
                                        nodesDraggable={false}
                                        nodesConnectable={false}
                                        elementsSelectable={false}
                                        minZoom={0.1}
                                        className="bg-transparent"
                                    >
                                        <Background color="#888" gap={20} size={1} className="opacity-20" />
                                        <Controls showInteractive={false} />
                                    </ReactFlow>
                                )}
                            </div>

                            <div className="shrink-0 space-y-2 border-t bg-muted/10 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon-sm" onClick={handleReset} disabled={stepCount === 0} title="Restart">
                                        <RotateCcw className="size-3.5" />
                                    </Button>
                                    <Button variant="outline" size="icon-sm" onClick={handleStepBack} disabled={stepCount === 0 || clampedIndex === 0} title="Previous step">
                                        <SkipBack className="size-3.5" />
                                    </Button>
                                    <Button variant="outline" size="icon-sm" onClick={handleTogglePlay} disabled={stepCount === 0}>
                                        {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        onClick={handleStepForward}
                                        disabled={stepCount === 0 || clampedIndex >= stepCount - 1}
                                        title="Next step"
                                    >
                                        <SkipForward className="size-3.5" />
                                    </Button>
                                    <Slider
                                        value={[clampedIndex]}
                                        min={0}
                                        max={Math.max(stepCount - 1, 0)}
                                        step={1}
                                        onValueChange={([v]) => {
                                            setIsPlaying(false);
                                            setStepIndex(v);
                                        }}
                                        disabled={stepCount === 0}
                                        className="flex-1"
                                    />
                                    <span className="w-14 shrink-0 text-right text-[10px] font-medium tabular-nums text-muted-foreground">
                                        line {currentStep?.line ?? "–"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
