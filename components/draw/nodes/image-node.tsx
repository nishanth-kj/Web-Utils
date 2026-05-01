"use client";

import React, { useState } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { BaseNode } from './base-node';
import { ImageIcon, Upload } from 'lucide-react';

export function ImageNode(props: NodeProps) {
    const { data, selected } = props;
    const [image, setImage] = useState<string | null>(data.url || null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImage(base64String);
                data.onImageChange?.(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <BaseNode {...props}>
            <NodeResizer 
                color="#3b82f6" 
                isVisible={selected} 
                minWidth={100} 
                minHeight={100} 
                keepAspectRatio
            />
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden group">
                {image ? (
                    <img 
                        src={image} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                        style={{ opacity: (data.opacity ?? 100) / 100 }}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <ImageIcon className="size-8" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                    </div>
                )}

                {/* Upload Overlay */}
                <label className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${!image ? 'opacity-100 bg-transparent' : ''}`}>
                    <Upload className="text-white size-6" />
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={onFileChange}
                    />
                </label>
            </div>
        </BaseNode>
    );
}
