"use client";

import React, { useRef } from 'react';
import { Palette, Plus, MousePointer2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Element } from './types';

export interface StylePanelProps {
    elements: Element[];
    selectedElementIds: number[];
    setSelectedElementIds: (ids: number[]) => void;
    color: string;
    setColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    updateElement: (id: number, updates: Partial<Element>) => void;
}

const DEFAULT_COLORS = [
    { name: 'Black', value: '#1e1e1e' },
    { name: 'Red', value: '#ff4d4d' },
    { name: 'Green', value: '#4dff4d' },
    { name: 'Blue', value: '#4d4dff' },
    { name: 'Yellow', value: '#ffff4d' },
    { name: 'Purple', value: '#800080' },
];

export function StylePanel({ 
    elements, selectedElementIds, setSelectedElementIds, color, setColor, strokeWidth, setStrokeWidth, updateElement 
}: StylePanelProps) {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const isCustomColor = !DEFAULT_COLORS.some(c => c.value === color);

    const isSelected = (id: number) => selectedElementIds.includes(id);
    
    return (
        <TooltipProvider delayDuration={200}>
            <div className="absolute top-40 right-6 z-50 flex flex-col gap-2 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl shadow-2xl w-12 animate-in slide-in-from-right-2 max-h-[90vh]">
                {/* Color Palette */}
                <div className="flex flex-col gap-1 items-center">
                    {DEFAULT_COLORS.map(c => (
                        <Tooltip key={c.value}>
                            <TooltipTrigger asChild>
                                <button 
                                    className={`size-7 rounded-md border-2 transition-all ${color === c.value ? 'border-primary scale-110 shadow-lg' : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                                    style={{ backgroundColor: c.value }}
                                    onClick={() => setColor(c.value)}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="left">{c.name}</TooltipContent>
                        </Tooltip>
                    ))}
                    <div className="relative size-7">
                        <button 
                            className={`size-full rounded-md border-2 flex items-center justify-center transition-all ${isCustomColor ? 'border-primary scale-110 shadow-lg' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'}`}
                            style={{ backgroundColor: isCustomColor ? color : 'transparent' }}
                            onClick={() => colorInputRef.current?.click()}
                        >
                            {!isCustomColor && <Plus className="size-3 text-zinc-400" />}
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

                <Separator className="opacity-50" />

                {/* Thickness */}
                <div className="flex flex-col gap-1 items-center">
                    {[1, 2, 4].map(w => (
                        <Tooltip key={w}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant={strokeWidth === w ? "default" : "ghost"}
                                    size="icon"
                                    className="size-7 rounded-md"
                                    onClick={() => setStrokeWidth(w)}
                                >
                                    <div className="rounded-full bg-current" style={{ width: w * 1.5, height: w * 1.5 }} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">{w === 1 ? 'Thin' : w === 2 ? 'Bold' : 'Extra'}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
