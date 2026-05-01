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

const nodeTypes = {
    rough: RoughNode,
    text: TextNode,
    image: ImageNode,
};

const edgeTypes = {
    rough: RoughEdge,
};

function FlowContent() {
    const { theme, setTheme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [tool, setTool] = useState<ElementType>('selection');
    const [color, setColor] = useState('#1e1e1e');
    const [backgroundColor, setBackgroundColor] = useState('transparent');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
    const [roughness, setRoughness] = useState(1);
    const [opacity, setOpacity] = useState(100);
    const [isLocked, setIsLocked] = useState(false);
    const [mounted, setMounted] = useState(false);

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
        if (tool === 'selection' || tool === 'hand' || tool === 'eraser') return;
        
        // Only start if clicking on the pane background, not on an existing node/edge or panel
        const target = e.target as HTMLElement;
        if (
            target.closest('.react-flow__node') || 
            target.closest('.react-flow__edge') || 
            target.closest('.react-flow__handle') ||
            target.closest('.react-flow__panel')
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
        if (!draggingNodeId) {
            const dx = Math.abs(currentPos.x - startPos.x);
            const dy = Math.abs(currentPos.y - startPos.y);
            if (dx < 2 && dy < 2) return;

            // Create the node now
            const id = `node_${Date.now()}`;
            let nodeType = 'rough';
            if (tool === 'text') nodeType = 'text';
            if (tool === 'image') nodeType = 'image';

            const newNode: Node = {
                id,
                type: nodeType,
                position: {
                    x: Math.min(startPos.x, currentPos.x),
                    y: Math.min(startPos.y, currentPos.y)
                },
                data: { 
                    type: tool,
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
            };

            setNodes((nds) => nds.concat(newNode));
            setDraggingNodeId(id);
            return;
        }

        // Update existing dragging node
        const width = Math.max(20, Math.abs(currentPos.x - startPos.x));
        const height = Math.max(20, Math.abs(currentPos.y - startPos.y));
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);

        setNodes((nds) =>
            nds.map((n) =>
                n.id === draggingNodeId
                    ? { ...n, position: { x, y }, width, height, style: { ...n.style, width, height } }
                    : n
            )
        );
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

        flowContainer.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            flowContainer.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onPaneMouseDown, onPaneMouseMove, onPaneMouseUp]);

    if (!mounted) return null;

    const cursorClass = tool === 'selection' ? 'cursor-default' : tool === 'hand' ? 'cursor-grab' : 'cursor-crosshair';

    return (
        <div 
            ref={flowRef}
            className={`relative w-full h-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] ${cursorClass}`}
        >
            <style jsx global>{`
                .react-flow__pane {
                    cursor: inherit !important;
                }
                .react-flow__grab {
                    cursor: inherit !important;
                }
                ${tool === 'hand' ? '' : `
                .react-flow__pane.grabbing {
                    cursor: crosshair !important;
                }
                `}
                
                /* Hide handles by default unless in connection mode */
                .react-flow__handle {
                    opacity: ${tool === 'connection' ? '1' : '0'} !important;
                    pointer-events: ${tool === 'connection' ? 'all' : 'none'} !important;
                    transition: opacity 0.2s ease-in-out;
                }
            `}</style>
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
                elementsSelectable={tool === 'selection'}
                panOnDrag={tool === 'hand'}
                selectionOnDrag={tool === 'selection'}
                zoomOnScroll={tool === 'selection' || tool === 'hand'}
                zoomOnPinch={tool === 'selection' || tool === 'hand'}
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
                    <ActionMenu handleDownload={() => {}} />
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
                        bringToFront={() => {}}
                        sendToBack={() => {}}
                        moveUp={() => {}}
                        moveDown={() => {}}
                        handleClear={() => { setNodes([]); setEdges([]); }}
                    />
                </Panel>

                <Panel position="bottom-left" className="m-6 z-50">
                    <ZoomControls 
                        scale={zoom}
                        zoomIn={() => zoomIn()}
                        zoomOut={() => zoomOut()}
                        resetZoom={() => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 })}
                        handleUndo={() => {}}
                        handleRedo={() => {}}
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
