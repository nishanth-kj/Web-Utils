"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTheme } from "next-themes";
import { AlertTriangle, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonacoEditor as Editor } from "@/components/shared/lazy-monaco";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { TableNode } from "./nodes/table-node";
import { parseDdlToTables } from "@/lib/sql-visu/ddl-parser";
import { layoutErDiagram } from "@/lib/sql-visu/er-layout";
import { computeFitViewport } from "@/lib/sql-visu/fit-view";
import { toFriendlyParseError } from "@/lib/sql-visu/friendly-error";
import type { ParsedTable, SqlDialect } from "@/lib/sql-visu/types";

export const SAMPLE_DDL = `CREATE TABLE authors (
  id INT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE
);

CREATE TABLE books (
  id INT PRIMARY KEY,
  author_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  published_year INT,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE TABLE reviews (
  id INT PRIMARY KEY,
  book_id INT NOT NULL,
  rating INT NOT NULL,
  comment VARCHAR(500),
  FOREIGN KEY (book_id) REFERENCES books(id)
);`;

const nodeTypes = { table: TableNode };
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

interface ErDiagramViewProps {
    dialect: SqlDialect;
    ddl: string;
    onDdlChange: (value: string) => void;
}

export function ErDiagramView({ dialect, ddl, onDdlChange }: ErDiagramViewProps) {
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const [nodes, setNodes, onNodesChange] = useNodesState<{ table: ParsedTable }>([]);
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
                const tables = await parseDdlToTables(source, dialect);
                if (generationRef.current !== generationId) return; // a newer keystroke superseded this parse

                const positions = layoutErDiagram(tables);
                const columnsByTable = new Map(tables.map((t) => [t.name, new Set(t.columns.map((c) => c.name))]));

                const newNodes: Node[] = positions.map((p) => ({
                    id: p.table.name,
                    type: "table",
                    position: { x: p.x, y: p.y },
                    data: { table: p.table },
                    width: p.width,
                    height: p.height,
                }));

                const newEdges: Edge[] = [];
                for (const table of tables) {
                    for (const fk of table.foreignKeys) {
                        if (!columnsByTable.has(fk.refTable)) continue;
                        fk.columns.forEach((col, i) => {
                            const refCol = fk.refColumns[i] ?? fk.refColumns[0];
                            if (!refCol || !columnsByTable.get(fk.refTable)?.has(refCol)) return;
                            newEdges.push({
                                id: `${table.name}.${col}->${fk.refTable}.${refCol}-${i}`,
                                source: table.name,
                                sourceHandle: col,
                                target: fk.refTable,
                                targetHandle: refCol,
                                type: "smoothstep",
                                markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                                style: { strokeWidth: 1.5 },
                            });
                        });
                    }
                }

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
        const handle = setTimeout(() => generate(ddl), 700);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ddl, dialect]);

    const handleDownload = useCallback(async () => {
        const { toPng } = await import("html-to-image");
        const container = document.querySelector(".sql-visu-er .react-flow") as HTMLElement | null;
        if (!container) return;
        const dataUrl = await toPng(container, {
            backgroundColor: resolvedTheme === "dark" ? "#09090b" : "#fafafa",
            filter: (node) => !node?.classList?.contains("react-flow__minimap") && !node?.classList?.contains("react-flow__controls"),
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "er-diagram.png";
        a.click();
    }, [resolvedTheme]);

    return (
        <ResizablePanelGroup key={isMobile ? "mobile" : "desktop"} direction={isMobile ? "vertical" : "horizontal"} className="flex-1 min-h-0 min-w-0">
            <ResizablePanel defaultSize={isMobile ? 45 : 38} minSize={20} className="min-h-0 min-w-0">
                <div className={`flex flex-col h-full bg-muted/5 min-h-0 min-w-0 ${isMobile ? "border-b" : "border-r"}`}>
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Schema (DDL)
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold uppercase gap-1.5"
                            onClick={() => onDdlChange(SAMPLE_DDL)}
                        >
                            <Wand2 className="size-3" /> Load Sample
                        </Button>
                    </div>
                    <div className="flex-1 relative overflow-hidden min-h-0 min-w-0">
                        <Editor
                            height="100%"
                            language="sql"
                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                            value={ddl}
                            onChange={(val) => onDdlChange(val ?? "")}
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on",
                                padding: { top: 10, bottom: 10 },
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
                <div className="sql-visu-er h-full flex flex-col bg-background min-h-0 min-w-0">
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/5 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            ER Diagram
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
                            <MiniMap pannable zoomable className="!bg-card" />
                        </ReactFlow>
                        {nodes.length === 0 && !error && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-sm text-muted-foreground">
                                    Paste CREATE TABLE statements to see the diagram.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
