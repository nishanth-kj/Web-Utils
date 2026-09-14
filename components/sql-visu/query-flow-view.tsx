"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MarkerType,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AlertTriangle, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonacoEditor as Editor } from "@/components/shared/lazy-monaco";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { StageNode } from "./nodes/stage-node";
import { parseSelectToFlow } from "@/lib/sql-visu/query-parser";
import { layoutQueryFlow } from "@/lib/sql-visu/query-flow-layout";
import { computeFitViewport } from "@/lib/sql-visu/fit-view";
import { toFriendlyParseError } from "@/lib/sql-visu/friendly-error";
import type { QueryStage, SqlDialect } from "@/lib/sql-visu/types";

export const SAMPLE_QUERY = `SELECT u.name, COUNT(p.id) AS post_count
FROM users u
JOIN posts p ON p.user_id = u.id
WHERE u.active = 1
GROUP BY u.name
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC
LIMIT 10;`;

const nodeTypes = { stage: StageNode };
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

interface QueryFlowViewProps {
    dialect: SqlDialect;
    query: string;
    onQueryChange: (value: string) => void;
}

export function QueryFlowView({ dialect, query, onQueryChange }: QueryFlowViewProps) {
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const [nodes, setNodes, onNodesChange] = useNodesState<{ stage: QueryStage }>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [error, setError] = useState<string | null>(null);
    const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
    const [generation, setGeneration] = useState(0);
    const generationRef = useRef(0);
    const flowContainerRef = useRef<HTMLDivElement>(null);

    const generate = useCallback(
        async (source: string) => {
            const generationId = ++generationRef.current;
            if (!source.trim()) {
                setNodes([]);
                setEdges([]);
                setError(null);
                return;
            }
            try {
                const flow = await parseSelectToFlow(source, dialect);
                if (generationRef.current !== generationId) return;

                const positions = layoutQueryFlow(flow.stages);
                const newNodes: Node[] = positions.map((p) => ({
                    id: p.stage.id,
                    type: "stage",
                    position: { x: p.x, y: p.y },
                    data: { stage: p.stage },
                    width: p.width,
                    height: p.height,
                }));
                const newEdges: Edge[] = flow.stages.flatMap((stage) =>
                    stage.inputs.map((inputId) => ({
                        id: `${inputId}->${stage.id}`,
                        source: inputId,
                        target: stage.id,
                        type: "smoothstep",
                        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                        style: { strokeWidth: 1.5 },
                    })),
                );

                const rect = flowContainerRef.current?.getBoundingClientRect();
                setViewport(computeFitViewport(newNodes, rect?.width ?? 800, rect?.height ?? 600));
                setNodes(newNodes);
                setEdges(newEdges);
                setError(null);
                setGeneration((g) => g + 1);
            } catch (err) {
                if (generationRef.current !== generationId) return;
                setError(err instanceof Error ? toFriendlyParseError(err.message) : "Failed to parse SQL.");
            }
        },
        [dialect, setNodes, setEdges],
    );

    useEffect(() => {
        const handle = setTimeout(() => generate(query), 700);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, dialect]);

    const handleDownload = useCallback(async () => {
        const { toPng } = await import("html-to-image");
        const container = document.querySelector(".sql-visu-flow .react-flow") as HTMLElement | null;
        if (!container) return;
        try {
            const dataUrl = await toPng(container, {
                backgroundColor: resolvedTheme === "dark" ? "#09090b" : "#fafafa",
                filter: (node) => !node?.classList?.contains("react-flow__controls"),
                // Monaco's CSS loads from a CDN without CORS headers; reading its cssRules to
                // embed @font-face declarations throws a SecurityError that otherwise aborts
                // the whole export. The diagram doesn't need any custom fonts embedded anyway.
                skipFonts: true,
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "query-flow.png";
            a.click();
        } catch (err) {
            console.error(err);
            toast.error("Couldn't export the diagram as PNG.");
        }
    }, [resolvedTheme]);

    return (
        <ResizablePanelGroup key={isMobile ? "mobile" : "desktop"} direction={isMobile ? "vertical" : "horizontal"} className="flex-1 min-h-0 min-w-0">
            <ResizablePanel defaultSize={isMobile ? 45 : 38} minSize={20} className="min-h-0 min-w-0">
                <div className={`flex flex-col h-full bg-muted/5 min-h-0 min-w-0 ${isMobile ? "border-b" : "border-r"}`}>
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Query
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold uppercase gap-1.5"
                            onClick={() => onQueryChange(SAMPLE_QUERY)}
                        >
                            <Wand2 className="size-3" /> Load Sample
                        </Button>
                    </div>
                    <div className="flex-1 relative overflow-hidden min-h-0 min-w-0">
                        <Editor
                            height="100%"
                            language="sql"
                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                            value={query}
                            onChange={(val) => onQueryChange(val ?? "")}
                            onMount={(editor, monaco) => {
                                editor.addCommand(monaco.KeyCode.Space, () => {
                                    const selections = editor.getSelections();
                                    if (!selections?.length) return;
                                    editor.executeEdits("insert-space", selections.map((range) => ({
                                        range,
                                        text: " ",
                                        forceMoveMarkers: true,
                                    })));
                                });
                            }}
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on",
                                padding: { top: 10, bottom: 10 },
                                quickSuggestions: false,
                                suggestOnTriggerCharacters: false,
                                wordBasedSuggestions: "off",
                                acceptSuggestionOnCommitCharacter: false,
                            }}
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive" className="m-3 mt-0">
                            <AlertTriangle className="size-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={isMobile ? 55 : 62} minSize={30} className="min-h-0 min-w-0">
                <div className="sql-visu-flow h-full flex flex-col bg-background min-h-0 min-w-0">
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/5 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Query Flow
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold uppercase gap-1.5"
                            onClick={handleDownload}
                            disabled={nodes.length === 0}
                        >
                            <Download className="size-3" /> PNG
                        </Button>
                    </div>
                    <div className="flex-1 relative h-full w-full min-h-0 overflow-hidden" ref={flowContainerRef}>
                        <ReactFlow
                            key={generation}
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            nodeTypes={nodeTypes}
                            defaultViewport={viewport}
                            proOptions={{ hideAttribution: true }}
                            minZoom={0.1}
                            className="bg-transparent"
                        >
                            <Background color="#888" gap={20} size={1} className="opacity-20" />
                            <Controls />
                        </ReactFlow>
                        {nodes.length === 0 && !error && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-sm text-muted-foreground">
                                    Paste a SELECT query to see its execution pipeline.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
