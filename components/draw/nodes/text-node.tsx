"use client";

import React from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { BaseNode } from './base-node';

export function TextNode(props: NodeProps) {
    const { data, selected } = props;
    const { text, color, opacity } = data;

    return (
        <BaseNode {...props}>
            <NodeResizer 
                color="#3b82f6" 
                isVisible={selected} 
                minWidth={30} 
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
            <div className="relative w-full h-full flex items-center justify-center p-2">
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
                    style={{ 
                        color: color || '#1e1e1e',
                        opacity: (opacity ?? 100) / 100
                    }}
                    className="w-full h-full flex items-center justify-center overflow-hidden text-[20px] font-medium text-center break-words outline-none transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 focus:bg-white/90 dark:focus:bg-zinc-900/90 focus:shadow-xl focus:ring-1 focus:ring-primary/20 backdrop-blur-sm rounded-xl px-4 py-2"
                >
                    {text || 'Type something...'}
                </div>
            </div>
        </BaseNode>
    );
}
