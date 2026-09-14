"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    useNodesState,
    useEdgesState,
    type Connection,
    type Node,
    type Edge,
    type Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AlertTriangle, Download, Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonacoEditor as Editor } from "@/components/shared/lazy-monaco";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { TableNode, type TableNodeData } from "./nodes/table-node";
import { FkEdge, type FkEdgeData } from "./edges/fk-edge";
import { parseDdlToTables } from "@/lib/sql-visu/ddl-parser";
import { layoutErDiagram } from "@/lib/sql-visu/er-layout";
import { computeFitViewport } from "@/lib/sql-visu/fit-view";
import { toFriendlyParseError } from "@/lib/sql-visu/friendly-error";
import { serializeTablesToDdl } from "@/lib/sql-visu/ddl-serializer";
import { withNewTable, withoutTable, withNewColumn, withoutColumn, withNewForeignKey, withoutForeignKey } from "@/lib/sql-visu/schema-edit";
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
const edgeTypes = { fk: FkEdge };
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

interface ErDiagramViewProps {
    dialect: SqlDialect;
    ddl: string;
    onDdlChange: (value: string) => void;
}

export function ErDiagramView({ dialect, ddl, onDdlChange }: ErDiagramViewProps) {
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [tables, setTables] = useState<ParsedTable[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
    const [generation, setGeneration] = useState(0);
    const generationRef = useRef(0);
    const flowContainerRef = useRef<HTMLDivElement>(null);
    const prevDialectRef = useRef(dialect);

    // Table-node callbacks need the *current* schema and a way to apply an edit, but are
    // handed to ReactFlow nodes built inside buildDiagram — which applySchemaEdit itself
    // calls. Refs break that circular dependency without making either callback unstable.
    const tablesRef = useRef<ParsedTable[]>([]);
    tablesRef.current = tables;
    const applySchemaEditRef = useRef<(next: ParsedTable[]) => void>(() => {});

    const handleAddColumn = useCallback((tableName: string) => {
        applySchemaEditRef.current(withNewColumn(tablesRef.current, tableName));
    }, []);
    const handleDropColumn = useCallback((tableName: string, columnName: string) => {
        applySchemaEditRef.current(withoutColumn(tablesRef.current, tableName, columnName));
    }, []);
    const handleDropTable = useCallback((tableName: string) => {
        applySchemaEditRef.current(withoutTable(tablesRef.current, tableName));
    }, []);
    const handleRemoveFk = useCallback((fromTable: string, fromColumn: string, toTable: string, toColumn: string) => {
        applySchemaEditRef.current(withoutForeignKey(tablesRef.current, fromTable, fromColumn, toTable, toColumn));
    }, []);

    const buildDiagram = useCallback(
        (parsedTables: ParsedTable[]) => {
            const positions = layoutErDiagram(parsedTables);
            const columnsByTable = new Map(parsedTables.map((t) => [t.name, new Set(t.columns.map((c) => c.name))]));

            const newNodes: Node<TableNodeData>[] = positions.map((p) => ({
                id: p.table.name,
                type: "table",
                position: { x: p.x, y: p.y },
                data: { table: p.table, onAddColumn: handleAddColumn, onDropColumn: handleDropColumn, onDropTable: handleDropTable },
                width: p.width,
                height: p.height,
            }));

            const newEdges: Edge<FkEdgeData>[] = [];
            for (const table of parsedTables) {
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
                            type: "fk",
                            data: { onDelete: () => handleRemoveFk(table.name, col, fk.refTable, refCol) },
                            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                            // Explicit instead of relying on the .react-flow__edge-path CSS class:
                            // html-to-image's PNG export can't reliably inline external stylesheet
                            // rules, so a class-only stroke silently renders invisible in exports.
                            style: { stroke: "#b1b1b7", strokeWidth: 1.5, fill: "none" },
                        });
                    });
                }
            }

            const rect = flowContainerRef.current?.getBoundingClientRect();
            setViewport(computeFitViewport(newNodes, rect?.width ?? 800, rect?.height ?? 600));
            setNodes(newNodes);
            setEdges(newEdges);
            setGeneration((g) => g + 1);
        },
        [setNodes, setEdges, handleAddColumn, handleDropColumn, handleDropTable, handleRemoveFk],
    );

    const generate = useCallback(
        async (source: string) => {
            const generationId = ++generationRef.current;
            if (!source.trim()) {
                setNodes([]);
                setEdges([]);
                setTables([]);
                setError(null);
                return;
            }
            try {
                const parsedTables = await parseDdlToTables(source, dialect);
                if (generationRef.current !== generationId) return; // a newer keystroke superseded this parse

                setTables(parsedTables);
                buildDiagram(parsedTables);
                setError(null);
            } catch (err) {
                if (generationRef.current !== generationId) return;
                setError(err instanceof Error ? toFriendlyParseError(err.message) : "Failed to parse SQL.");
            }
        },
        [dialect, setNodes, setEdges, buildDiagram],
    );

    const applySchemaEdit = useCallback(
        (nextTables: ParsedTable[]) => {
            const newDdl = serializeTablesToDdl(nextTables, dialect);
            onDdlChange(newDdl);
            setTables(nextTables);
            buildDiagram(nextTables);
        },
        [dialect, onDdlChange, buildDiagram],
    );
    applySchemaEditRef.current = applySchemaEdit;

    useEffect(() => {
        const handle = setTimeout(() => generate(ddl), 700);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ddl, dialect]);

    // Switching dialects keeps the same schema but re-renders the DDL text in that
    // dialect's syntax (quoting style) — the diagram itself doesn't change.
    useEffect(() => {
        if (prevDialectRef.current === dialect) return;
        prevDialectRef.current = dialect;
        if (tablesRef.current.length === 0) return;
        const regenerated = serializeTablesToDdl(tablesRef.current, dialect);
        onDdlChange(regenerated);
        generate(regenerated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialect]);

    const handleAddTable = useCallback(() => applySchemaEdit(withNewTable(tables)), [tables, applySchemaEdit]);

    // Dragging from a column's right (source) handle to another column's left (target)
    // handle creates a foreign key — source is the referencing side, matching how the
    // parsed diagram's own edges are already drawn.
    const handleConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return;
            applySchemaEdit(withNewForeignKey(tables, connection.source, connection.sourceHandle, connection.target, connection.targetHandle));
        },
        [tables, applySchemaEdit],
    );

    // Select an edge/table and hit Delete or Backspace — ReactFlow removes it from the
    // rendered diagram on its own, but that's just local view state; without this it
    // would silently reappear on the next parse since the DDL still has it.
    const handleEdgesDelete = useCallback(
        (deleted: Edge[]) => {
            let next = tables;
            for (const edge of deleted) {
                if (!edge.source || !edge.target || !edge.sourceHandle || !edge.targetHandle) continue;
                next = withoutForeignKey(next, edge.source, edge.sourceHandle, edge.target, edge.targetHandle);
            }
            applySchemaEdit(next);
        },
        [tables, applySchemaEdit],
    );

    const handleNodesDelete = useCallback(
        (deleted: Node[]) => {
            let next = tables;
            for (const node of deleted) next = withoutTable(next, node.id);
            applySchemaEdit(next);
        },
        [tables, applySchemaEdit],
    );

    const handleDownload = useCallback(async () => {
        const { toPng } = await import("html-to-image");
        const container = document.querySelector(".sql-visu-er .react-flow") as HTMLElement | null;
        if (!container) return;
        try {
            const dataUrl = await toPng(container, {
                backgroundColor: resolvedTheme === "dark" ? "#09090b" : "#fafafa",
                filter: (node) => !node?.classList?.contains("react-flow__minimap") && !node?.classList?.contains("react-flow__controls"),
                // Monaco's CSS loads from a CDN without CORS headers; reading its cssRules to
                // embed @font-face declarations throws a SecurityError that otherwise aborts
                // the whole export. The diagram doesn't need any custom fonts embedded anyway.
                skipFonts: true,
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "er-diagram.png";
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
                <div className="sql-visu-er h-full flex flex-col bg-background min-h-0 min-w-0">
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/5 shrink-0 gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
                            ER Diagram
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] font-bold uppercase gap-1.5"
                                onClick={handleAddTable}
                            >
                                <Plus className="size-3" /> Table
                            </Button>
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
                    </div>
                    <div className="flex-1 relative h-full w-full min-h-0 overflow-hidden" ref={flowContainerRef}>
                        <ReactFlow
                            key={generation}
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={handleConnect}
                            onEdgesDelete={handleEdgesDelete}
                            onNodesDelete={handleNodesDelete}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
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
