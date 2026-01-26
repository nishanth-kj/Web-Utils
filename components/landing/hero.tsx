"use client";

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Layout } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-20 pb-16 px-4 md:pt-32 md:pb-24">
            <div className="max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Zap className="size-3" />
                    <span>The fastest way to preview code</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-300 dark:to-zinc-500">
                    Universal Previewer for <br className="hidden md:block" /> Modern Developers
                </h1>
                <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Beautifully format and instantly preview HTML, JSON, YAML, and React code.
                    All in one place, with zero configuration.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/view">
                        <Button size="lg" className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold group shadow-lg shadow-indigo-500/20">
                            Launch Viewer
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl font-bold">
                        View on GitHub
                    </Button>
                </div>
            </div>

            {/* Hero Visual */}
            <div className="max-w-5xl mx-auto mt-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="aspect-video rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full h-full rounded-xl bg-zinc-950 border border-white/5 p-4 font-mono text-sm text-indigo-400 overflow-hidden">
                            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                                <div className="size-2 rounded-full bg-red-500" />
                                <div className="size-2 rounded-full bg-yellow-500" />
                                <div className="size-2 rounded-full bg-green-500" />
                            </div>
                            <span className="text-zinc-500">{"// Welcome to Web Viewer"}</span><br />
                            <span className="text-purple-400">const</span> <span className="text-blue-400">app</span> = () =&gt; {"{"}<br />
                            &nbsp;&nbsp;<span className="text-purple-400">return</span> (<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-indigo-400">div</span> <span className="text-yellow-400">className</span>=<span className="text-green-400">"p-8 text-center"</span>&gt;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-indigo-400">h1</span>&gt;Hello World&lt;/<span className="text-indigo-400">h1</span>&gt;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-indigo-400">div</span>&gt;<br />
                            &nbsp;&nbsp;);<br />
                            {"}"};
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
