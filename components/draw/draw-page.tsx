"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import Script from 'next/script';

import { Element, ElementType } from './types';
import { Toolbar } from './toolbar';
import { StylePanel } from './style-panel';
import { ZoomControls } from './zoom-controls';
import { ActionMenu } from './action-menu';

export function DrawPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<Element[]>([]);
    const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'panning' | 'selecting'>('none');
    const [tool, setTool] = useState<ElementType>('freehand');
    const [color, setColor] = useState('#1e1e1e');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [roughCanvas, setRoughCanvas] = useState<any>(null);
    const [history, setHistory] = useState<Element[][]>([]);
    const [redoStack, setRedoStack] = useState<Element[][]>([]);
    const [selectedElementIds, setSelectedElementIds] = useState<number[]>([]);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
    const [selectionBox, setSelectionBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
    const [resizeHandle, setResizeHandle] = useState<{ id: number, type: string } | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [editingElement, setEditingElement] = useState<Element | null>(null);

    const getMousePos = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - offset.x) / scale,
            y: (e.clientY - rect.top - offset.y) / scale
        };
    };

    const onScriptLoad = () => {
        if (typeof window !== 'undefined' && (window as any).rough) {
            const canvas = canvasRef.current;
            if (canvas) setRoughCanvas((window as any).rough.canvas(canvas));
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).rough && canvasRef.current && !roughCanvas) {
            setRoughCanvas((window as any).rough.canvas(canvasRef.current));
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
                const minX = Math.min(element.x1, element.x2);
                const maxX = Math.max(element.x1, element.x2);
                const minY = Math.min(element.y1, element.y2);
                const maxY = Math.max(element.y1, element.y2);
                
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
                const handles = [
                    { x: minX, y: minY }, { x: maxX, y: minY },
                    { x: minX, y: maxY }, { x: maxX, y: maxY },
                    { x: (minX + maxX) / 2, y: minY }, { x: (minX + maxX) / 2, y: maxY },
                    { x: minX, y: (minY + maxY) / 2 }, { x: maxX, y: (minY + maxY) / 2 },
                ];
                handles.forEach(h => {
                    ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
                    ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
                });
            }
        });

        if (selectionBox) {
            ctx.strokeStyle = '#3b82f6';
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.lineWidth = 1;
            const x = Math.min(selectionBox.x1, selectionBox.x2);
            const y = Math.min(selectionBox.y1, selectionBox.y2);
            const width = Math.abs(selectionBox.x2 - selectionBox.x1);
            const height = Math.abs(selectionBox.y2 - selectionBox.y1);
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        }

        ctx.restore();
    }, [elements, roughCanvas, offset, scale, selectedElementIds, selectionBox]);

    useEffect(() => {
        const updateSize = () => {
            const canvas = canvasRef.current;
            if (canvas && canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const drawElement = (rc: any, ctx: CanvasRenderingContext2D, element: Element) => {
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
            case 'diamond':
                const midX = (element.x1 + element.x2) / 2;
                const midY = (element.y1 + element.y2) / 2;
                rc.draw(generator.polygon([[midX, element.y1], [element.x2, midY], [midX, element.y2], [element.x1, midY]], options));
                break;
            case 'circle':
                const width = element.x2 - element.x1;
                const height = element.y2 - element.y1;
                rc.draw(generator.ellipse(element.x1 + width / 2, element.y1 + height / 2, width, height, options));
                break;
            case 'arrow':
                const headlen = 15;
                const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1);
                rc.draw(generator.line(element.x1, element.y1, element.x2, element.y2, options));
                rc.draw(generator.line(element.x2, element.y2, element.x2 - headlen * Math.cos(angle - Math.PI / 6), element.y2 - headlen * Math.sin(angle - Math.PI / 6), options));
                rc.draw(generator.line(element.x2, element.y2, element.x2 - headlen * Math.cos(angle + Math.PI / 6), element.y2 - headlen * Math.sin(angle + Math.PI / 6), options));
                break;
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
    };

    const distance = (a: {x: number, y: number}, b: {x: number, y: number}) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

    const getHandleAtPosition = (x: number, y: number, elements: Element[]) => {
        for (const id of selectedElementIds) {
            const el = elements.find(e => e.id === id);
            if (!el) continue;

            const minX = Math.min(el.x1, el.x2);
            const maxX = Math.max(el.x1, el.x2);
            const minY = Math.min(el.y1, el.y2);
            const maxY = Math.max(el.y1, el.y2);

            const handles = [
                { x: minX, y: minY, type: 'nw' },
                { x: maxX, y: minY, type: 'ne' },
                { x: minX, y: maxY, type: 'sw' },
                { x: maxX, y: maxY, type: 'se' },
                { x: (minX + maxX) / 2, y: minY, type: 'n' },
                { x: (minX + maxX) / 2, y: maxY, type: 's' },
                { x: minX, y: (minY + maxY) / 2, type: 'w' },
                { x: maxX, y: (minY + maxY) / 2, type: 'e' },
            ];

            for (const h of handles) {
                if (Math.abs(x - h.x) < 8 / scale && Math.abs(y - h.y) < 8 / scale) {
                    return { id, type: h.type };
                }
            }
        }
        return null;
    };

    const getElementAtPosition = (x: number, y: number, elements: Element[]) => {
        return [...elements].sort((a, b) => a.zIndex - b.zIndex).findLast(element => {
            if (element.type === 'rectangle' || element.type === 'diamond') {
                const minX = Math.min(element.x1, element.x2);
                const maxX = Math.max(element.x1, element.x2);
                const minY = Math.min(element.y1, element.y2);
                const maxY = Math.max(element.y1, element.y2);
                return x >= minX && x <= maxX && y >= minY && y <= maxY;
            } else if (element.type === 'circle') {
                const center = { x: (element.x1 + element.x2) / 2, y: (element.y1 + element.y2) / 2 };
                const rx = Math.abs(element.x2 - element.x1) / 2;
                const ry = Math.abs(element.y2 - element.y1) / 2;
                const dx = (x - center.x) / rx;
                const dy = (y - center.y) / ry;
                return (dx * dx + dy * dy) <= 1;
            } else if (element.type === 'line' || element.type === 'arrow') {
                const a = { x: element.x1, y: element.y1 };
                const b = { x: element.x2, y: element.y2 };
                const offset = distance(a, b);
                const dist = distance(a, {x, y}) + distance(b, {x, y});
                return Math.abs(dist - offset) < 1;
            } else if (element.type === 'freehand') {
                return element.points?.some(p => distance(p, {x, y}) < 5);
            } else if (element.type === 'text') {
                const width = Math.max(50, (element.text?.length || 0) * 12 * element.strokeWidth);
                const height = 30 * element.strokeWidth;
                return x >= element.x1 && x <= element.x1 + width && y >= element.y1 && y <= element.y1 + height;
            }
            return false;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);

        if (e.button === 1 || tool === 'hand') {
            setAction('panning');
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        switch (tool) {
            case 'selection': {
                const handle = getHandleAtPosition(x, y, elements);
                if (handle) {
                    setResizeHandle(handle);
                    setAction('resizing');
                    setStartPanPos({ x: e.clientX, y: e.clientY });
                    return;
                }

                const element = getElementAtPosition(x, y, elements);
                if (element) {
                    const isAlreadySelected = selectedElementIds.includes(element.id);
                    if (!isAlreadySelected && !e.shiftKey) {
                        setSelectedElementIds([element.id]);
                    } else if (!isAlreadySelected && e.shiftKey) {
                        setSelectedElementIds(prev => [...prev, element.id]);
                    }
                    setAction('moving');
                    setStartPanPos({ x: e.clientX, y: e.clientY });
                } else {
                    setSelectedElementIds([]);
                    setAction('selecting');
                    setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
                }
                break;
            }
            case 'text': {
                const id = Date.now();
                const newEl: Element = { 
                    id, x1: x, y1: y, x2: x + 100, y2: y + 40, 
                    type: 'text', color, strokeWidth, zIndex: elements.length, text: '' 
                };
                setElements(prev => [...prev, newEl]);
                setEditingElement(newEl);
                setAction('none');
                break;
            }
            default: {
                if (!roughCanvas) return;
                setAction('drawing');
                const id = Date.now();
                const newEl: Element = { 
                    id, x1: x, y1: y, x2: x, y2: y, type: tool, color, strokeWidth, zIndex: elements.length,
                    points: tool === 'freehand' ? [{x, y}] : undefined 
                };
                setElements(prev => [...prev, newEl]);
                setHistory(prev => [...prev, elements]);
                setRedoStack([]);
                break;
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (action === 'none') return;
        const { x, y } = getMousePos(e);

        if (action === 'panning') {
            setOffset(prev => ({ x: prev.x + (e.clientX - startPanPos.x), y: prev.y + (e.clientY - startPanPos.y) }));
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (action === 'selecting' && selectionBox) {
            setSelectionBox({ ...selectionBox, x2: x, y2: y });
            return;
        }

        if (action === 'resizing' && resizeHandle) {
            setElements(prev => prev.map(e => {
                if (e.id !== resizeHandle.id) return e;
                const newEl = { ...e };
                if (resizeHandle.type.includes('e')) newEl.x2 = x;
                if (resizeHandle.type.includes('w')) newEl.x1 = x;
                if (resizeHandle.type.includes('s')) newEl.y2 = y;
                if (resizeHandle.type.includes('n')) newEl.y1 = y;
                return newEl;
            }));
            return;
        }

        if (action === 'moving' && selectedElementIds.length > 0) {
            const dx = (e.clientX - startPanPos.x) / scale;
            const dy = (e.clientY - startPanPos.y) / scale;
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy, points: el.points?.map(p => ({ x: p.x + dx, y: p.y + dy })) } : el));
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (action === 'drawing') {
            const copy = [...elements];
            const current = copy[copy.length - 1];
            if (current.type === 'freehand') current.points = [...(current.points || []), { x, y }];
            else { current.x2 = x; current.y2 = y; }
            setElements(copy);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);
        const element = getElementAtPosition(x, y, elements);
        if (element && element.type === 'text') {
            setEditingElement(element);
            setSelectedElementIds([]);
        }
    };

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
        setResizeHandle(null);
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

    const handleClear = () => { setHistory(h => [...h, elements]); setElements([]); };

    const deleteSelected = () => {
        if (selectedElementIds.length === 0) return;
        setHistory(prev => [...prev, elements]);
        setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
        setSelectedElementIds([]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && !editingElement) {
                deleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementIds, editingElement, elements]);

    const zoomIn = () => setScale(s => Math.min(10, s + 0.1));
    const zoomOut = () => setScale(s => Math.max(0.1, s - 0.1));
    const resetZoom = () => setScale(1);

    return (
        <div className="flex flex-col h-full bg-[#f9f9fb] dark:bg-zinc-950 overflow-hidden font-sans select-none relative">
            <Script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js" onLoad={onScriptLoad} />
            <ActionMenu handleDownload={handleDownload} />
            <Toolbar tool={tool} setTool={setTool} isLocked={isLocked} setIsLocked={setIsLocked} />
            <ZoomControls scale={scale} zoomIn={zoomIn} zoomOut={zoomOut} resetZoom={resetZoom} handleUndo={handleUndo} handleRedo={handleRedo} canUndo={history.length > 0} canRedo={redoStack.length > 0} />
            
            <StylePanel 
                elements={elements} 
                selectedElementIds={selectedElementIds} 
                setSelectedElementIds={setSelectedElementIds} 
                color={color} 
                setColor={setColor} 
                strokeWidth={strokeWidth} 
                setStrokeWidth={setStrokeWidth} 
                handleClear={handleClear} 
                updateElement={updateElement}
                deleteSelected={deleteSelected}
                bringToFront={bringToFront} 
                sendToBack={sendToBack} 
            />

            <div className="flex-1 relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: `${20 * scale}px ${20 * scale}px`, backgroundPosition: `${offset.x}px ${offset.y}px` }} />
                <canvas 
                    ref={canvasRef} 
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
