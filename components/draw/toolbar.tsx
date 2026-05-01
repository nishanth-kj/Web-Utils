"use client";

import {
    Eraser,
    Square,
    Circle,
    Minus,
    MousePointer2,
    PenTool,
    ArrowRight,
    Diamond,
    Hand,
    Type,
    Image as ImageIcon,
    Lock,
    Unlock,
    PlusCircle,
    Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ElementType } from './types';
import { cn } from '@/lib/utils';

interface ToolbarProps {
    tool: ElementType;
    setTool: (tool: ElementType) => void;
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
}

export function Toolbar({ tool, setTool, isLocked, setIsLocked }: ToolbarProps) {
    const getButtonClass = (value: ElementType) => {
        const isActive = tool === value;
        return cn(
            "size-10 rounded-xl relative transition-all duration-200 flex items-center justify-center border-none",
            isActive
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm scale-110 z-10"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
        );
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 p-1.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center px-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("size-10 rounded-xl transition-all", isLocked ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "text-zinc-500")}
                    onClick={() => setIsLocked(!isLocked)}
                >
                    {isLocked ? <Lock className="size-5" /> : <Unlock className="size-5" />}
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

            <div className="flex items-center gap-1">
                {[
                    { value: 'hand', icon: Hand, label: 'Hand (H)' },
                    { value: 'selection', icon: MousePointer2, label: 'Selection (V)', shortcut: '1' },
                    { value: 'rectangle', icon: Square, label: 'Rectangle (R)', shortcut: '2' },
                    { value: 'diamond', icon: Diamond, label: 'Diamond (D)', shortcut: '3' },
                    { value: 'circle', icon: Circle, label: 'Circle (O)', shortcut: '4' },
                    { value: 'arrow', icon: ArrowRight, label: 'Arrow (A)', shortcut: '5' },
                    { value: 'line', icon: Minus, label: 'Line (L)', shortcut: '6' },
                    { value: 'connection', icon: Link2, label: 'Connect (C)', shortcut: 'C' },
                    { value: 'freehand', icon: PenTool, label: 'Draw (P)', shortcut: '7' },
                    { value: 'text', icon: Type, label: 'Text (T)', shortcut: '8' },
                    { value: 'image', icon: ImageIcon, label: 'Image', shortcut: '9' },
                    { value: 'eraser', icon: Eraser, label: 'Eraser (E)', shortcut: '0' },
                ].map((item) => (
                    <Tooltip key={item.value}>
                        <TooltipTrigger asChild>
                            <button
                                className={getButtonClass(item.value as ElementType)}
                                onClick={() => setTool(item.value as ElementType)}
                            >
                                <item.icon className="size-5" />
                                {item.shortcut && <span className="absolute bottom-0.5 right-0.5 text-[7px] opacity-50">{item.shortcut}</span>}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[11px] font-bold">{item.label}</TooltipContent>
                    </Tooltip>
                ))}
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

            <div className="flex items-center px-1">
                <Button variant="ghost" size="icon" className="size-10 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <PlusCircle className="size-5" />
                </Button>
            </div>
        </div>
    );
}
