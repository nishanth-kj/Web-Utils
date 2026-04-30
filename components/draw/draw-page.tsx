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
    const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'panning'>('none');
    const [tool, setTool] = useState<ElementType>('freehand');
    const [color, setColor] = useState('#1e1e1e');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [roughCanvas, setRoughCanvas] = useState<any>(null);
    const [history, setHistory] = useState<Element[][]>([]);
    const [redoStack, setRedoStack] = useState<Element[][]>([]);
    const [selectedElements, setSelectedElements] = useState<Element[]>([]);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
    const [isLocked, setIsLocked] = useState(false);

    const getMousePos = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - offset.x) / scale,
            y: (e.clientY - rect.top - offset.y) / scale
        };
    };

    // Initialize RoughJS
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).rough && canvasRef.current && !roughCanvas) {
            setRoughCanvas((window as any).rough.canvas(canvasRef.current));
        }
    }, [roughCanvas]);

    const onScriptLoad = () => {
        if (typeof window !== 'undefined' && (window as any).rough) {
            const canvas = canvasRef.current;
            if (canvas) setRoughCanvas((window as any).rough.canvas(canvas));
        }
    };

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !roughCanvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        [...elements].sort((a, b) => a.zIndex - b.zIndex).forEach((element) => {
            drawElement(roughCanvas, ctx, element);
        });

        selectedElements.forEach((element) => {
            ctx.strokeStyle = '#3b82f6';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            const minX = Math.min(element.x1, element.x2) - 5;
            const maxX = Math.max(element.x1, element.x2) + 5;
            const minY = Math.min(element.y1, element.y2) - 5;
            const maxY = Math.max(element.y1, element.y2) + 5;
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
            ctx.setLineDash([]);
        });

        ctx.restore();
    }, [elements, roughCanvas, offset, scale, selectedElements]);

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
                ctx.font = `${20 * element.strokeWidth}px 'Outfit', sans-serif`;
                ctx.fillStyle = element.color;
                ctx.textBaseline = 'top';
                ctx.fillText(element.text || '', element.x1, element.y1);
                break;
        }
    };

    const distance = (a: {x: number, y: number}, b: {x: number, y: number}) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

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
                return x >= element.x1 && x <= element.x1 + 100 && y >= element.y1 && y <= element.y1 + 30;
            }
            return false;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!roughCanvas) return;
        const { x, y } = getMousePos(e);

        if (e.button === 1 || tool === 'hand') {
            setAction('panning');
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (tool === 'selection') {
            const element = getElementAtPosition(x, y, elements);
            if (element) {
                setSelectedElements(e.shiftKey ? [...selectedElements, element] : [element]);
                setAction('moving');
                setStartPanPos({ x: e.clientX, y: e.clientY });
            } else {
                setSelectedElements([]);
            }
            return;
        }

        if (tool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                const newEl: Element = { id: Date.now(), x1: x, y1: y, x2: x, y2: y, type: 'text', color, strokeWidth, zIndex: elements.length, text };
                setElements(prev => [...prev, newEl]);
                setHistory(prev => [...prev, elements]);
            }
            return;
        }

        setAction('drawing');
        const newEl: Element = { 
            id: Date.now(), x1: x, y1: y, x2: x, y2: y, type: tool, color, strokeWidth, zIndex: elements.length,
            points: tool === 'freehand' ? [{x, y}] : undefined 
        };
        setElements(prev => [...prev, newEl]);
        setHistory(prev => [...prev, elements]);
        setRedoStack([]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (action === 'none') return;
        const { x, y } = getMousePos(e);

        if (action === 'panning') {
            setOffset(prev => ({ x: prev.x + (e.clientX - startPanPos.x), y: prev.y + (e.clientY - startPanPos.y) }));
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (action === 'moving' && selectedElements.length > 0) {
            const dx = (e.clientX - startPanPos.x) / scale;
            const dy = (e.clientY - startPanPos.y) / scale;
            const ids = selectedElements.map(el => el.id);
            setElements(prev => prev.map(el => ids.includes(el.id) ? { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy, points: el.points?.map(p => ({ x: p.x + dx, y: p.y + dy })) } : el));
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

    const handleMouseUp = () => setAction('none');
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
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
    const bringToFront = () => { const maxZ = Math.max(...elements.map(e => e.zIndex), 0); const ids = selectedElements.map(e => e.id); setElements(prev => prev.map(e => ids.includes(e.id) ? { ...e, zIndex: maxZ + 1 } : e)); };
    const sendToBack = () => { const minZ = Math.min(...elements.map(e => e.zIndex), 0); const ids = selectedElements.map(e => e.id); setElements(prev => prev.map(e => ids.includes(e.id) ? { ...e, zIndex: minZ - 1 } : e)); };
    const handleClear = () => { setHistory(h => [...h, elements]); setElements([]); };

    const zoomIn = () => setScale(s => Math.min(10, s + 0.1));
    const zoomOut = () => setScale(s => Math.max(0.1, s - 0.1));
    const resetZoom = () => setScale(1);

    return (
        <div className="flex flex-col h-full bg-[#f9f9fb] dark:bg-zinc-950 overflow-hidden font-sans select-none relative">
            <Script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js" onLoad={onScriptLoad} />
            <ActionMenu handleDownload={handleDownload} />
            <Toolbar tool={tool} setTool={setTool} isLocked={isLocked} setIsLocked={setIsLocked} />
            <ZoomControls scale={scale} zoomIn={zoomIn} zoomOut={zoomOut} resetZoom={resetZoom} handleUndo={handleUndo} handleRedo={handleRedo} canUndo={history.length > 0} canRedo={redoStack.length > 0} />
            <StylePanel elements={elements} selectedElements={selectedElements} setSelectedElements={setSelectedElements} color={color} setColor={setColor} strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth} handleClear={handleClear} bringToFront={bringToFront} sendToBack={sendToBack} />
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: `${20 * scale}px ${20 * scale}px`, backgroundPosition: `${offset.x}px ${offset.y}px` }} />
                <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel} className={`absolute inset-0 w-full h-full touch-none ${tool === 'hand' || action === 'panning' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`} />
            </div>
        </div>
    );
}
