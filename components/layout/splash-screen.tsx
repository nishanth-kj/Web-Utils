"use client";

import React from 'react';
import { Layout, Zap } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const container = React.useRef<HTMLDivElement>(null);
    const logoRef = React.useRef<HTMLDivElement>(null);
    const textRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(container.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete
                });
            }
        });

        tl.from(logoRef.current, {
            scale: 0.5,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)"
        })
        .from(textRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.5")
        .to(logoRef.current, {
            rotation: 360,
            duration: 2,
            ease: "power1.inOut"
        }, "-=0.2")
        .to(container.current, {
            delay: 0.5,
            duration: 0.5
        });

    }, { scope: container });

    return (
        <div 
            ref={container}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white select-none overflow-hidden"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
            
            <div className="relative flex flex-col items-center gap-6" style={{ perspective: "1000px" }}>
                <div 
                    ref={logoRef}
                    className="size-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-indigo-400/20"
                >
                    <Layout className="size-12" />
                </div>
                
                <div ref={textRef} className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2">
                        WEB UTILS <span className="text-indigo-500 italic">PRO</span>
                        <Zap className="size-6 text-indigo-400 animate-pulse" />
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">
                        The Ultimate Developer Workspace
                    </p>
                </div>
            </div>

            {/* Progress bar simulation */}
            <div className="absolute bottom-20 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes loading {
                        0% { width: 0%; transform: translateX(-100%); }
                        50% { width: 50%; transform: translateX(0%); }
                        100% { width: 100%; transform: translateX(100%); }
                    }
                ` }} />
                <div className="h-full bg-indigo-600" style={{ animation: "loading 3s ease-in-out infinite" }} />
            </div>
        </div>
    );
}
