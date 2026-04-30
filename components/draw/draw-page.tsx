"use client";

import React, { useRef, useState, useEffect } from 'react';
import { 
    Eraser, 
    Square, 
    Circle, 
    Minus, 
    Download, 
    Trash2, 
    Undo2, 
    Type,
    MousePointer2,
    Palette,
    PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function DrawPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#3b82f6');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState<'brush' | 'eraser' | 'rect' | 'circle'>('brush');
    const [history, setHistory] = useState<string[]>([]);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const updateSize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const tempImage = canvas.toDataURL();
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                const img = new Image();
                img.src = tempImage;
                img.onload = () => ctx.drawImage(img, 0, 0);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            setHistory(prev => [...prev, canvas.toDataURL()].slice(-20));
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        setIsDrawing(true);
        setStartPos({ x, y });
        saveToHistory();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = brushSize;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        if (tool === 'brush' || tool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            // Shapes handling (preview would be better but let's keep it simple)
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            saveToHistory();
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'quick-draw.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const img = new Image();
                img.src = last;
                img.onload = () => ctx.drawImage(img, 0, 0);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 h-14 border-b bg-muted/20 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <PenTool className="size-4 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Draw</span>
                    </div>
                    
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    
                    <ToggleGroup 
                        type="single" 
                        value={tool} 
                        onValueChange={(v) => v && setTool(v as any)}
                        className="bg-muted/40 p-1 rounded-lg"
                    >
                        <ToggleGroupItem value="brush" className="size-8 rounded-md" aria-label="Brush">
                            <MousePointer2 className="size-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="eraser" className="size-8 rounded-md" aria-label="Eraser">
                            <Eraser className="size-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <div className="flex items-center gap-3 px-3">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="size-6 rounded-full overflow-hidden border-none cursor-pointer bg-transparent"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Size</span>
                            <input 
                                type="range" 
                                min="1" 
                                max="50" 
                                value={brushSize} 
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="size-8" onClick={handleUndo} disabled={history.length === 0}>
                        <Undo2 className="size-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10" onClick={handleClear}>
                        <Trash2 className="size-4" />
                    </Button>
                    <Button variant="default" size="sm" className="h-8 gap-2 font-bold uppercase tracking-widest text-[10px]" onClick={handleDownload}>
                        <Download className="size-3" /> Save Image
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-[#f8fafc] dark:bg-zinc-950 overflow-hidden cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full touch-none"
                />
            </div>
        </div>
    );
}
