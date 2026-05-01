"use client";

import React from 'react';
import { Layers, MousePointer2, Eye, EyeOff, Lock, Unlock, Trash2, MoveUp, MoveDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Element } from './types';

interface LayerPanelProps {
    elements: Element[];
    selectedElementIds: number[];
    setSelectedElementIds: (ids: number[]) => void;
    deleteSelected: () => void;
    bringToFront: () => void;
    sendToBack: () => void;
    handleClear: () => void;
    updateElement: (id: number, updates: Partial<Element>) => void;
}

export function LayerPanel({ 
    elements, selectedElementIds, setSelectedElementIds, deleteSelected, bringToFront, sendToBack, handleClear, updateElement
}: LayerPanelProps) {
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

        // Update all z-indices based on new array order
        newElements.forEach((el, idx) => {
            updateElement(el.id, { zIndex: idx });
        });
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl shadow-2xl w-56 animate-in slide-in-from-right-2 overflow-hidden">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                        <Layers className="size-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Layers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-5 text-zinc-400 hover:text-destructive" onClick={handleClear}>
                                    <RotateCcw className="size-2.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear All</TooltipContent>
                        </Tooltip>
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{elements.length}</span>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <ScrollArea className="h-[200px] w-full pr-2">
                    <div className="flex flex-col gap-0.5 pb-1">
                        {sortedElements.map((el) => (
                            <div 
                                key={el.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, el.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, el.id)}
                                className={`group flex items-center gap-1.5 p-1 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${isSelected(el.id) ? 'bg-primary/5 border-primary/20' : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                onClick={() => setSelectedElementIds(isSelected(el.id) ? selectedElementIds.filter(id => id !== el.id) : [...selectedElementIds, el.id])}
                            >
                                <div className="size-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${el.color}15`, color: el.color }}>
                                    <div className="size-1 rounded-full" style={{ backgroundColor: el.color }} />
                                </div>
                                
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[9px] font-medium capitalize truncate">{el.type}</span>
                                    <span className="text-[7px] text-muted-foreground">Z: {el.zIndex}</span>
                                </div>

                                <div className={`flex items-center gap-0.5 transition-opacity ${isSelected(el.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="size-5 rounded-md hover:bg-destructive/10 hover:text-destructive" 
                                                onClick={(e) => { e.stopPropagation(); setSelectedElementIds([el.id]); setTimeout(deleteSelected, 0); }}
                                            >
                                                <Trash2 className="size-2.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">Delete</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                        
                        {elements.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                                <Layers className="size-4 text-zinc-300 mb-1" />
                                <span className="text-[9px] text-zinc-400 italic">No layers</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    );
}
