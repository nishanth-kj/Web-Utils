"use client";

import React from 'react';
import { Globe, Code2, Zap } from "lucide-react";

export function Features() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
                            <Globe className="size-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Live Preview</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">Instant visual feedback for HTML and SVG code with full support for modern CSS frameworks.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                            <Code2 className="size-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Smart Formatting</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">Automatically beautify JSON, YAML, and XML files with intelligent parsing and validation.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
                            <Zap className="size-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Extreme Speed</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">Built with performance in mind. Lightweight, responsive, and ready whenever you are.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
