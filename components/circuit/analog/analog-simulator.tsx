"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
    Background,
    ConnectionLineType,
    ConnectionMode,
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
import { ANALOG_EXAMPLES, CIRCUIT_FILE_VERSION, parseCircuitDocument, type CircuitDocument } from "@/lib/circuit/analog/document";
import { PALETTE_GROUPS, PART_DEFS, type AnalogKind, type AnalogPart, type Rotation, type Wire } from "@/lib/circuit/analog/parts";
import { SHORT_CIRCUIT_CURRENT, initialSimState, solveCircuit, type SolveResult } from "@/lib/circuit/analog/solver";
import { formatSI } from "@/lib/circuit/units";
import { cn } from "@/lib/utils";
import { downloadJson } from "../download";
import { SimulationControls, SimulationNotice, type SimStatus } from "../simulation-controls";
import { PartNode } from "./part-node";
import { PartSymbol } from "./part-symbol";
import { PropertiesPanel } from "./properties-panel";
import { AnalogRuntimeContext, type PartNodeData } from "./runtime";
import { WireEdge } from "./wire-edge";

const NODE_TYPES = { part: PartNode };
const EDGE_TYPES = { wire: WireEdge };
const STORAGE_KEY = "web-circuit-analog";
// Simulated seconds per solver step for circuits with capacitors.
const DT = 1e-3;
const EMPTY_RESULT: SolveResult = solveCircuit([], [], initialSimState(), DT);
// Generous padding: part labels sit outside the parts' own boxes.
const FIT_OPTIONS = { padding: 0.45 };

type PartNodeT = Node<PartNodeData>;

interface CircuitModel {
    parts: AnalogPart[];
    wires: Wire[];
}

function toFlow(doc: CircuitDocument): { nodes: PartNodeT[]; edges: Edge[] } {
    return {
        nodes: doc.parts.map(({ id, x, y, kind, value, rotation, closed, color, position }) => ({
            id,
            type: "part",
            position: { x, y },
            data: {
                kind,
                value,
                rotation,
                ...(closed !== undefined && { closed }),
                ...(color && { color }),
                ...(position !== undefined && { position }),
            },
        })),
        edges: doc.wires.map(({ id, from, to }) => {
            const [source, sourceHandle] = from.split(":");
            const [target, targetHandle] = to.split(":");
            return { id, type: "wire", source, sourceHandle, target, targetHandle };
        }),
    };
}

function toDocument(nodes: PartNodeT[], edges: Edge[]): CircuitDocument {
    return {
        parts: nodes.map((node) => ({ id: node.id, x: Math.round(node.position.x), y: Math.round(node.position.y), ...node.data })),
        wires: edges.map((edge) => ({ id: edge.id, from: `${edge.source}:${edge.sourceHandle}`, to: `${edge.target}:${edge.targetHandle}` })),
    };
}

// Only what affects the electrical result; dragging a part doesn't change it.
function toModel(nodes: PartNodeT[], edges: Edge[]): CircuitModel {
    const { parts, wires } = toDocument(nodes, edges);
    return { parts: parts.map(({ id, kind, value, closed, color, position }) => ({ id, kind, value, closed, color, position })), wires };
}

// Proteus-style reference designators: R1, C2, LED1, FU1…
function nextId(kind: AnalogKind, nodes: PartNodeT[]) {
    const prefix = PART_DEFS[kind].prefix;
    let n = 1;
    while (nodes.some((node) => node.id === `${prefix}${n}`)) n++;
    return `${prefix}${n}`;
}

export function AnalogSimulator() {
    return (
        <ReactFlowProvider>
            <AnalogSimulatorInner />
        </ReactFlowProvider>
    );
}

function AnalogSimulatorInner() {
    const initial = useMemo(() => toFlow(ANALOG_EXAMPLES[0].circuit), []);
    const [nodes, setNodes, onNodesChange] = useNodesState<PartNodeData>(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
    const { fitView, screenToFlowPosition } = useReactFlow();
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addCount = useRef(0);

    // Fit the view once newly loaded parts have been measured: fitting right
    // after setNodes would use the previous circuit's bounds. React Flow
    // reports measurements as "dimensions" changes; the timer covers a
    // circuit whose parts kept the same ids and sizes.
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
            if (fitPending.current && changes.some((change) => change.type === "dimensions")) {
                requestAnimationFrame(fitLoadedCircuit);
            }
        },
        [onNodesChange, fitLoadedCircuit]
    );

    // --- Simulation
    const circuitKey = useMemo(() => JSON.stringify(toModel(nodes, edges)), [nodes, edges]);
    const model = useMemo(() => JSON.parse(circuitKey) as CircuitModel, [circuitKey]);
    const hasCapacitors = model.parts.some((part) => part.kind === "capacitor");
    // Capacitors charge over time and fuses stay blown, so those circuits are
    // stepped continuously; anything else has no memory.
    const stateful = hasCapacitors || model.parts.some((part) => part.kind === "fuse");

    // Without memory, solve once per change.
    const staticResult = useMemo(
        () => (stateful ? null : solveCircuit(model.parts, model.wires, initialSimState(), DT)),
        [model, stateful]
    );

    // With capacitors, step simulated time in real time while running.
    const simState = useRef(initialSimState());
    const simTime = useRef(0);
    const [status, setStatus] = useState<SimStatus>("running");
    const [resetCount, setResetCount] = useState(0);
    const [dynamic, setDynamic] = useState<{ result: SolveResult; time: number } | null>(null);
    // What the canvas shows while paused: the readings at the moment of pausing.
    const [frozen, setFrozen] = useState<SolveResult>(EMPTY_RESULT);

    useEffect(() => {
        if (!stateful || status !== "running") return;
        let frame = 0;
        let last = performance.now();
        const tick = (now: number) => {
            const steps = Math.max(1, Math.round(Math.min((now - last) / 1000, 0.05) / DT));
            last = now;
            let result = EMPTY_RESULT;
            for (let i = 0; i < steps; i++) {
                result = solveCircuit(model.parts, model.wires, simState.current, DT);
                simState.current = result.state;
                simTime.current += DT;
            }
            setDynamic({ result, time: simTime.current });
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [model, stateful, status, resetCount]);

    const liveResult = staticResult ?? dynamic?.result ?? EMPTY_RESULT;
    const result = status === "running" ? liveResult : status === "paused" ? frozen : EMPTY_RESULT;

    const resetSimulation = useCallback(() => {
        simState.current = initialSimState();
        simTime.current = 0;
        setDynamic(null);
        setResetCount((count) => count + 1);
    }, []);

    const runSimulation = () => {
        if (status === "stopped") resetSimulation();
        setStatus("running");
    };
    const pauseSimulation = () => {
        if (status !== "running") return;
        setFrozen(liveResult);
        setStatus("paused");
    };
    // Stop is "power off": no readings, capacitors discharged, clock at 0.
    const stopSimulation = () => {
        resetSimulation();
        setStatus("stopped");
    };

    // --- Persistence for this tab
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const flow = toFlow(parseCircuitDocument(JSON.parse(saved)));
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
        (doc: CircuitDocument) => {
            const flow = toFlow(doc);
            setNodes(flow.nodes);
            setEdges(flow.edges);
            resetSimulation();
            // Frozen readings belong to the previous circuit.
            setStatus((current) => (current === "paused" ? "running" : current));
            requestFit();
        },
        [setNodes, setEdges, resetSimulation, requestFit]
    );

    const updatePart = useCallback(
        (id: string, patch: Partial<PartNodeData>) =>
            setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...patch } } : node))),
        [setNodes]
    );

    const toggleSwitch = useCallback(
        (id: string) =>
            setNodes((current) =>
                current.map((node) => (node.id === id ? { ...node, data: { ...node.data, closed: !node.data.closed } } : node))
            ),
        [setNodes]
    );

    const rotateSelected = useCallback(
        () =>
            setNodes((current) =>
                current.map((node) =>
                    node.selected ? { ...node, data: { ...node.data, rotation: ((node.data.rotation + 90) % 360) as Rotation } } : node
                )
            ),
        [setNodes]
    );

    const deleteSelected = useCallback(() => {
        const removed = new Set(nodes.filter((node) => node.selected).map((node) => node.id));
        setNodes((current) => current.filter((node) => !node.selected));
        setEdges((current) => current.filter((edge) => !edge.selected && !removed.has(edge.source) && !removed.has(edge.target)));
    }, [nodes, setNodes, setEdges]);

    const addPart = (kind: AnalogKind) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const center = rect ? screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) : { x: 0, y: 0 };
        const offset = (addCount.current++ % 5) * 24;
        const id = nextId(kind, nodes);
        setNodes((current) => [
            ...current.map((node) => ({ ...node, selected: false })),
            {
                id,
                type: "part",
                position: { x: Math.round(center.x - 40 + offset), y: Math.round(center.y - 40 + offset) },
                selected: true,
                data: {
                    kind,
                    value: PART_DEFS[kind].defaultValue,
                    rotation: 0,
                    ...(kind === "switch" && { closed: true }),
                    ...(kind === "button" && { closed: false }),
                    ...(kind === "led" && { color: "red" as const }),
                    ...(kind === "potentiometer" && { position: 0.5 }),
                },
            },
        ]);
    };

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;
            if (connection.source === connection.target && connection.sourceHandle === connection.targetHandle) return;
            setEdges((current) => addEdge({ ...connection, id: `w-${crypto.randomUUID().slice(0, 8)}`, type: "wire" }, current));
        },
        [setEdges]
    );

    const clearCircuit = () => {
        const previous = toDocument(nodes, edges);
        loadDocument({ parts: [], wires: [] });
        toast("Circuit cleared", { action: { label: "Undo", onClick: () => loadDocument(previous) } });
    };

    const saveCircuit = () => {
        downloadJson({ version: CIRCUIT_FILE_VERSION, mode: "analog", ...toDocument(nodes, edges) }, "circuit.json");
    };

    const openCircuit = async (file: File | undefined) => {
        if (!file) return;
        try {
            const json = JSON.parse(await file.text());
            if (json?.mode === "logic") throw new Error("This is a logic circuit. Open it from the Logic tab.");
            loadDocument(parseCircuitDocument(json));
            toast.success(`Opened ${file.name}`);
        } catch (error) {
            toast.error("Couldn't open that file", { description: error instanceof Error ? error.message : String(error) });
        }
    };

    // R rotates the selection (outside text fields).
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (event.key.toLowerCase() !== "r" || event.ctrlKey || event.metaKey || target.closest("input, textarea, [contenteditable]")) return;
            rotateSelected();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [rotateSelected]);

    const replaceFuse = useCallback((id: string) => {
        const blownFuses = { ...simState.current.blownFuses };
        delete blownFuses[id];
        simState.current = { ...simState.current, blownFuses };
    }, []);

    const runtime = useMemo(() => ({ result, toggleSwitch, updatePart }), [result, toggleSwitch, updatePart]);
    const selectedNode = nodes.find((node) => node.selected);
    const selectedEdge = edges.find((edge) => edge.selected);
    const batteryCurrent = Math.max(0, ...model.parts.filter((p) => p.kind === "battery").map((p) => Math.abs(result.readings[p.id]?.current ?? 0)));

    return (
        <AnalogRuntimeContext.Provider value={runtime}>
            <div className="flex h-full min-h-0 flex-col">
                {/* Toolbar */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                                Examples <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-w-xs">
                            {ANALOG_EXAMPLES.map((example) => (
                                <DropdownMenuItem key={example.id} onClick={() => loadDocument(example.circuit)} className="flex-col items-start gap-0.5">
                                    <span className="text-xs font-semibold">{example.label}</span>
                                    <span className="text-[11px] text-muted-foreground">{example.description}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <SimulationControls
                        status={status}
                        onRun={runSimulation}
                        onPause={pauseSimulation}
                        onStop={stopSimulation}
                        detail={hasCapacitors ? `t = ${(dynamic?.time ?? 0).toFixed(1)} s` : undefined}
                    />

                    <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={clearCircuit}>
                            <Eraser className="size-3.5" /> Clear
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={() => fileInputRef.current?.click()}>
                            <FolderOpen className="size-3.5" /> Open
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={saveCircuit}>
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
                    {/* Palette */}
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
                                        title={`Add a ${PART_DEFS[kind].label.toLowerCase()}`}
                                    >
                                        <span className="shrink-0 text-muted-foreground">
                                            <PartSymbol kind={kind} size={28} closed />
                                        </span>
                                        {PART_DEFS[kind].label}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Canvas */}
                    <div ref={canvasRef} className={cn("relative min-h-[320px] min-w-0 flex-1", status === "paused" && "circuit-paused")}>
                        <SimulationNotice status={status} />
                        {(result.shortCircuit || result.overloadedLeds.length > 0) && (
                            <div role="alert" className="absolute inset-x-3 top-3 z-10 space-y-1 rounded-lg border border-destructive/40 bg-background/95 px-3 py-2 text-xs text-destructive shadow-sm backdrop-blur">
                                {result.shortCircuit && (
                                    <p className="flex gap-2">
                                        <AlertTriangle className="size-4 shrink-0" />
                                        Short circuit: the battery is driving {formatSI(batteryCurrent, "A")} (over {SHORT_CIRCUIT_CURRENT} A). Put a load such as a resistor in the loop.
                                    </p>
                                )}
                                {result.overloadedLeds.map((id) => (
                                    <p key={id} className="flex gap-2">
                                        <AlertTriangle className="size-4 shrink-0" />
                                        {id} draws {formatSI(result.readings[id]?.current ?? 0, "A")}, more than an LED can take. Add a resistor in series (about 330 Ω for 9 V).
                                    </p>
                                ))}
                            </div>
                        )}
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={handleNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={NODE_TYPES}
                            edgeTypes={EDGE_TYPES}
                            connectionMode={ConnectionMode.Loose}
                            connectionLineType={ConnectionLineType.Step}
                            defaultEdgeOptions={{ type: "wire" }}
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

                    {/* Properties */}
                    <aside className="max-h-60 shrink-0 overflow-y-auto border-t md:max-h-none md:w-64 md:border-l md:border-t-0" aria-label="Selected part">
                        <PropertiesPanel
                            part={selectedNode && { id: selectedNode.id, data: selectedNode.data, reading: result.readings[selectedNode.id] }}
                            wire={selectedEdge && { id: selectedEdge.id, current: result.wireCurrents[selectedEdge.id] ?? 0 }}
                            onUpdate={(patch) => selectedNode && updatePart(selectedNode.id, patch)}
                            onRotate={rotateSelected}
                            onDelete={deleteSelected}
                            onReplaceFuse={replaceFuse}
                        />
                    </aside>
                </div>
            </div>
        </AnalogRuntimeContext.Provider>
    );
}
