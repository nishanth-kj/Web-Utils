"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';

interface BaseNodeProps extends NodeProps {
    children?: React.ReactNode;
    title?: string;
}

export function BaseNode({ children, selected, data }: BaseNodeProps) {
    return (
        <div className={cn(
            "relative w-full h-full min-w-[30px] min-h-[20px] transition-all duration-300",
            selected 
            ? 'z-50' 
            : 'hover:border-zinc-400/20 dark:hover:border-zinc-600/20'
        )}>
            {/* Selection Border - only show when selected */}
            {selected && (
                <div className="absolute -inset-[3px] border-2 border-blue-500 rounded-2xl pointer-events-none z-50" />
            )}
            {/* Connection Handles - Abstracted to the Base Node */}
            <Handle 
                type="target" 
                position={Position.Top} 
                style={{ opacity: data.tool === 'connection' ? 1 : 0, pointerEvents: data.tool === 'connection' ? 'all' : 'none' }}
                className="!size-4 !bg-blue-400 !border-2 !border-white dark:!border-zinc-950 !z-[100] !shadow-sm hover:!scale-125 transition-transform" 
            />
            <Handle 
                type="target" 
                position={Position.Left} 
                style={{ opacity: data.tool === 'connection' ? 1 : 0, pointerEvents: data.tool === 'connection' ? 'all' : 'none' }}
                className="!size-4 !bg-blue-400 !border-2 !border-white dark:!border-zinc-950 !z-[100] !shadow-sm hover:!scale-125 transition-transform" 
            />
            <Handle 
                type="source" 
                position={Position.Right} 
                style={{ opacity: data.tool === 'connection' ? 1 : 0, pointerEvents: data.tool === 'connection' ? 'all' : 'none' }}
                className="!size-4 !bg-blue-400 !border-2 !border-white dark:!border-zinc-950 !z-[100] !shadow-sm hover:!scale-125 transition-transform" 
            />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                style={{ opacity: data.tool === 'connection' ? 1 : 0, pointerEvents: data.tool === 'connection' ? 'all' : 'none' }}
                className="!size-4 !bg-blue-400 !border-2 !border-white dark:!border-zinc-950 !z-[100] !shadow-sm hover:!scale-125 transition-transform" 
            />

            {/* Content Area */}
            <div className="relative w-full h-full p-2 overflow-hidden rounded-2xl z-10">
                {children}
            </div>

            {/* Selection indicator dots */}
            {selected && (
                <>
                    <div className="absolute -top-1.5 -left-1.5 size-3 bg-primary rounded-full border-2 border-white dark:border-zinc-950 z-[60]" />
                    <div className="absolute -top-1.5 -right-1.5 size-3 bg-primary rounded-full border-2 border-white dark:border-zinc-950 z-[60]" />
                    <div className="absolute -bottom-1.5 -left-1.5 size-3 bg-primary rounded-full border-2 border-white dark:border-zinc-950 z-[60]" />
                    <div className="absolute -bottom-1.5 -right-1.5 size-3 bg-primary rounded-full border-2 border-white dark:border-zinc-950 z-[60]" />
                </>
            )}
        </div>
    );
}
