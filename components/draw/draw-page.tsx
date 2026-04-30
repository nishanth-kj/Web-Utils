"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import Script from 'next/script';

import { Element, ElementType, RoughCanvas } from './types';
import { Toolbar } from './toolbar';
import { StylePanel } from './style-panel';
import { ZoomControls } from './zoom-controls';
import { ActionMenu } from './action-menu';

// Type-safe access to global roughjs
interface RoughWindow extends Window {
    rough: {
        canvas: (canvas: HTMLCanvasElement) => RoughCanvas;
    }
}

// Define drawElement outside to ensure it's not re-created and is hoisted
function drawElement(rc: RoughCanvas, ctx: CanvasRenderingContext2D, element: Element) {
    const generator = rc.generator;
    const options = {
        stroke: element.color,
        strokeWidth: element.strokeWidth,
        roughness: 1.2,
        bowing: 1.5,
        seed: element.id + 1,
    };

    switch (element.type) {
        case 'line': rc.draw(generator.line(element.x1, element.y1, element.x2, element.y2, options)); break;
        case 'rectangle': rc.draw(generator.rectangle(element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1, options)); break;
        case 'diamond': {
            const midX = (element.x1 + element.x2) / 2;
            const midY = (element.y1 + element.y2) / 2;
            rc.draw(generator.polygon([[midX, element.y1], [element.x2, midY], [midX, element.y2], [element.x1, midY]], options));
            break;
        }
        case 'circle': {
            const width = element.x2 - element.x1;
            const height = element.y2 - element.y1;
            rc.draw(generator.ellipse(element.x1 + width / 2, element.y1 + height / 2, width, height, options));
            break;
        }
        case 'arrow': {
            const headlen = 15;
            const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1);
            rc.draw(generator.line(element.x1, element.y1, element.x2, element.y2, options));
            rc.draw(generator.line(element.x2, element.y2, element.x2 - headlen * Math.cos(angle - Math.PI / 6), element.y2 - headlen * Math.sin(angle - Math.PI / 6), options));
            rc.draw(generator.line(element.x2, element.y2, element.x2 - headlen * Math.cos(angle + Math.PI / 6), element.y2 - headlen * Math.sin(angle + Math.PI / 6), options));
            break;
        }
        case 'freehand':
            if (element.points && element.points.length > 1) {
                const stroke = element.points.map(p => [p.x, p.y] as [number, number]);
                rc.draw(generator.curve(stroke, options));
            }
            break;
        case 'text':
            ctx.font = `${32 * element.strokeWidth}px 'Outfit', sans-serif`;
            ctx.fillStyle = element.color;
            ctx.textBaseline = 'top';
            const lines = (element.text || '').split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, element.x1, element.y1 + i * (38 * element.strokeWidth));
            });
            break;
    }
}

export function DrawPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<Element[]>([]);
    const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'panning' | 'selecting'>('none');
    const [tool, setTool] = useState<ElementType>('freehand');
    const [color, setColor] = useState('#1e1e1e');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [roughCanvas, setRoughCanvas] = useState<RoughCanvas | null>(null);
    const [history, setHistory] = useState<Element[][]>([]);
    const [redoStack, setRedoStack] = useState<Element[][]>([]);
    const [selectedElementIds, setSelectedElementIds] = useState<number[]>([]);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
    const [selectionBox, setSelectionBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [editingElement, setEditingElement] = useState<Element | null>(null);

    const getMousePos = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - offset.x) / scale,
            y: (e.clientY - rect.top - offset.y) / scale
        };
    }, [offset, scale]);

    const onScriptLoad = () => {
        if (typeof window !== 'undefined') {
            const roughWindow = window as unknown as RoughWindow;
            if (roughWindow.rough) {
                const canvas = canvasRef.current;
                if (canvas) setRoughCanvas(roughWindow.rough.canvas(canvas));
            }
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const roughWindow = window as unknown as RoughWindow;
            if (roughWindow.rough && canvasRef.current && !roughCanvas) {
                setRoughCanvas(roughWindow.rough.canvas(canvasRef.current));
            }
        }
    }, [roughCanvas]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !roughCanvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        sortedElements.forEach((element) => {
            drawElement(roughCanvas, ctx, element);
            
            if (selectedElementIds.includes(element.id)) {
                let minX = Math.min(element.x1, element.x2);
                let maxX = Math.max(element.x1, element.x2);
                let minY = Math.min(element.y1, element.y2);
                let maxY = Math.max(element.y1, element.y2);

                if (element.type === 'freehand' && element.points && element.points.length > 0) {
                    minX = Math.min(...element.points.map(p => p.x));
                    maxX = Math.max(...element.points.map(p => p.x));
                    minY = Math.min(...element.points.map(p => p.y));
                    maxY = Math.max(...element.points.map(p => p.y));
                }
                
                ctx.strokeStyle = '#3b82f6';
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 1;
                ctx.strokeRect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
                ctx.setLineDash([]);

                // Draw handles
                ctx.fillStyle = 'white';
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1.5;
                const handleSize = 8 / scale;
                
                [
                    [minX, minY], [maxX, minY], [minX, maxY], [maxX, maxY],
                    [(minX + maxX) / 2, minY], [(minX + maxX) / 2, maxY],
                    [minX, (minY + maxY) / 2], [maxX, (minY + maxY) / 2]
                ].forEach(([x, y]) => {
                    ctx.beginPath();
                    ctx.rect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
                    ctx.fill();
                    ctx.stroke();
                });
            }
        });

        if (selectionBox) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1 / scale;
            ctx.strokeRect(
                selectionBox.x1, 
                selectionBox.y1, 
                selectionBox.x2 - selectionBox.x1, 
                selectionBox.y2 - selectionBox.y1
            );
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.fillRect(
                selectionBox.x1, 
                selectionBox.y1, 
                selectionBox.x2 - selectionBox.x1, 
                selectionBox.y2 - selectionBox.y1
            );
        }

        ctx.restore();
    }, [elements, roughCanvas, selectedElementIds, selectionBox, offset, scale]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElementIds.length > 0 && !editingElement) {
                    setHistory(prev => [...prev, elements]);
                    setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
                    setSelectedElementIds([]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementIds, elements, editingElement]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isLocked) return;
        const { x, y } = getMousePos(e);

        if (tool === 'hand') {
            setAction('panning');
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (tool === 'selection') {
            // Check if clicking on an element
            const clickedElement = [...elements].reverse().find(el => {
                const minX = Math.min(el.x1, el.x2) - 5;
                const maxX = Math.max(el.x1, el.x2) + 5;
                const minY = Math.min(el.y1, el.y2) - 5;
                const maxY = Math.max(el.y1, el.y2) + 5;
                return x >= minX && x <= maxX && y >= minY && y <= maxY;
            });

            if (clickedElement) {
                if (e.shiftKey) {
                    setSelectedElementIds(prev => 
                        prev.includes(clickedElement.id) 
                            ? prev.filter(id => id !== clickedElement.id)
                            : [...prev, clickedElement.id]
                    );
                } else if (!selectedElementIds.includes(clickedElement.id)) {
                    setSelectedElementIds([clickedElement.id]);
                }
                setAction('moving');
                setStartPanPos({ x: x, y: y });
            } else {
                setSelectedElementIds([]);
                setAction('selecting');
                setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
            }
            return;
        }

        setAction('drawing');
        const id = Date.now();
        const newElement: Element = {
            id,
            type: tool,
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            color,
            strokeWidth,
            zIndex: elements.length,
            points: tool === 'freehand' ? [{ x, y }] : undefined,
            text: tool === 'text' ? '' : undefined
        };
        setElements(prev => [...prev, newElement]);
        setHistory(prev => [...prev, elements]);
        if (tool === 'text') {
            setEditingElement(newElement);
            setAction('none');
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);

        if (action === 'panning') {
            const dx = e.clientX - startPanPos.x;
            const dy = e.clientY - startPanPos.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (action === 'drawing') {
            const index = elements.length - 1;
            const updatedElements = [...elements];
            const element = updatedElements[index];
            element.x2 = x;
            element.y2 = y;
            if (element.type === 'freehand' && element.points) {
                element.points.push({ x, y });
            }
            setElements(updatedElements);
        } else if (action === 'moving') {
            const dx = x - startPanPos.x;
            const dy = y - startPanPos.y;
            setElements(prev => prev.map(el => {
                if (selectedElementIds.includes(el.id)) {
                    const newEl = { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
                    if (newEl.type === 'freehand' && newEl.points) {
                        newEl.points = newEl.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                    }
                    return newEl;
                }
                return el;
            }));
            setStartPanPos({ x, y });
        } else if (action === 'selecting' && selectionBox) {
            setSelectionBox({ ...selectionBox, x2: x, y2: y });
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);
        const clickedElement = [...elements].reverse().find(el => {
            const minX = Math.min(el.x1, el.x2) - 5;
            const maxX = Math.max(el.x1, el.x2) + 5;
            const minY = Math.min(el.y1, el.y2) - 5;
            const maxY = Math.max(el.y1, el.y2) + 5;
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        });

        if (clickedElement && clickedElement.type === 'text') {
            setEditingElement(clickedElement);
        } else if (!clickedElement) {
            // Create new text element
            const id = Date.now();
            const newElement: Element = {
                id,
                type: 'text',
                x1: x,
                y1: y,
                x2: x,
                y2: y,
                color,
                strokeWidth,
                zIndex: elements.length,
                text: ''
            };
            setElements(prev => [...prev, newElement]);
            setEditingElement(newElement);
        }
    };

    const deleteSelected = useCallback(() => {
        if (selectedElementIds.length > 0) {
            setHistory(prev => [...prev, elements]);
            setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
            setSelectedElementIds([]);
        }
    }, [selectedElementIds, elements]);

    const handleMouseUp = () => {
        if (action === 'selecting' && selectionBox) {
            const minX = Math.min(selectionBox.x1, selectionBox.x2);
            const maxX = Math.max(selectionBox.x1, selectionBox.x2);
            const minY = Math.min(selectionBox.y1, selectionBox.y2);
            const maxY = Math.max(selectionBox.y1, selectionBox.y2);

            const newlySelected = elements.filter(el => {
                const elMinX = Math.min(el.x1, el.x2);
                const elMaxX = Math.max(el.x1, el.x2);
                const elMinY = Math.min(el.y1, el.y2);
                const elMaxY = Math.max(el.y1, el.y2);
                return elMinX >= minX && elMaxX <= maxX && elMinY >= minY && elMaxY <= maxY;
            });
            setSelectedElementIds(newlySelected.map(el => el.id));
        }
        setAction('none');
        setSelectionBox(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.shiftKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.max(0.1, Math.min(10, prev * delta)));
        } else {
            setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        }
    };

    const handleUndo = () => { if (history.length) { setRedoStack(p => [...p, elements]); setElements(history[history.length - 1]); setHistory(h => h.slice(0, -1)); } };
    const handleRedo = () => { if (redoStack.length) { setHistory(h => [...h, elements]); setElements(redoStack[redoStack.length - 1]); setRedoStack(r => r.slice(0, -1)); } };
    const handleDownload = () => { const canvas = canvasRef.current; if (canvas) { const a = document.createElement('a'); a.download = 'sketch.png'; a.href = canvas.toDataURL(); a.click(); } };
    
    const updateElement = (id: number, updates: Partial<Element>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const bringToFront = () => { 
        const maxZ = Math.max(...elements.map(e => e.zIndex), 0); 
        setElements(prev => prev.map(e => selectedElementIds.includes(e.id) ? { ...e, zIndex: maxZ + 1 } : e)); 
    };
    
    const sendToBack = () => { 
        const minZ = Math.min(...elements.map(e => e.zIndex), 0); 
        setElements(prev => prev.map(e => selectedElementIds.includes(e.id) ? { ...e, zIndex: minZ - 1 } : e)); 
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
            <Script 
                src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js" 
                onLoad={onScriptLoad}
            />
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
                <Toolbar tool={tool} setTool={setTool} isLocked={isLocked} setIsLocked={setIsLocked} />
            </div>

            <div className="absolute top-6 right-6 z-50">
                <ActionMenu 
                    handleDownload={handleDownload} 
                />
            </div>

            <div className="absolute bottom-6 left-6 z-50">
                <ZoomControls 
                    scale={scale} 
                    zoomIn={() => setScale(s => Math.min(10, s * 1.1))} 
                    zoomOut={() => setScale(s => Math.max(0.1, s * 0.9))} 
                    resetZoom={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                    canUndo={history.length > 0}
                    canRedo={redoStack.length > 0}
                />
            </div>

            {selectedElementIds.length > 0 && (
                <div className="absolute top-24 right-6 z-50">
                    <StylePanel 
                        elements={elements}
                        selectedElementIds={selectedElementIds}
                        setSelectedElementIds={setSelectedElementIds}
                        color={color} 
                        setColor={(c) => {
                            setColor(c);
                            selectedElementIds.forEach(id => updateElement(id, { color: c }));
                        }} 
                        strokeWidth={strokeWidth} 
                        setStrokeWidth={(w) => {
                            setStrokeWidth(w);
                            selectedElementIds.forEach(id => updateElement(id, { strokeWidth: w }));
                        }}
                        handleClear={() => { setElements([]); setHistory([]); setRedoStack([]); }}
                        updateElement={updateElement}
                        deleteSelected={deleteSelected}
                        bringToFront={bringToFront}
                        sendToBack={sendToBack}
                    />
                </div>
            )}

            <div className="w-full h-full cursor-crosshair overflow-hidden">
                <canvas 
                    ref={canvasRef} 
                    width={typeof window !== 'undefined' ? window.innerWidth : 1920}
                    height={typeof window !== 'undefined' ? window.innerHeight : 1080}
                    onMouseDown={handleMouseDown} 
                    onMouseMove={handleMouseMove} 
                    onMouseUp={handleMouseUp} 
                    onWheel={handleWheel}
                    onDoubleClick={handleDoubleClick}
                    className={`absolute inset-0 w-full h-full touch-none ${tool === 'hand' || action === 'panning' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`} 
                />

                {editingElement && (() => {
                    const currentEl = elements.find(el => el.id === editingElement.id);
                    if (!currentEl) return null;
                    return (
                        <textarea
                            autoFocus
                            className="absolute z-[100] bg-white/90 dark:bg-zinc-800/90 border-2 border-primary/40 rounded-md shadow-2xl p-2 m-0 resize-none overflow-hidden whitespace-pre-wrap font-sans backdrop-blur-md transition-all pointer-events-auto"
                            style={{
                                left: currentEl.x1 * scale + offset.x - 8,
                                top: currentEl.y1 * scale + offset.y - 8,
                                minWidth: '200px',
                                width: `${Math.max(200, (currentEl.text?.length || 0) * 18 * scale)}px`,
                                height: 'auto',
                                minHeight: '60px',
                                fontSize: `${32 * currentEl.strokeWidth * scale}px`,
                                color: currentEl.color,
                            }}
                            value={currentEl.text || ''}
                            onChange={(e) => {
                                const newText = e.target.value;
                                setElements(prev => prev.map(el => 
                                    el.id === currentEl.id ? { ...el, text: newText } : el
                                ));
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onBlur={() => setEditingElement(null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    setEditingElement(null);
                                }
                            }}
                        />
                    );
                })()}
            </div>
        </div>
    );
}
