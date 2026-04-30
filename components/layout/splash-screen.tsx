"use client";

import React from 'react';
import {Command} from 'lucide-react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';

export function SplashScreen({ onCompleteAction }: { onCompleteAction: () => void }) {
    const container = React.useRef<HTMLDivElement>(null);
    const logoRef = React.useRef<HTMLDivElement>(null);
    const textRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(container.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.inOut",
                    onComplete: onCompleteAction
                });
            }
        });

        tl.from(logoRef.current, {
            scale: 0.5,
            opacity: 0,
            duration: 0.4,
            ease: "back.out(1.7)"
        })
        .from(textRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: "power3.out"
        }, "-=0.2")
        .to(logoRef.current, {
            rotation: 360,
            duration: 0.6,
            ease: "power1.inOut"
        }, "-=0.1")
        .to(container.current, {
            delay: 0.1,
            duration: 0.2
        });

    }, { scope: container });

    return (
        <div 
            ref={container}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-foreground/5 via-transparent to-transparent opacity-100" />
            
            <div className="relative flex flex-col items-center gap-8" style={{ perspective: "1000px" }}>
                <div 
                    ref={logoRef}
                    className="size-20 rounded-2xl bg-secondary flex items-center justify-center shadow-xl border border-border"
                >
                    <Command className="size-10 text-foreground" />
                </div>
                
                <div ref={textRef} className="text-center flex flex-col items-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Web Utils
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium tracking-wide mt-2">
                        The Developer Workspace
                    </p>

                    {/* Progress bar simulation correctly placed under text */}
                    <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-8 relative">
                        <style dangerouslySetInnerHTML={{ __html: `
                            @keyframes loading {
                                0% { left: -100%; width: 100%; }
                                50% { left: 0%; width: 50%; }
                                100% { left: 100%; width: 100%; }
                            }
                        ` }} />
                        <div className="absolute top-0 bottom-0 bg-foreground rounded-full" style={{ animation: "loading 0.8s ease-in-out infinite" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
