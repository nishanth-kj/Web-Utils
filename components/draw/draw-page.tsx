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
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
    const [isLocked, setIsLocked] = useState(false);

    // Initialize RoughJS
    const onScriptLoad = () => {
        if (typeof window !== 'undefined' && (window as any).rough) {
            const canvas = canvasRef.current;
            if (canvas) {
                setRoughCanvas((window as any).rough.canvas(canvas));
            }
        }
    };

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!roughCanvas) return;

        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        elements.forEach((element) => {
            drawElement(roughCanvas, ctx, element);
        });

        ctx.restore();
    }, [elements, roughCanvas, offset, scale]);

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
            case 'line':
                rc.draw(generator.line(element.x1, element.y1, element.x2, element.y2, options));
                break;
            case 'rectangle':
                rc.draw(generator.rectangle(element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1, options));
                break;
            case 'diamond':
                const midX = (element.x1 + element.x2) / 2;
                const midY = (element.y1 + element.y2) / 2;
                rc.draw(generator.polygon([
                    [midX, element.y1],
                    [element.x2, midY],
                    [midX, element.y2],
                    [element.x1, midY]
                ], options));
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
        }
    };

    const getMousePos = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - offset.x) / scale,
            y: (e.clientY - rect.top - offset.y) / scale
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!roughCanvas) return;
        
        if (e.button === 1 || tool === 'hand') {
            setAction('panning');
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        const { x, y } = getMousePos(e);

        if (tool === 'selection') return;

        setAction('drawing');
        const id = Date.now();
        const newElement: Element = { 
            id, 
            x1: x, 
            y1: y, 
            x2: x, 
            y2: y, 
            type: tool, 
            color, 
            strokeWidth, 
            points: tool === 'freehand' ? [{x, y}] : undefined 
        };
        setElements(prev => [...prev, newElement]);
        setHistory(prev => [...prev, elements]);
        setRedoStack([]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (action === 'none') return;

        if (action === 'panning') {
            setOffset(prev => ({
                x: prev.x + (e.clientX - startPanPos.x),
                y: prev.y + (e.clientY - startPanPos.y)
            }));
            setStartPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        const { x, y } = getMousePos(e);

        if (action === 'drawing') {
            const elementsCopy = [...elements];
            const index = elementsCopy.length - 1;
            const current = elementsCopy[index];
            
            if (current.type === 'freehand') {
                current.points = [...(current.points || []), { x, y }];
            } else {
                current.x2 = x;
                current.y2 = y;
            }
            setElements(elementsCopy);
        }
    };

    const handleMouseUp = () => {
        setAction('none');
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.max(0.1, Math.min(10, prev * delta)));
        } else {
            setOffset(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setRedoStack(prevStack => [...prevStack, elements]);
        setElements(prev);
        setHistory(prevHistory => prevHistory.slice(0, -1));
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setHistory(prevHistory => [...prevHistory, elements]);
        setElements(next);
        setRedoStack(prevStack => prevStack.slice(0, -1));
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'sketch.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const handleClear = () => {
        setHistory(prev => [...prev, elements]);
        setElements([]);
    };

    const zoomIn = () => setScale(prev => Math.min(10, prev + 0.1));
    const zoomOut = () => setScale(prev => Math.max(0.1, prev - 0.1));
    const resetZoom = () => setScale(1);

    return (
        <div className="flex flex-col h-full bg-[#f9f9fb] dark:bg-zinc-950 overflow-hidden font-sans select-none relative">
            <Script 
                src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js" 
                onLoad={onScriptLoad}
            />

            <ActionMenu handleDownload={handleDownload} />
            
            <Toolbar 
                tool={tool} 
                setTool={setTool} 
                isLocked={isLocked} 
                setIsLocked={setIsLocked} 
            />

            {/* Canvas Instructions (Bottom Center) */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 text-[11px] font-medium text-zinc-400">
                To move canvas, hold <span className="border px-1 rounded-sm bg-zinc-50 dark:bg-zinc-800">Scroll wheel</span> or <span className="border px-1 rounded-sm bg-zinc-50 dark:bg-zinc-800">Space</span> while dragging, or use the hand tool
            </div>

            <ZoomControls 
                scale={scale}
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                resetZoom={resetZoom}
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                canUndo={history.length > 0}
                canRedo={redoStack.length > 0}
            />

            <StylePanel 
                color={color}
                setColor={setColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                handleClear={handleClear}
            />

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
                         backgroundSize: `${20 * scale}px ${20 * scale}px`,
                         backgroundPosition: `${offset.x}px ${offset.y}px`
                     }} 
                />
                
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={handleWheel}
                    className={`absolute inset-0 w-full h-full touch-none ${tool === 'hand' || action === 'panning' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
                />
            </div>
        </div>
    );
}
