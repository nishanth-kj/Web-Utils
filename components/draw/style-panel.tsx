"use client";

import React from 'react';
import { Palette, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface StylePanelProps {
    color: string;
    setColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    handleClear: () => void;
}

export function StylePanel({ color, setColor, strokeWidth, setStrokeWidth, handleClear }: StylePanelProps) {
    return (
        <div 
            className="absolute top-24 right-6 z-50 flex flex-col gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-2xl w-52 animate-in slide-in-from-right-4 duration-500 cursor-default active:cursor-grabbing"
            onMouseDown={(e) => {
                if (e.target instanceof HTMLButtonElement) return;
                const el = e.currentTarget;
                const startX = e.clientX - el.offsetLeft;
                const startY = e.clientY - el.offsetTop;
                
                const onMouseMove = (moveEvent: MouseEvent) => {
                    el.style.left = `${moveEvent.clientX - startX}px`;
                    el.style.top = `${moveEvent.clientY - startY}px`;
                    el.style.right = 'auto';
                };
                
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }}
        >
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Palette className="size-3" /> Stroke Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {['#1e1e1e', '#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d'].map(c => (
                        <button 
                            key={c}
                            className={`size-6 rounded-md border-2 transition-all ${color === c ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-zinc-200'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stroke Width</label>
                <div className="flex flex-col gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    {[1, 2, 4].map(w => (
                        <button 
                            key={w}
                            className={`w-full h-8 text-[10px] font-bold rounded-md transition-all ${strokeWidth === w ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setStrokeWidth(w)}
                        >
                            {w === 1 ? 'Thin' : w === 2 ? 'Bold' : 'Extra'}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            <Button variant="ghost" size="sm" className="justify-start gap-2 h-9 text-xs font-medium text-destructive hover:bg-destructive/10" onClick={handleClear}>
                <Trash2 className="size-3.5" /> Clear Canvas
            </Button>
        </div>
    );
}
