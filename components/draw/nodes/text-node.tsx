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
            />
            <div className="relative w-full h-full flex items-center justify-center min-h-[40px]">
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
                    className="text-[18px] font-semibold text-center break-words outline-none transition-all duration-200 hover:bg-zinc-100/50 focus:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:focus:bg-zinc-800 rounded-lg px-3 py-1.5 min-w-[80px]"
                >
                    {text || 'Type something...'}
                </div>
            </div>
        </BaseNode>
    );
}
