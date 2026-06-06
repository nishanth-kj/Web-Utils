"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    Connection,
    Edge,

    Node,
    useNodesState,
    useEdgesState,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    useViewport,
    XYPosition
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sun, Moon, Link2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toPng } from 'html-to-image';
import { Button } from "../ui/button";
import { Toolbar } from './toolbar';
import { StylePanel } from './style-panel';
import { ZoomControls } from './zoom-controls';
import { ActionMenu } from './action-menu';
import { RoughNode } from './nodes/rough-node';
import { RoughEdge } from './nodes/rough-edge';
import { TextNode } from './nodes/text-node';
import { ImageNode } from './nodes/image-node';
import { ElementType } from './types';

function FlowContent() {
    const { theme, setTheme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [tool, setTool] = useState<ElementType>('selection');
    const [color, setColor] = useState('#1e1e1e');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
    const [roughness, setRoughness] = useState(1);
    const [opacity, setOpacity] = useState(100);
    const [isLocked, setIsLocked] = useState(false);
    const [mounted, setMounted] = useState(false);

    const nodeTypes = useMemo(() => ({
        rough: RoughNode,
        text: TextNode,
        image: ImageNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        rough: RoughEdge,
    }), []);

    useEffect(() => {
        setMounted(true);
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        }
    }, []);

    const { screenToFlowPosition, zoomIn, zoomOut, setViewport } = useReactFlow();
    const { zoom } = useViewport();
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [startPos, setStartPos] = useState<XYPosition | null>(null);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'rough' }, eds)), [setEdges]);

    const onPaneMouseDown = useCallback((e: React.MouseEvent) => {
        if (tool === 'selection' || tool === 'hand' || tool === 'eraser' || tool === 'connection') return;

        // Only start if clicking on the pane background, not on an existing node/edge or panel
        const target = e.target as HTMLElement;
        if (
            target.closest('.react-flow__node') ||
            target.closest('.react-flow__edge') ||
            target.closest('.react-flow__handle') ||
            target.closest('.react-flow__panel') ||
            target.closest('.react-flow__resize-control')
        ) {
            return;
        }

        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        setStartPos(position);
    }, [tool, screenToFlowPosition]);

    const onPaneMouseMove = useCallback((e: React.MouseEvent) => {
        if (!startPos) return;

        const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

        // If we haven't created the node yet, check if we've dragged far enough
        if (draggingNodeId) {
            const dx = Math.abs(currentPos.x - startPos.x);
            const dy = Math.abs(currentPos.y - startPos.y);
            const x = Math.min(startPos.x, currentPos.x);
            const y = Math.min(startPos.y, currentPos.y);
            const width = Math.max(20, dx);
            const height = Math.max(20, dy);

            setNodes((nds) =>
                nds.map((n) =>
                    n.id === draggingNodeId
                        ? {
                            ...n,
                            position: { x, y },
                            width,
                            height,
                            style: { ...n.style, width, height }
                        }
                        : n
                )
            );
        } else {
            const dx = Math.abs(currentPos.x - startPos.x);
            const dy = Math.abs(currentPos.y - startPos.y);
            if (dx < 2 && dy < 2) return;

            const id = `node-${Date.now()}`;
            const x = Math.min(startPos.x, currentPos.x);
            const y = Math.min(startPos.y, currentPos.y);

            let nodeType = 'rough';
            if (tool === 'text') nodeType = 'text';
            if (tool === 'image') nodeType = 'image';

            const newNode: Node = {
                id,
                type: nodeType,
                position: { x, y },
                data: {
                    type: tool,
                    tool,
                    color,
                    backgroundColor,
                    strokeWidth,
                    strokeStyle,
                    roughness,
                    opacity,
                    text: tool === 'text' ? 'Type here...' : '',
                    onTextChange: (newText: string) => {
                        setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, text: newText } } : n));
                    },
                    onImageChange: (url: string) => {
                        setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, url } } : n));
                    }
                },
                width: Math.max(20, dx),
                height: Math.max(20, dy),
                selected: true,
            };

            setNodes((nds) => nds.concat(newNode));
            setDraggingNodeId(id);
        }
    }, [startPos, draggingNodeId, tool, color, backgroundColor, strokeWidth, strokeStyle, roughness, opacity, setNodes, screenToFlowPosition]);

    const onPaneMouseUp = useCallback(() => {
        if (!draggingNodeId) return;

        setDraggingNodeId(null);
        setStartPos(null);
    }, [draggingNodeId]);

    const updateSelectedNodes = useCallback((updates: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.selected) {
                    return { ...node, data: { ...node.data, ...updates } };
                }
                return node;
            })
        );
    }, [setNodes]);

    const duplicateSelected = useCallback(() => {
        const selectedNodes = nodes.filter(n => n.selected);
        const newNodes = selectedNodes.map(node => ({
            ...node,
            id: `${node.id}-copy-${Date.now()}`,
            position: { x: node.position.x + 20, y: node.position.y + 20 },
            selected: false
        }));
        setNodes(nds => nds.concat(newNodes));
    }, [nodes, setNodes]);

    const deleteSelected = useCallback(() => {
        setNodes(nds => nds.filter(n => !n.selected));
        setEdges(eds => eds.filter(e => !e.selected));
    }, [setNodes, setEdges]);

    const flowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const flowContainer = flowRef.current;
        if (!flowContainer) return;
        const handleMouseDown = (e: MouseEvent) => onPaneMouseDown(e as any);
        const handleMouseMove = (e: MouseEvent) => onPaneMouseMove(e as any);
        const handleMouseUp = () => onPaneMouseUp();

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't delete if user is typing in an input or contentEditable
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelected();
            }
        };

        flowContainer.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            flowContainer.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onPaneMouseMove, onPaneMouseUp, deleteSelected]);

    const handleDownload = useCallback(() => {
        const container = document.querySelector('.react-flow') as HTMLElement;
        if (!container) return;

        toPng(container, {
            backgroundColor: theme === 'dark' ? '#09090b' : '#fafafa',
            filter: (node) => {
                if (node?.classList?.contains('react-flow__panel') || node?.classList?.contains('react-flow__controls')) {
                    return false;
                }
                return true;
            }
        }).then((dataUrl) => {
            const a = document.createElement('a');
            a.setAttribute('download', 'web-utils-draw.png');
            a.setAttribute('href', dataUrl);
            a.click();
        }).catch((err) => {
            console.error('Failed to export image', err);
        });
    }, [theme]);

    useEffect(() => {
        setNodes((nds) => nds.map(node => ({
            ...node,
            data: { ...node.data, tool }
        })));
    }, [tool, setNodes]);

    if (!mounted) return null;

    const cursorClass = tool === 'selection' ? 'cursor-default' : tool === 'hand' ? 'cursor-grab' : 'cursor-crosshair';

    return (
        <div
            ref={flowRef}
            className={`relative w-full h-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] ${cursorClass}`}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                className={`bg-transparent ${cursorClass}`}
                defaultEdgeOptions={{ type: 'rough' }}
                proOptions={{ hideAttribution: true }}
                nodesConnectable={true}
                nodesDraggable={tool === 'selection'}
                elementsSelectable={true}
                panOnDrag={tool === 'hand'}
                selectionOnDrag={tool === 'selection'}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={false}
            >
                <Background color="#ccc" gap={20} size={1} />

                <Panel position="top-center" className="z-50 m-4">
                    <Toolbar tool={tool} setTool={setTool} isLocked={isLocked} setIsLocked={setIsLocked} />
                </Panel>

                <Panel position="top-right" className="z-50 flex items-center gap-2 m-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border-zinc-200 dark:border-zinc-800 shadow-sm rounded-lg"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <ActionMenu handleDownload={handleDownload} />
                </Panel>

                <Panel position="top-right" className="mt-20 mr-4 z-50 pointer-events-auto">
                    <StylePanel
                        elements={nodes}
                        selectedElementIds={nodes.filter(n => n.selected).map(n => n.id)}
                        setSelectedElementIds={(ids) => {
                            setNodes((nds) => nds.map((n) => ({ ...n, selected: ids.includes(n.id) })));
                        }}
                        color={color}
                        setColor={(c) => { setColor(c); updateSelectedNodes({ color: c }); }}
                        backgroundColor={backgroundColor}
                        setBackgroundColor={(c) => { setBackgroundColor(c); updateSelectedNodes({ backgroundColor: c }); }}
                        strokeWidth={strokeWidth}
                        setStrokeWidth={(w) => { setStrokeWidth(w); updateSelectedNodes({ strokeWidth: w }); }}
                        strokeStyle={strokeStyle}
                        setStrokeStyle={(s) => { setStrokeStyle(s); updateSelectedNodes({ strokeStyle: s }); }}
                        roughness={roughness}
                        setRoughness={(r) => { setRoughness(r); updateSelectedNodes({ roughness: r }); }}
                        opacity={opacity}
                        setOpacity={(o) => { setOpacity(o); updateSelectedNodes({ opacity: o }); }}
                        updateElement={(id, updates) => {
                            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
                        }}
                        duplicateSelected={duplicateSelected}
                        deleteSelected={deleteSelected}
                        bringToFront={() => { }}
                        sendToBack={() => { }}
                        moveUp={() => { }}
                        moveDown={() => { }}
                        handleClear={() => { setNodes([]); setEdges([]); }}
                    />
                </Panel>

                <Panel position="bottom-left" className="m-6 z-50">
                    <ZoomControls
                        scale={zoom}
                        zoomIn={() => zoomIn()}
                        zoomOut={() => zoomOut()}
                        resetZoom={() => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 })}
                        handleUndo={() => { }}
                        handleRedo={() => { }}
                        canUndo={false}
                        canRedo={false}
                    />
                </Panel>
            </ReactFlow>
        </div>
    );
}

export function DrawPage() {
    return (
        <ReactFlowProvider>
            <FlowContent />
        </ReactFlowProvider>
    );
}
