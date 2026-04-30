"use client";

import React, { useRef } from 'react';
import { Palette, Trash2, ArrowUp, ArrowDown, Plus, Layers, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Element } from './types';

export interface StylePanelProps {
    elements: Element[];
    selectedElements: Element[];
    setSelectedElements: (elements: Element[]) => void;
    color: string;
    setColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    handleClear: () => void;
    bringToFront: () => void;
    sendToBack: () => void;
}

const DEFAULT_COLORS = [
    { name: 'Black', value: '#1e1e1e' },
    { name: 'Red', value: '#ff4d4d' },
    { name: 'Green', value: '#4dff4d' },
    { name: 'Blue', value: '#4d4dff' },
    { name: 'Yellow', value: '#ffff4d' },
    { name: 'Purple', value: '#800080' },
    { name: 'Cyan', value: '#00ffff' },
];

export function StylePanel({ 
    elements, selectedElements, setSelectedElements, color, setColor, strokeWidth, setStrokeWidth, handleClear, bringToFront, sendToBack 
}: StylePanelProps) {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const isCustomColor = !DEFAULT_COLORS.some(c => c.value === color);

    const handleDragStart = (e: React.MouseEvent) => {
        if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement || (e.target as any).closest('button')) return;
        const el = e.currentTarget as HTMLElement;
        const startX = e.clientX - el.offsetLeft;
        const startY = e.clientY - el.offsetTop;
        const onMouseMove = (moveEvent: MouseEvent) => {
            const newLeft = moveEvent.clientX - startX;
            const newTop = moveEvent.clientY - startY;
            el.style.left = `${Math.max(0, Math.min(window.innerWidth - el.offsetWidth, newLeft))}px`;
            el.style.top = `${Math.max(0, Math.min(window.innerHeight - el.offsetHeight, newTop))}px`;
            el.style.right = 'auto';
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const isSelected = (id: number) => selectedElements.some(el => el.id === id);
    
    return (
        <div 
            className="absolute top-24 right-4 z-50 flex flex-col gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-2xl w-52 animate-in slide-in-from-right-2 max-h-[85vh] overflow-y-auto"
            onMouseDown={handleDragStart}
        >
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Palette className="size-3" /> Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_COLORS.map(c => (
                        <button 
                            key={c.value}
                            className={`size-8 rounded-lg border-2 transition-all ${color === c.value ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-zinc-200'}`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setColor(c.value)}
                        />
                    ))}
                    <div className="relative size-8">
                        <button 
                            className={`size-full rounded-lg border-2 flex items-center justify-center transition-all ${isCustomColor ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-zinc-200'}`}
                            style={{ backgroundColor: isCustomColor ? color : '#f4f4f5' }}
                            onClick={() => colorInputRef.current?.click()}
                        >
                            {isCustomColor ? null : <Plus className="size-4 text-zinc-400" />}
                        </button>
                        <input 
                            ref={colorInputRef}
                            type="color" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thickness</label>
                <div className="flex gap-2">
                    {[1, 2, 4].map(w => (
                        <Button 
                            key={w}
                            variant={strokeWidth === w ? "default" : "outline"}
                            size="sm"
                            className="flex-1 h-8 text-[10px]"
                            onClick={() => setStrokeWidth(w)}
                        >
                            {w === 1 ? 'Thin' : w === 2 ? 'Bold' : 'Extra'}
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nodes ({elements.length})</label>
                <ScrollArea className="h-32 border rounded-lg bg-zinc-50 dark:bg-zinc-950 p-1">
                    <div className="flex flex-col gap-1">
                        {[...elements].reverse().map(el => (
                            <button
                                key={el.id}
                                onClick={() => setSelectedElements(isSelected(el.id) ? selectedElements.filter(s => s.id !== el.id) : [...selectedElements, el])}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] transition-all ${isSelected(el.id) ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                            >
                                <span className="truncate flex-1 text-left">{el.type}</span>
                                {isSelected(el.id) && <MousePointer2 className="size-2.5" />}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <Separator />

            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-[10px]" onClick={sendToBack} disabled={selectedElements.length === 0}>Back</Button>
                <Button variant="outline" size="sm" className="flex-1 text-[10px]" onClick={bringToFront} disabled={selectedElements.length === 0}>Front</Button>
            </div>

            <Button variant="ghost" size="sm" className="w-full text-destructive text-[10px] hover:bg-destructive/10" onClick={handleClear}>
                <Trash2 className="size-3.5 mr-2" /> Clear All
            </Button>
        </div>
    );
}
