"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";

export function FloatingAd() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show the ad after 5 seconds on page load
        const initialDelay = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        // Automatically reopen the ad every 2 minutes (120,000 ms)
        const interval = setInterval(() => {
            setIsVisible(true);
        }, 120000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="relative bg-background border rounded-xl shadow-2xl w-[500px] max-w-[calc(100vw-2rem)]">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-6 bg-background/40 hover:bg-background/90 backdrop-blur-md border border-border/50 shadow-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 z-20"
                    aria-label="Close Ad"
                >
                    <X className="size-3.5" />
                </button>
                <AdBanner
                    dataAdSlot="3740953936"
                    dataAdFormat="fluid"
                    dataAdLayoutKey="-gw-3+1f-3d+2z"
                />
            </div>
        </div>
    );
}
