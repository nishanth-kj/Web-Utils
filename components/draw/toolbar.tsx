"use client";

import React from 'react';
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
    PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ElementType } from './types';

interface ToolbarProps {
    tool: ElementType;
    setTool: (tool: ElementType) => void;
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
}

export function Toolbar({ tool, setTool, isLocked, setIsLocked }: ToolbarProps) {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center px-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-9 rounded-lg"
                    onClick={() => setIsLocked(!isLocked)}
                >
                    {isLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6 mx-1" />

            <ToggleGroup 
                type="single" 
                value={tool} 
                onValueChange={(v) => v && setTool(v as ElementType)}
                className="flex items-center gap-0.5"
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="hand" className="size-9 rounded-lg relative" aria-label="Hand">
                            <Hand className="size-4" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Hand (H)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="selection" className="size-9 rounded-lg relative" aria-label="Selection">
                            <MousePointer2 className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">1</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Selection (V)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="rectangle" className="size-9 rounded-lg relative" aria-label="Rectangle">
                            <Square className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">2</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Rectangle (R)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="diamond" className="size-9 rounded-lg relative" aria-label="Diamond">
                            <Diamond className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">3</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Diamond (D)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="circle" className="size-9 rounded-lg relative" aria-label="Circle">
                            <Circle className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">4</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Circle (O)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="arrow" className="size-9 rounded-lg relative" aria-label="Arrow">
                            <ArrowRight className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">5</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Arrow (A)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="line" className="size-9 rounded-lg relative" aria-label="Line">
                            <Minus className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">6</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Line (L)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="freehand" className="size-9 rounded-lg relative" aria-label="Freehand">
                            <PenTool className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">7</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Draw (P)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="text" className="size-9 rounded-lg relative" aria-label="Text">
                            <Type className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">8</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Text (T)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="selection" className="size-9 rounded-lg relative opacity-50" aria-label="Image">
                            <ImageIcon className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">9</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="eraser" className="size-9 rounded-lg relative" aria-label="Eraser">
                            <Eraser className="size-4" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground opacity-50">0</span>
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Eraser (E)</TooltipContent>
                </Tooltip>
            </ToggleGroup>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <div className="flex items-center px-1">
                <Button variant="ghost" size="icon" className="size-9 rounded-lg">
                    <PlusCircle className="size-4" />
                </Button>
            </div>
        </div>
    );
}
