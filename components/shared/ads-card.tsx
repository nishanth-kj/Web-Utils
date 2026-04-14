 "use client";

import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AdsCardProps {
    variant?: 'sidebar' | 'horizontal' | 'native';
    className?: string;
}

export function AdsCard({ variant = 'sidebar', className }: AdsCardProps) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border transition-all duration-300 group cursor-pointer",
            variant === 'sidebar' ? "p-4 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30" :
            variant === 'horizontal' ? "p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-xl shadow-indigo-500/20" :
            "p-3 bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900",
            className
        )}>
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Sparkles className="size-3" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Sponsor</span>
                    </div>
                    <ExternalLink className="size-3 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </div>

                <div className="space-y-1">
                    <h4 className={cn(
                        "font-bold text-sm tracking-tight leading-tight",
                        variant === 'horizontal' ? "text-white text-lg" : "text-zinc-900 dark:text-zinc-100"
                    )}>
                        {variant === 'horizontal' ? "Level up your workflow with Pro Features" : "Turbocharge your IDE"}
                    </h4>
                    <p className={cn(
                        "text-xs line-clamp-2 leading-relaxed",
                        variant === 'horizontal' ? "text-indigo-100" : "text-zinc-500 dark:text-zinc-400"
                    )}>
                        Join 10k+ developers using our advanced toolchain every day.
                    </p>
                </div>

                {variant === 'horizontal' && (
                    <button className="mt-2 px-6 py-2 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                        Upgrade Now
                    </button>
                )}
            </div>
        </div>
    );
}
