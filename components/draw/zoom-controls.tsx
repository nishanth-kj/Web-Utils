"use client";

import React from 'react';
import { MinusCircle, Plus, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
    scale: number;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export function ZoomControls({ 
    scale, zoomIn, zoomOut, resetZoom, handleUndo, handleRedo, canUndo, canRedo 
}: ZoomControlsProps) {
    return (
        <div className="absolute bottom-6 left-6 z-50 flex items-center gap-3">
            <div className="flex items-center bg-[#ecedf5] dark:bg-zinc-900 border border-transparent rounded-xl p-1 shadow-sm h-10">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white/50" onClick={zoomOut}>
                    <MinusCircle className="size-4" />
                </Button>
                <Button variant="ghost" className="h-8 px-2 text-xs font-bold w-12 hover:bg-white/50" onClick={resetZoom}>
                    {Math.round(scale * 100)}%
                </Button>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white/50" onClick={zoomIn}>
                    <Plus className="size-4" />
                </Button>
            </div>

            <div className="flex items-center bg-[#ecedf5] dark:bg-zinc-900 border border-transparent rounded-xl p-1 shadow-sm h-10">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white/50" onClick={handleUndo} disabled={!canUndo}>
                    <Undo2 className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white/50" onClick={handleRedo} disabled={!canRedo}>
                    <Redo2 className="size-4" />
                </Button>
            </div>
        </div>
    );
}
