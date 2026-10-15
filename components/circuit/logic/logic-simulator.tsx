"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
    Background,
    ConnectionLineType,
    Controls,
    ReactFlowProvider,
    addEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Connection,
    type Edge,
    type Node,
    type NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";
import { Activity, AlertTriangle, ChevronDown, Download, Eraser, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CIRCUIT_FILE_VERSION } from "@/lib/circuit/analog/document";
import {
    FLIP_FLOP_KINDS,
    GATE_KINDS,
    LOGIC_EXAMPLES,
    PINS,
    POWERED_OFF,
    isFlipFlop,
    isGate,
    isIndicator,
    isInput,
    parseLogicDocument,
    simulateLogic,
    truthTable,
    type LogicDocument,
    type LogicKind,
    type LogicPart,
    type LogicResult,
    type LogicWire,
} from "@/lib/circuit/logic/logic";
import { downloadJson } from "../download";
import { SimulationControls, SimulationNotice, type SimStatus } from "../simulation-controls";
import { LogicPanel } from "./logic-panel";
import { GateSymbol, LOGIC_NODE_TYPES } from "./logic-nodes";
import { LogicRuntimeContext, type LogicNodeData } from "./logic-runtime";
import { SignalEdge } from "./signal-edge";
import { TimingDiagram, type TimingSample, type TimingSignal } from "./timing-diagram";

const EDGE_TYPES = { signal: SignalEdge };
const STORAGE_KEY = "web-circuit-logic";
const FIT_OPTIONS = { padding: 0.4 };
const PALETTE_GROUPS: { label: string; kinds: LogicKind[] }[] = [
    { label: "Inputs", kinds: ["switch", "button", "clock"] },
    { label: "Gates", kinds: GATE_KINDS },
    { label: "Flip-flops", kinds: FLIP_FLOP_KINDS },
    { label: "Outputs", kinds: ["led", "probe", "seg7"] },
];
const PART_NAMES: Partial<Record<LogicKind, string>> = {
    switch: "Switch",
    button: "Push button",
    clock: "Clock",
    led: "LED",
    probe: "Logic probe",
    seg7: "7-segment",
    dff: "D flip-flop",
    jkff: "JK flip-flop",
    tff: "T flip-flop",
};
const PALETTE_BADGES: Partial<Record<LogicKind, string>> = {
    switch: "IN",
    button: "BTN",
    clock: "CLK",
    led: "LED",
    probe: "1/0",
    seg7: "8.",
    dff: "D",
    jkff: "JK",
    tff: "T",
};
// Seconds of history the timing diagram shows (it keeps twice that).
const TIMING_WINDOW = 10;

type LogicNodeT = Node<LogicNodeData>;

const nodeType = (kind: LogicKind) => (isGate(kind) ? "gate" : isFlipFlop(kind) ? "flipflop" : kind);

function toFlow(doc: LogicDocument): { nodes: LogicNodeT[]; edges: Edge[] } {
    return {
        nodes: doc.parts.map(({ id, x, y, kind, on, period, label }) => ({
            id,
            type: nodeType(kind),
            position: { x, y },
            data: { kind, ...(on !== undefined && { on }), ...(period !== undefined && { period }), ...(label !== undefined && { label }) },
        })),
        edges: doc.wires.map(({ id, from, to }) => {
            const [source, sourceHandle] = from.split(":");
            const [target, targetHandle] = to.split(":");
            return { id, type: "signal", source, sourceHandle, target, targetHandle };
        }),
    };
}

function toDocument(nodes: LogicNodeT[], edges: Edge[]): LogicDocument {
    return {
        parts: nodes.map((node) => ({ id: node.id, x: Math.round(node.position.x), y: Math.round(node.position.y), ...node.data })),
        wires: edges.map((edge) => ({ id: edge.id, from: `${edge.source}:${edge.sourceHandle}`, to: `${edge.target}:${edge.targetHandle}` })),
    };
}

function toModel(nodes: LogicNodeT[], edges: Edge[]): { parts: LogicPart[]; wires: LogicWire[] } {
    const { parts, wires } = toDocument(nodes, edges);
    return { parts: parts.map(({ id, kind, on, period, label }) => ({ id, kind, on, period, label })), wires };
}

function newPartData(kind: LogicKind, nodes: LogicNodeT[]): LogicNodeData {
    const labels = new Set(nodes.map((node) => node.data.label));
    const firstFree = (candidates: string[]) => candidates.find((label) => !labels.has(label));
    const numbered = (prefix: string) => firstFree(Array.from({ length: 50 }, (_, i) => `${prefix}${i + 1}`));
    if (kind === "switch" || kind === "button") return { kind, on: false, label: firstFree([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]) ?? "IN" };
    if (kind === "led") return { kind, label: numbered("Y") };
    if (kind === "probe") return { kind, label: numbered("P") };
    if (kind === "seg7") return { kind, label: numbered("DISP") };
    if (isFlipFlop(kind)) return { kind, label: numbered("FF") };
    if (kind === "clock") return { kind, period: 1, label: firstFree(["CLK", "CLK2", "CLK3", "CLK4"]) ?? "CLK" };
    return { kind };
}

function nextId(kind: LogicKind, nodes: LogicNodeT[]) {
    const prefix = kind === "switch" ? "sw" : kind === "clock" ? "clk" : kind;
    let n = 1;
    while (nodes.some((node) => node.id === `${prefix}${n}`)) n++;
    return `${prefix}${n}`;
}

export function LogicSimulator() {
    return (
        <ReactFlowProvider>
            <LogicSimulatorInner />
        </ReactFlowProvider>
    );
}

function LogicSimulatorInner() {
    const initial = useMemo(() => toFlow(LOGIC_EXAMPLES[1].circuit), []);
    const [nodes, setNodes, onNodesChange] = useNodesState<LogicNodeData>(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
    const { fitView, screenToFlowPosition } = useReactFlow();
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addCount = useRef(0);

    // Fit once newly loaded parts are measured (see the analog simulator).
    const fitPending = useRef(false);
    const fitLoadedCircuit = useCallback(() => {
        if (!fitPending.current) return;
        fitPending.current = false;
        fitView(FIT_OPTIONS);
    }, [fitView]);
    const requestFit = useCallback(() => {
        fitPending.current = true;
        window.setTimeout(fitLoadedCircuit, 200);
    }, [fitLoadedCircuit]);
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            onNodesChange(changes);
            if (fitPending.current && changes.some((change) => change.type === "dimensions")) requestAnimationFrame(fitLoadedCircuit);
        },
        [onNodesChange, fitLoadedCircuit]
    );

    // --- Simulation
    const modelKey = useMemo(() => JSON.stringify(toModel(nodes, edges)), [nodes, edges]);
    const model = useMemo(() => JSON.parse(modelKey) as { parts: LogicPart[]; wires: LogicWire[] }, [modelKey]);
    const clockKey = JSON.stringify(model.parts.filter((part) => part.kind === "clock").map((part) => [part.id, part.period ?? 1]));

    const [status, setStatus] = useState<SimStatus>("running");

    // Clock time only advances while running, so pausing holds every clock.
    const [clockValues, setClockValues] = useState<Record<string, boolean>>({});
    const [showTiming, setShowTiming] = useState(false);
    const [timing, setTiming] = useState<TimingSample[]>([]);
    const [timingNow, setTimingNow] = useState(0);
    const clockTime = useRef(0);
    useEffect(() => {
        const clocks = JSON.parse(clockKey) as [string, number][];
        if (status !== "running") return;
        let last = performance.now();
        const timer = window.setInterval(() => {
            const now = performance.now();
            clockTime.current += (now - last) / 1000;
            last = now;
            if (showTiming) setTimingNow(clockTime.current);
            if (clocks.length === 0) return;
            const next = Object.fromEntries(clocks.map(([id, period]) => [id, Math.floor(clockTime.current / (period / 2)) % 2 === 1]));
            setClockValues((previous) => (clocks.every(([id]) => previous[id] === next[id]) ? previous : next));
        }, 50);
        return () => window.clearInterval(timer);
    }, [clockKey, status, showTiming]);

    // Each update settles from the previous outputs, so latches keep state.
    // Nothing is recomputed while paused; stopped shows everything off.
    const [result, setResult] = useState<LogicResult>(() => simulateLogic(model.parts, model.wires));
    useEffect(() => {
        if (status !== "running") return;
        setResult((previous) => simulateLogic(model.parts, model.wires, clockValues, previous));
    }, [model, clockValues, status]);

    // Logic analyzer: a sample of every traced signal each time the result changes.
    useEffect(() => {
        if (status !== "running") return;
        const values: Record<string, boolean> = { ...result.outputs };
        for (const [id, value] of Object.entries(result.leds)) values[`led:${id}`] = value;
        const time = clockTime.current;
        setTiming((samples) => [...samples.filter((sample) => sample.time >= time - TIMING_WINDOW * 2), { time, values }]);
    }, [result, status]);
    const timingSignals = useMemo<TimingSignal[]>(
        () =>
            model.parts.flatMap((part) => {
                const label = part.label || part.id.toUpperCase();
                if (isInput(part.kind)) return [{ key: `${part.id}:out`, label }];
                if (isFlipFlop(part.kind)) return [{ key: `${part.id}:out`, label: `${label}.Q` }];
                if (isIndicator(part.kind)) return [{ key: `led:${part.id}`, label }];
                return [];
            }),
        [model]
    );
    const shownResult = status === "stopped" ? POWERED_OFF : result;

    const runSimulation = () => setStatus("running");
    const pauseSimulation = () => setStatus((current) => (current === "running" ? "paused" : current));
    // Stop is "power off": clocks reset and latches forget.
    const stopSimulation = () => {
        clockTime.current = 0;
        setClockValues({});
        setResult(POWERED_OFF);
        setTiming([]);
        setTimingNow(0);
        setStatus("stopped");
    };

    const table = useMemo(() => truthTable(model.parts, model.wires), [model]);
    const currentInputs = model.parts.filter((part) => part.kind === "switch" || part.kind === "button").map((part) => Boolean(part.on));

    // --- Persistence for this tab
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const flow = toFlow(parseLogicDocument(JSON.parse(saved)));
            setNodes(flow.nodes);
            setEdges(flow.edges);
            requestFit();
        } catch {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, [setNodes, setEdges, requestFit]);

    useEffect(() => {
        const timer = setTimeout(() => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toDocument(nodes, edges))), 400);
        return () => clearTimeout(timer);
    }, [nodes, edges]);

    // --- Editing
    const loadDocument = useCallback(
        (doc: LogicDocument) => {
            const flow = toFlow(doc);
            setNodes(flow.nodes);
            setEdges(flow.edges);
            // A new circuit starts powered up fresh: part ids get reused between
            // circuits, so old flip-flop memory and traces must not carry over.
            setResult(POWERED_OFF);
            setTiming([]);
            requestFit();
        },
        [setNodes, setEdges, requestFit]
    );

    const updatePart = useCallback(
        (id: string, patch: Partial<LogicNodeData>) => {
            setNodes((current) =>
                current.map((node) =>
                    node.id === id ? { ...node, type: nodeType(patch.kind ?? node.data.kind), data: { ...node.data, ...patch } } : node
                )
            );
            // A NOT gate has a single input.
            // Single-input gates (NOT, buffer) drop the wire on their second input.
            if (patch.kind && PINS[patch.kind].inputs.length === 1) {
                setEdges((current) => current.filter((edge) => !(edge.target === id && edge.targetHandle === "in1")));
            }
        },
        [setNodes, setEdges]
    );

    const toggleSwitch = useCallback(
        (id: string) => setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: { ...node.data, on: !node.data.on } } : node))),
        [setNodes]
    );

    const deleteSelected = useCallback(() => {
        const removed = new Set(nodes.filter((node) => node.selected).map((node) => node.id));
        setNodes((current) => current.filter((node) => !node.selected));
        setEdges((current) => current.filter((edge) => !edge.selected && !removed.has(edge.source) && !removed.has(edge.target)));
    }, [nodes, setNodes, setEdges]);

    const addPart = (kind: LogicKind) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const center = rect ? screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) : { x: 0, y: 0 };
        const offset = (addCount.current++ % 5) * 24;
        const id = nextId(kind, nodes);
        setNodes((current) => [
            ...current.map((node) => ({ ...node, selected: false })),
            {
                id,
                type: nodeType(kind),
                position: { x: Math.round(center.x - 40 + offset), y: Math.round(center.y - 30 + offset) },
                selected: true,
                data: newPartData(kind, current),
            },
        ]);
    };

    // An input takes one wire; connecting a new one replaces the old.
    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target || !connection.targetHandle) return;
            setEdges((current) =>
                addEdge(
                    { ...connection, id: `w-${crypto.randomUUID().slice(0, 8)}`, type: "signal" },
                    current.filter((edge) => !(edge.target === connection.target && edge.targetHandle === connection.targetHandle))
                )
            );
        },
        [setEdges]
    );

    const clearCircuit = () => {
        const previous = toDocument(nodes, edges);
        loadDocument({ parts: [], wires: [] });
        toast("Circuit cleared", { action: { label: "Undo", onClick: () => loadDocument(previous) } });
    };

    const openCircuit = async (file: File | undefined) => {
        if (!file) return;
        try {
            const json = JSON.parse(await file.text());
            if (json?.mode === "analog") throw new Error("This is an analog circuit. Open it from the Analog tab.");
            loadDocument(parseLogicDocument(json));
            toast.success(`Opened ${file.name}`);
        } catch (error) {
            toast.error("Couldn't open that file", { description: error instanceof Error ? error.message : String(error) });
        }
    };

    const setPressed = useCallback(
        (id: string, pressed: boolean) => setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: { ...node.data, on: pressed } } : node))),
        [setNodes]
    );

    const runtime = useMemo(() => ({ result: shownResult, toggleSwitch, setPressed }), [shownResult, toggleSwitch, setPressed]);
    const selectedNode = nodes.find((node) => node.selected);
    const selectedEdge = edges.find((edge) => edge.selected);

    return (
        <LogicRuntimeContext.Provider value={runtime}>
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                                Examples <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-w-xs">
                            {LOGIC_EXAMPLES.map((example) => (
                                <DropdownMenuItem key={example.id} onClick={() => loadDocument(example.circuit)} className="flex-col items-start gap-0.5">
                                    <span className="text-xs font-semibold">{example.label}</span>
                                    <span className="text-[11px] text-muted-foreground">{example.description}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <SimulationControls status={status} onRun={runSimulation} onPause={pauseSimulation} onStop={stopSimulation} />
                    <Button
                        variant={showTiming ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold"
                        onClick={() => {
                            setTimingNow(clockTime.current);
                            setShowTiming((shown) => !shown);
                        }}
                        aria-pressed={showTiming}
                    >
                        <Activity className="size-3.5" /> Timing diagram
                    </Button>
                    <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={clearCircuit}>
                            <Eraser className="size-3.5" /> Clear
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={() => fileInputRef.current?.click()}>
                            <FolderOpen className="size-3.5" /> Open
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-semibold"
                            onClick={() => downloadJson({ version: CIRCUIT_FILE_VERSION, mode: "logic", ...toDocument(nodes, edges) }, "logic-circuit.json")}
                        >
                            <Download className="size-3.5" /> Save
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json,.json"
                            className="hidden"
                            onChange={(event) => {
                                void openCircuit(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                    <div className="flex shrink-0 gap-1 overflow-x-auto border-b p-2 md:w-40 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r" role="toolbar" aria-label="Add a part">
                        {PALETTE_GROUPS.map((group) => (
                            <div key={group.label} className="flex shrink-0 gap-1 md:flex-col">
                                <span className="hidden px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:block">{group.label}</span>
                                {group.kinds.map((kind) => (
                                    <button
                                        key={kind}
                                        type="button"
                                        onClick={() => addPart(kind)}
                                        className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-left text-xs font-medium text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                                        title={isGate(kind) ? `Add an ${kind.toUpperCase()} gate` : `Add a ${(PART_NAMES[kind] ?? kind).toLowerCase()}`}
                                    >
                                        <span className="flex w-8 shrink-0 justify-center text-muted-foreground">
                                            {isGate(kind) ? <GateSymbol kind={kind} size={30} /> : <span className="text-[10px] font-bold">{PALETTE_BADGES[kind]}</span>}
                                        </span>
                                        {isGate(kind) ? kind.toUpperCase() : PART_NAMES[kind]}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <div ref={canvasRef} className="relative min-h-[320px] min-w-0 flex-1">
                            <SimulationNotice status={status} />
                            {!shownResult.stable && (
                                <div role="alert" className="absolute inset-x-3 top-3 z-10 flex gap-2 rounded-lg border border-destructive/40 bg-background/95 px-3 py-2 text-xs text-destructive shadow-sm backdrop-blur">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    This circuit oscillates: a feedback loop never settles (for example a NOT gate wired to its own input).
                                </div>
                            )}
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={handleNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                nodeTypes={LOGIC_NODE_TYPES}
                                edgeTypes={EDGE_TYPES}
                                connectionLineType={ConnectionLineType.SmoothStep}
                                defaultEdgeOptions={{ type: "signal" }}
                                snapToGrid
                                snapGrid={[20, 20]}
                                deleteKeyCode={["Backspace", "Delete"]}
                                fitView
                                fitViewOptions={FIT_OPTIONS}
                                minZoom={0.2}
                                maxZoom={3}
                                proOptions={{ hideAttribution: true }}
                                className="bg-transparent"
                            >
                                <Background gap={20} size={1} />
                                <Controls showInteractive={false} />
                            </ReactFlow>
                        </div>
                        {showTiming && (
                            <section className="max-h-60 shrink-0 overflow-y-auto border-t" aria-label="Timing diagram">
                                <TimingDiagram signals={timingSignals} samples={timing} now={timingNow} window={TIMING_WINDOW} />
                            </section>
                        )}
                    </div>

                    <aside className="max-h-72 shrink-0 overflow-y-auto border-t md:max-h-none md:w-64 md:border-l md:border-t-0" aria-label="Selected part and truth table">
                        <LogicPanel
                            part={
                                selectedNode && {
                                    id: selectedNode.id,
                                    data: selectedNode.data,
                                    value: isIndicator(selectedNode.data.kind)
                                        ? Boolean(shownResult.leds[selectedNode.id])
                                        : Boolean(shownResult.outputs[`${selectedNode.id}:out`]),
                                    display: shownResult.displays[selectedNode.id],
                                }
                            }
                            wire={selectedEdge && { id: selectedEdge.id, value: Boolean(shownResult.wires[selectedEdge.id]) }}
                            table={table}
                            currentInputs={currentInputs}
                            onUpdate={(patch) => selectedNode && updatePart(selectedNode.id, patch)}
                            onDelete={deleteSelected}
                        />
                    </aside>
                </div>
            </div>
        </LogicRuntimeContext.Provider>
    );
}
