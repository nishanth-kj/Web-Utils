"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
// import { FloatingAd } from "@/components/ads/FloatingAd";

// The splash only runs on a visitor's first load, so its GSAP dependency
// stays out of the bundle every other visit.
const SplashScreen = dynamic(
    () => import("@/components/layout/splash-screen").then((m) => m.SplashScreen),
    { ssr: false }
);

// The draw canvas wants the full viewport with no chrome, so it keeps its own
// floating sidebar trigger instead of the standard top navbar.
function LayoutContent({
    children,
    isImmersivePage,
    showSplash,
}: {
    children: React.ReactNode;
    isImmersivePage: boolean;
    showSplash: boolean;
}) {
    // On immersive pages the open sidebar renders its own logo/close button in
    // this same top-left corner, on top of this floating trigger (higher
    // z-index) — leaving it visible underneath intercepts the very next click,
    // which looks like the button "doesn't move back" when trying to close it.
    const { open } = useSidebar();

    return (
        <div
            className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-background transition-opacity duration-300 ${showSplash ? "opacity-0" : "opacity-100"
                }`}
        >
            {isImmersivePage ? (
                !open && (
                    <div className="fixed top-4 left-4 z-40">
                        <SidebarTrigger className="size-10 rounded-xl border bg-background/80 shadow-md backdrop-blur" />
                    </div>
                )
            ) : (
                <Navbar />
            )}

            <div className={`flex flex-1 overflow-hidden w-full ${isImmersivePage ? "pt-0" : "pt-16"}`}>
                <div className="relative flex h-full flex-1 flex-col min-h-0 overflow-hidden">
                    <div id="main-content" tabIndex={-1} className="relative flex-1 min-h-0 h-full flex flex-col overflow-hidden outline-none">
                        {children}
                        {/* <FloatingAd /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isImmersivePage = pathname.startsWith("/draw");
    const [showSplash, setShowSplash] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("hasSeenSplash_v1")) return;
        const frame = window.requestAnimationFrame(() => setShowSplash(true));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    const handleSplashComplete = () => {
        setShowSplash(false);
        localStorage.setItem("hasSeenSplash_v1", "true");
    };

    return (
        <SidebarProvider defaultOpen={false}>
            {showSplash && <SplashScreen onCompleteAction={handleSplashComplete} />}
            <AppSidebar />
            <LayoutContent isImmersivePage={isImmersivePage} showSplash={showSplash}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}
