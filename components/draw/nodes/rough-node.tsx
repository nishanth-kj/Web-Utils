"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useStore } from 'reactflow';

// Type for roughjs
interface RoughCanvas {
    generator: any;
    draw: (drawable: any) => void;
}

import { BaseNode } from './base-node';

const selector = (s: any) => s.nodeInternals;

export function RoughNode(props: NodeProps) {
    const { id, data, selected } = props;
    const { type, color, backgroundColor, strokeWidth, strokeStyle, roughness, opacity, text } = data;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Get dimensions from store for real-time resizing feedback
    const nodeInternals = useStore(selector);
    const node = nodeInternals.get(id);
    const width = node?.width || 150;
    const height = node?.height || 100;

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // @ts-ignore
        const rough = window.rough;
        if (!rough) return;

        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gen = rc.generator;
        const options = {
            stroke: color || '#1e1e1e',
            fill: backgroundColor && backgroundColor !== 'transparent' ? backgroundColor : undefined,
            strokeWidth: strokeWidth || 2,
            roughness: roughness ?? 1,
            strokeLineDash: strokeStyle === 'dashed' ? [8, 8] : strokeStyle === 'dotted' ? [2, 2] : undefined,
        };

        let drawable;
        const padding = 5;
        const w = Math.max(1, width - padding * 2);
        const h = Math.max(1, height - padding * 2);

        switch (type) {
            case 'circle':
                drawable = gen.ellipse(width / 2, height / 2, w, h, options);
                break;
            case 'diamond':
                drawable = gen.polygon([
                    [width / 2, padding], 
                    [width - padding, height / 2], 
                    [width / 2, height - padding], 
                    [padding, height / 2]
                ], options);
                break;
            default:
                drawable = gen.rectangle(padding, padding, w, h, options);
        }

        rc.draw(drawable);
    }, [type, color, backgroundColor, strokeWidth, strokeStyle, roughness, opacity, width, height]);

    // Fallback if roughjs is not loaded
    const [roughLoaded, setRoughLoaded] = React.useState(false);
    React.useEffect(() => {
        // @ts-ignore
        if (window.rough) setRoughLoaded(true);
        else {
            const interval = setInterval(() => {
                // @ts-ignore
                if (window.rough) {
                    setRoughLoaded(true);
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <BaseNode {...props}>
            <NodeResizer 
                color="#3b82f6" 
                isVisible={selected} 
                minWidth={20} 
                minHeight={20} 
                handleStyle={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    border: '2px solid #3b82f6',
                    borderRadius: '3px',
                    margin: '-2px'
                }}
                lineStyle={{
                    borderWidth: '2px',
                    opacity: 0.2
                }}
            />
            <div className="relative w-full h-full">
                {!roughLoaded ? (
                    <div 
                        className="absolute inset-[5px] border-2 rounded-lg"
                        style={{ 
                            borderColor: color || '#1e1e1e', 
                            backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : 'transparent',
                            opacity: (opacity ?? 100) / 100,
                            borderStyle: strokeStyle === 'dashed' ? 'dashed' : strokeStyle === 'dotted' ? 'dotted' : 'solid',
                            borderWidth: strokeWidth || 2,
                            borderRadius: type === 'circle' ? '50%' : type === 'diamond' ? '0' : '8px',
                            transform: type === 'diamond' ? 'rotate(45deg) scale(0.7)' : 'none'
                        }}
                    />
                ) : (
                    <canvas 
                        ref={canvasRef} 
                        width={width} 
                        height={height} 
                        style={{ opacity: (opacity ?? 100) / 100 }}
                        className="w-full h-full"
                    />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                            data.onTextChange?.(e.currentTarget.textContent || '');
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                e.currentTarget.blur();
                            }
                        }}
                        className="text-[14px] font-bold text-center break-words outline-none transition-all duration-200 hover:bg-white/40 focus:bg-white/80 dark:hover:bg-zinc-800/40 dark:focus:bg-zinc-800/80 rounded-md px-2 py-1 min-w-[20px]"
                    >
                        {text}
                    </div>
                </div>
            </div>
        </BaseNode>
    );
}
