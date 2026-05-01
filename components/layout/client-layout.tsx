"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {SidebarProvider, SidebarTrigger, useSidebar} from "@/components/ui/sidebar";
import {SplashScreen} from "@/components/layout/splash-screen";
import {Navbar} from "@/components/layout/navbar";
import {AppSidebar} from "@/components/layout/app-sidebar";

function LayoutContent({ children, isHomePage, showSplash }: { children: React.ReactNode, isHomePage: boolean, showSplash: boolean }) {
    const { isMobile } = useSidebar();
    
    return (
        <div
            className={`transition-opacity duration-1000 flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-background ${
                showSplash ? "opacity-0" : "opacity-100"
            }`}
        >
            {isHomePage && <Navbar />}
            
            {isMobile && !isHomePage && (
                <div className="fixed top-4 right-4 z-[200]">
                    <SidebarTrigger className="size-10 bg-background/80 backdrop-blur border shadow-md rounded-xl" />
                </div>
            )}

            <div className={`flex flex-1 ${isHomePage ? 'pt-16' : 'pt-0'} overflow-hidden w-full`}>
                <div className="flex-1 h-full overflow-hidden relative flex flex-col">
                    <div className="flex-1 relative overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("hasSeenSplash_v1");
    }
    return true;
  });

    const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem("hasSeenSplash_v1", "true");
  };

  const isDrawPage = pathname.startsWith("/draw");

  return (
    <SidebarProvider defaultOpen={!isDrawPage}>
      {showSplash && <SplashScreen onCompleteAction={handleSplashComplete} />}
      <AppSidebar />
      <LayoutContent isHomePage={isHomePage} showSplash={showSplash}>
          {children}
      </LayoutContent>
    </SidebarProvider>
  );
}