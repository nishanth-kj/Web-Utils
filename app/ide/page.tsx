"use client";

import React from 'react';
import { Blocks, Rocket, Hammer, Construction } from 'lucide-react';
import { FloatingAd } from "@/components/floating-ad";

export default function IDEPage() {
    return (
        <div className="flex w-full h-full overflow-hidden bg-zinc-950 flex-col items-center justify-center relative p-8 text-center">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 size-96 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 size-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

            <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-widest mb-8 animate-bounce">
                    <Construction className="size-4" />
                    <span>Under Development</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                    The Next-Gen <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Cloud IDE</span>
                </h1>

                <p className="text-zinc-400 text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto font-medium">
                    Building a browser-based client WASM type build IDE with real-time collaboration,
                    WASM-powered runtimes, and deep integration.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-indigo-500/30">
                        <Rocket className="size-8 text-indigo-400 mb-4 mx-auto" />
                        <h3 className="text-white font-bold text-sm mb-2">Fast Runtime</h3>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-black">WASM Powered</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-purple-500/30">
                        <Blocks className="size-8 text-purple-400 mb-4 mx-auto" />
                        <h3 className="text-white font-bold text-sm mb-2">Extensions</h3>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-black">Rich Ecosystem</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-pink-500/30">
                        <Hammer className="size-8 text-pink-400 mb-4 mx-auto" />
                        <h3 className="text-white font-bold text-sm mb-2">Cloud Build</h3>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-black">Instant Deploy</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                        Get Early Access
                    </button>
                    <button className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all active:scale-95">
                        Star Project
                    </button>
                </div>
            </div>

            <FloatingAd />
        </div>
    );
}
