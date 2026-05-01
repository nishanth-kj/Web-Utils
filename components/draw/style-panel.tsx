"use client";

import React, { useRef } from 'react';
import { 
    Plus, Minus, MoreHorizontal, GripHorizontal, Activity, 
    Copy, Trash2, Link2, ChevronUp, ChevronDown, 
    ArrowUpToLine, ArrowDownToLine, Layers, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Element } from './types';

export interface StylePanelProps {
    elements: Element[];
    selectedElementIds: number[];
    setSelectedElementIds: (ids: number[]) => void;
    
    color: string;
    setColor: (color: string) => void;
    
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    
    strokeStyle: 'solid' | 'dashed' | 'dotted';
    setStrokeStyle: (style: 'solid' | 'dashed' | 'dotted') => void;
    
    roughness: number;
    setRoughness: (r: number) => void;
    
    opacity: number;
    setOpacity: (o: number) => void;
    
    updateElement: (id: number, updates: Partial<Element>) => void;
    duplicateSelected: () => void;
    deleteSelected: () => void;
    bringToFront: () => void;
    sendToBack: () => void;
    moveUp: () => void;
    moveDown: () => void;
    handleClear: () => void;
}

const STROKE_COLORS = [
    { name: 'Black', value: '#1e1e1e' },
    { name: 'Red', value: '#ff4d4d' },
    { name: 'Green', value: '#4dff4d' },
    { name: 'Blue', value: '#4d4dff' },
    { name: 'Yellow', value: '#ffff4d' },
];

const BG_COLORS = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'Light Red', value: '#ffcccc' },
    { name: 'Light Green', value: '#ccffcc' },
    { name: 'Light Blue', value: '#ccccff' },
    { name: 'Light Yellow', value: '#ffffcc' },
];

export function StylePanel({ 
    elements, selectedElementIds, setSelectedElementIds,
    color, setColor, 
    backgroundColor, setBackgroundColor,
    strokeWidth, setStrokeWidth,
    strokeStyle, setStrokeStyle,
    roughness, setRoughness,
    opacity, setOpacity,
    updateElement, duplicateSelected, deleteSelected, bringToFront, sendToBack, moveUp, moveDown, handleClear
}: StylePanelProps) {
    const strokeInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const isSelected = (id: number) => selectedElementIds.includes(id);

    const handleDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData('text/plain', id.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
        if (draggedId === targetId) return;

        const draggedIndex = elements.findIndex(el => el.id === draggedId);
        const targetIndex = elements.findIndex(el => el.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;

        const newElements = [...elements];
        const [draggedItem] = newElements.splice(draggedIndex, 1);
        newElements.splice(targetIndex, 0, draggedItem);

        newElements.forEach((el, idx) => {
            updateElement(el.id, { zIndex: idx });
        });
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="absolute top-20 right-6 z-50 flex flex-col gap-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-72 animate-in slide-in-from-right-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
                
                {/* Properties Sections */}
                <div className="space-y-4">
                    {/* Stroke Color */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Stroke</label>
                        <div className="flex flex-wrap gap-2">
                            {STROKE_COLORS.map(c => (
                                <button 
                                    key={c.value}
                                    className={`size-8 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 ${color === c.value ? 'border-primary shadow-md' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.value }}
                                    onClick={() => setColor(c.value)}
                                />
                            ))}
                            <button 
                                className="size-8 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                onClick={() => strokeInputRef.current?.click()}
                            >
                                <Plus className="size-4 text-zinc-400" />
                            </button>
                            <input ref={strokeInputRef} type="color" className="hidden" onChange={(e) => setColor(e.target.value)} />
                        </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Background</label>
                        <div className="flex flex-wrap gap-2">
                            {BG_COLORS.map(c => (
                                <button 
                                    key={c.value}
                                    className={`size-8 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 ${backgroundColor === c.value ? 'border-primary shadow-md' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.value === 'transparent' ? 'transparent' : c.value }}
                                    onClick={() => setBackgroundColor(c.value)}
                                >
                                    {c.value === 'transparent' && <div className="size-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACpJREFUGF5jYmBgYGBgYGD4jw8DMCYDIpAcA0SCSIDkGBggEkgKGBgYGBgAmYIEB7z9S7QAAAAASUVORK5CYII=')] opacity-20" />}
                                </button>
                            ))}
                            <button 
                                className="size-8 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                onClick={() => bgInputRef.current?.click()}
                            >
                                <Plus className="size-4 text-zinc-400" />
                            </button>
                            <input ref={bgInputRef} type="color" className="hidden" onChange={(e) => setBackgroundColor(e.target.value)} />
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Stroke Width & Style */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Width</label>
                            <div className="flex gap-1">
                                {[1, 2, 4].map(w => (
                                    <Button key={w} variant={strokeWidth === w ? "default" : "secondary"} size="icon" className="size-8 rounded-lg" onClick={() => setStrokeWidth(w)}>
                                        <Minus style={{ strokeWidth: w }} className="size-4" />
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Style</label>
                            <div className="flex gap-1">
                                <Button variant={strokeStyle === 'solid' ? "default" : "secondary"} size="icon" className="size-8 rounded-lg" onClick={() => setStrokeStyle('solid')}><Minus className="size-4" /></Button>
                                <Button variant={strokeStyle === 'dashed' ? "default" : "secondary"} size="icon" className="size-8 rounded-lg" onClick={() => setStrokeStyle('dashed')}><GripHorizontal className="size-4" /></Button>
                            </div>
                        </div>
                    </div>

                    {/* Sloppiness & Opacity */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sloppiness</label>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(r => (
                                    <Button key={r} variant={roughness === r ? "default" : "secondary"} size="icon" className="size-8 rounded-lg" onClick={() => setRoughness(r)}>
                                        <Activity className="size-4" style={{ opacity: r === 0 ? 0.3 : r === 1 ? 0.6 : 1 }} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Opacity</label>
                                <span className="text-[10px] font-mono text-zinc-400">{opacity}%</span>
                            </div>
                            <Slider value={[opacity]} max={100} step={1} onValueChange={(v) => setOpacity(v[0])} className="py-2" />
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Layer Actions */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Selection Actions</label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="icon" className="size-9 rounded-xl" onClick={sendToBack}><ArrowDownToLine className="size-4" /></Button>
                            <Button variant="secondary" size="icon" className="size-9 rounded-xl" onClick={moveDown}><ChevronDown className="size-4" /></Button>
                            <Button variant="secondary" size="icon" className="size-9 rounded-xl" onClick={moveUp}><ChevronUp className="size-4" /></Button>
                            <Button variant="secondary" size="icon" className="size-9 rounded-xl" onClick={bringToFront}><ArrowUpToLine className="size-4" /></Button>
                            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                            <Button variant="secondary" size="icon" className="size-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500" onClick={duplicateSelected}><Copy className="size-4" /></Button>
                            <Button variant="secondary" size="icon" className="size-9 rounded-xl text-destructive hover:bg-destructive/10" onClick={deleteSelected}><Trash2 className="size-4" /></Button>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Layer List Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Layers className="size-3.5 text-primary" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Layers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="size-6 text-zinc-400 hover:text-destructive" onClick={handleClear}>
                                <RotateCcw className="size-3" />
                            </Button>
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{elements.length}</span>
                        </div>
                    </div>

                    <ScrollArea className="h-[200px] -mx-2 px-2">
                        <div className="flex flex-col gap-1 pb-2">
                            {sortedElements.map((el) => (
                                <div 
                                    key={el.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, el.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, el.id)}
                                    className={`group flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${isSelected(el.id) ? 'bg-primary/5 border-primary/20' : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                    onClick={() => setSelectedElementIds(isSelected(el.id) ? selectedElementIds.filter(id => id !== el.id) : [...selectedElementIds, el.id])}
                                >
                                    <div className="size-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${el.color}15`, color: el.color }}>
                                        <div className="size-1.5 rounded-full" style={{ backgroundColor: el.color }} />
                                    </div>
                                    
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-[10px] font-bold capitalize truncate">{el.type}</span>
                                        <span className="text-[8px] text-muted-foreground">Z-Index: {el.zIndex}</span>
                                    </div>

                                    <div className={`flex items-center gap-1 transition-opacity ${isSelected(el.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-6 rounded-lg hover:bg-destructive/10 hover:text-destructive" 
                                            onClick={(e) => { e.stopPropagation(); setSelectedElementIds([el.id]); setTimeout(deleteSelected, 0); }}
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            
                            {elements.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                                    <Layers className="size-6 text-zinc-300 mb-2" />
                                    <span className="text-[10px] text-zinc-400 italic">No layers yet</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

            </div>
        </TooltipProvider>
    );
}
