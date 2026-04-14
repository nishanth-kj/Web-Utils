 "use client";

import React, { useState } from 'react';
import { 
    ChevronRight, 
    ChevronDown, 
    Copy,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const JsonNode = ({ data, depth = 0, path = "", label }: { data: unknown, depth?: number, path: string, label?: string }) => {
    const [isExpanded, setIsExpanded] = useState(depth < 2);
    const type = typeof data;
    const isObject = data !== null && type === 'object';
    const isArray = Array.isArray(data);

    const toggle = () => setIsExpanded(!isExpanded);

    const copyPath = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(path);
        toast.success(`Path copied: ${path}`);
    };

    if (isObject) {
        const objData = data as Record<string, unknown>;
        const keys = Object.keys(objData);
        const isEmpty = keys.length === 0;

        return (
            <div className="space-y-1">
                <div 
                    className="flex items-center gap-1.5 group cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
                    onClick={toggle}
                >
                    <div className="flex items-center gap-0.5">
                        {!isEmpty && (
                            isExpanded ? <ChevronDown className="size-3.5 text-zinc-400" /> : <ChevronRight className="size-3.5 text-zinc-400" />
                        )}
                        {isEmpty && <div className="size-3.5" />}
                    </div>
                    
                    {label && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">{label}:</span>
                    )}
                    
                    <span className="text-zinc-400 text-[10px] font-mono">
                        {isArray ? `Array[${keys.length}]` : `Object{${keys.length}}`}
                    </span>

                    <button 
                        onClick={copyPath}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-500 transition-opacity"
                        title="Copy property path"
                    >
                        <Copy className="size-3" />
                    </button>
                </div>

                {isExpanded && !isEmpty && (
                    <div className="ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1">
                        {keys.map(key => (
                            <JsonNode 
                                key={key} 
                                data={objData[key]} 
                                depth={depth + 1} 
                                path={path ? `${path}.${key}` : key} 
                                label={key}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const numValue = Number(data);

    // Primitive values
    return (
        <div className="flex items-center gap-2 px-2 py-0.5 group hover:bg-zinc-100 dark:hover:bg-white/5 rounded transition-colors">
            <div className="size-3.5" />
            {label && (
                <span className="text-zinc-900 dark:text-zinc-200 font-medium text-xs">{label}:</span>
            )}
            <span className={cn(
                "text-xs font-mono break-all",
                type === 'string' ? "text-emerald-600 dark:text-emerald-400" :
                type === 'number' ? "text-blue-600 dark:text-blue-400" :
                type === 'boolean' ? "text-amber-600 dark:text-amber-400" :
                "text-zinc-500"
            )}>
                {type === 'string' ? `"${data}"` : String(data)}
            </span>
            
            {/* Special "Smart Detection" for timestamps (Epoch) */}
            {type === 'number' && numValue > 1000000000 && numValue < 3000000000 && (
                <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20 py-0 h-4 px-1.5 animate-pulse cursor-pointer">
                    Epoch Detected
                </Badge>
            )}

            <button 
                onClick={copyPath}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-500 transition-opacity"
                title="Copy property path"
            >
                <Copy className="size-3" />
            </button>
        </div>
    );
};

export function JsonTreeViewer({ data }: { data: unknown }) {
    if (!data) return <div className="p-8 text-center text-zinc-500">No JSON data to display</div>;

    return (
        <div className="p-4 font-mono select-text bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <JsonNode data={data} path="" />
        </div>
    );
}
