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
import { AlertTriangle, ChevronDown, Download, Eraser, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CIRCUIT_FILE_VERSION } from "@/lib/circuit/analog/document";
import {
    GATE_KINDS,
    LOGIC_EXAMPLES,
    isGate,
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
import { LogicPanel } from "./logic-panel";
import { GateSymbol, LOGIC_NODE_TYPES } from "./logic-nodes";
import { LogicRuntimeContext, type LogicNodeData } from "./logic-runtime";
import { SignalEdge } from "./signal-edge";

const EDGE_TYPES = { signal: SignalEdge };
const STORAGE_KEY = "web-circuit-logic";
const FIT_OPTIONS = { padding: 0.4 };
const PALETTE: LogicKind[] = ["switch", "clock", "led", ...GATE_KINDS];

type LogicNodeT = Node<LogicNodeData>;

const nodeType = (kind: LogicKind) => (isGate(kind) ? "gate" : kind);

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
    if (kind === "switch") return { kind, on: false, label: firstFree([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]) ?? "IN" };
    if (kind === "led") return { kind, label: firstFree(Array.from({ length: 50 }, (_, i) => `Y${i + 1}`)) };
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

    const [clockValues, setClockValues] = useState<Record<string, boolean>>({});
    const clockStart = useRef(0);
    useEffect(() => {
        const clocks = JSON.parse(clockKey) as [string, number][];
        if (clocks.length === 0) return;
        if (!clockStart.current) clockStart.current = performance.now();
        const timer = window.setInterval(() => {
            const elapsed = (performance.now() - clockStart.current) / 1000;
            const next = Object.fromEntries(clocks.map(([id, period]) => [id, Math.floor(elapsed / (period / 2)) % 2 === 1]));
            setClockValues((previous) => (clocks.every(([id]) => previous[id] === next[id]) ? previous : next));
        }, 50);
        return () => window.clearInterval(timer);
    }, [clockKey]);

    // Each update settles from the previous outputs, so latches keep state.
    const [result, setResult] = useState<LogicResult>(() => simulateLogic(model.parts, model.wires));
    useEffect(() => {
        setResult((previous) => simulateLogic(model.parts, model.wires, clockValues, previous.outputs));
    }, [model, clockValues]);

    const table = useMemo(() => truthTable(model.parts, model.wires), [model]);
    const currentInputs = model.parts.filter((part) => part.kind === "switch").map((part) => Boolean(part.on));

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
            if (patch.kind === "not") setEdges((current) => current.filter((edge) => !(edge.target === id && edge.targetHandle === "in1")));
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

    const runtime = useMemo(() => ({ result, toggleSwitch }), [result, toggleSwitch]);
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
                    <div className="flex shrink-0 gap-1 overflow-x-auto border-b p-2 md:w-36 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r" role="toolbar" aria-label="Add a part">
                        {PALETTE.map((kind) => (
                            <button
                                key={kind}
                                type="button"
                                onClick={() => addPart(kind)}
                                className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                                title={`Add ${isGate(kind) ? `an ${kind.toUpperCase()} gate` : `a ${kind}`}`}
                            >
                                <span className="flex w-8 shrink-0 justify-center text-muted-foreground">
                                    {isGate(kind) ? (
                                        <GateSymbol kind={kind} size={30} />
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase">{kind === "switch" ? "IN" : kind === "led" ? "OUT" : "CLK"}</span>
                                    )}
                                </span>
                                {isGate(kind) ? kind.toUpperCase() : kind === "led" ? "LED" : kind === "switch" ? "Switch" : "Clock"}
                            </button>
                        ))}
                    </div>

                    <div ref={canvasRef} className="relative min-h-[320px] min-w-0 flex-1">
                        {!result.stable && (
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

                    <aside className="max-h-72 shrink-0 overflow-y-auto border-t md:max-h-none md:w-64 md:border-l md:border-t-0" aria-label="Selected part and truth table">
                        <LogicPanel
                            part={
                                selectedNode && {
                                    id: selectedNode.id,
                                    data: selectedNode.data,
                                    value: selectedNode.data.kind === "led" ? Boolean(result.leds[selectedNode.id]) : Boolean(result.outputs[selectedNode.id]),
                                }
                            }
                            wire={selectedEdge && { id: selectedEdge.id, value: Boolean(result.wires[selectedEdge.id]) }}
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
