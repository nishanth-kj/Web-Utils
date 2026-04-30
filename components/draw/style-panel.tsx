"use client";

import React, { useRef } from 'react';
import { Palette, Trash2, ArrowUp, ArrowDown, Plus, Layers, MousePointer2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Element } from './types';

export interface StylePanelProps {
    elements: Element[];
    selectedElementIds: number[];
    setSelectedElementIds: (ids: number[]) => void;
    color: string;
    setColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    handleClear: () => void;
    updateElement: (id: number, updates: Partial<Element>) => void;
    deleteSelected: () => void;
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
    elements, selectedElementIds, setSelectedElementIds, color, setColor, strokeWidth, setStrokeWidth, handleClear, updateElement, deleteSelected, bringToFront, sendToBack 
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

    const isSelected = (id: number) => selectedElementIds.includes(id);
    const selectedEl = selectedElementIds.length === 1 ? elements.find(el => el.id === selectedElementIds[0]) : null;
    
    return (
        <div 
            className="absolute top-24 right-2 z-50 flex flex-col gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-2xl w-52 animate-in slide-in-from-right-2 max-h-[85vh] overflow-y-auto"
            onMouseDown={handleDragStart}
        >
            {/* Color Palette */}
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

            {/* Thickness */}
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

            {/* Text Editor (Visible when one text node is selected) */}
            {selectedEl?.type === 'text' && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Type className="size-3" /> Text Content
                    </label>
                    <textarea 
                        className="w-full h-20 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-[11px] resize-none focus:ring-1 focus:ring-primary outline-none"
                        value={selectedEl.text || ''}
                        onChange={(e) => updateElement(selectedEl.id, { text: e.target.value })}
                        placeholder="Type something..."
                    />
                </div>
            )}

            <Separator />

            {/* Elements List */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Layers className="size-3" /> Nodes ({elements.length})
                </label>
                <ScrollArea className="h-40 border rounded-lg bg-zinc-50 dark:bg-zinc-950 p-1">
                    <div className="flex flex-col gap-1">
                        {[...elements].reverse().map(el => (
                            <button
                                key={el.id}
                                onClick={() => setSelectedElementIds(isSelected(el.id) ? selectedElementIds.filter(id => id !== el.id) : [...selectedElementIds, el.id])}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] transition-all ${isSelected(el.id) ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground'}`}
                            >
                                <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: el.color }} />
                                <span className="truncate flex-1 text-left capitalize">{el.type}</span>
                                {isSelected(el.id) && <MousePointer2 className="size-2.5" />}
                            </button>
                        ))}
                        {elements.length === 0 && <div className="text-[9px] text-center py-4 text-zinc-400 italic">Canvas is empty</div>}
                    </div>
                </ScrollArea>
            </div>

            <Separator />

            {/* Layering */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8" onClick={sendToBack} disabled={selectedElementIds.length === 0}>Send Back</Button>
                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8" onClick={bringToFront} disabled={selectedElementIds.length === 0}>Bring Front</Button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" className="w-full text-destructive text-[10px] hover:bg-destructive/10 h-9" onClick={deleteSelected} disabled={selectedElementIds.length === 0}>
                    <Trash2 className="size-3.5 mr-2" /> Delete Selected
                </Button>

                <Button variant="ghost" size="sm" className="w-full text-zinc-400 text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9" onClick={handleClear}>
                    Clear All
                </Button>
            </div>
        </div>
    );
}
