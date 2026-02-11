"use client";

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-20 pb-20 px-4 md:pt-40 md:pb-32 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Zap className="size-3.5 fill-indigo-500" />
                    <span>The next-gen code toolkit</span>
                </div>

                <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tight mb-10 leading-[1.05] bg-clip-text text-transparent bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                    Precision Editing. <br className="hidden md:block" />
                    <span className="text-indigo-600 dark:text-indigo-400">Instant Visualization.</span>
                </h1>

                <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
                    Professional beautification and real-time visualization for HTML, JSON, YAML, and React.
                    Streamline your workflow with zero configuration.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <Link href="/view">
                        <Button size="lg" className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest group shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all">
                            Launch Viewer
                            <ArrowRight className="ml-3 size-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                        GitHub Repo
                    </Button>
                </div>
            </div>

            {/* Hero Visual - Professional Code Preview */}
            <div className="max-w-5xl mx-auto mt-24 px-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative aspect-video rounded-[2.5rem] bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5" />

                        {/* Fake Browser Toolbar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-zinc-700" />
                                <div className="size-3 rounded-full bg-zinc-700" />
                                <div className="size-3 rounded-full bg-zinc-700" />
                            </div>
                            <div className="px-4 py-1.5 rounded-lg bg-zinc-950/50 border border-white/5 text-[10px] font-bold text-zinc-500 tracking-wider">
                                web-utils-pro.app/view/react
                            </div>
                            <div className="size-3" />
                        </div>

                        <div className="absolute inset-0 top-[60px] flex p-8 gap-8">
                            {/* Editor Side */}
                            <div className="flex-1 rounded-2xl bg-zinc-950 border border-white/5 p-6 font-mono text-sm leading-relaxed overflow-hidden">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                    <div className="size-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">App.tsx</span>
                                </div>
                                <div className="space-y-1">
                                    <p><span className="text-indigo-400">import</span> React <span className="text-indigo-400">from</span> 'react';</p>
                                    <p><span className="text-purple-400">export const</span> <span className="text-blue-400">Hero</span> = () =&gt; {"{"}</p>
                                    <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                                    <p className="pl-8 text-zinc-400">&lt;<span className="text-indigo-400">section</span> <span className="text-yellow-400">className</span>=&quot;hero&quot;&gt;</p>
                                    <p className="pl-12 text-zinc-400">&lt;<span className="text-indigo-400">h1</span>&gt;Next-Gen Tools&lt;/<span className="text-indigo-400">h1</span>&gt;</p>
                                    <p className="pl-8 text-zinc-400">&lt;/<span className="text-indigo-400">section</span>&gt;</p>
                                    <p className="pl-4">);</p>
                                    <p>{"}"};</p>
                                </div>
                            </div>
                            {/* Preview Side */}
                            <div className="flex-1 rounded-2xl bg-white flex items-center justify-center p-8 shadow-inner shadow-black/5">
                                <div className="text-center">
                                    <div className="size-16 rounded-3xl bg-indigo-600 flex items-center justify-center mb-6 mx-auto shadow-xl shadow-indigo-200">
                                        <Zap className="size-8 text-white fill-white" />
                                    </div>
                                    <h2 className="text-zinc-900 font-black text-2xl tracking-tight mb-2">Next-Gen Tools</h2>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Live Preview Enabled</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
