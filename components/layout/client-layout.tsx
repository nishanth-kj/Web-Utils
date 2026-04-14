"use client";

import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SplashScreen } from "@/components/layout/splash-screen";
import { CommandMenu } from "@/components/layout/command-menu";
import { Navbar } from "@/components/layout/navbar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <SidebarProvider>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={`transition-opacity duration-1000 flex flex-col h-screen overflow-hidden bg-background ${showSplash ? "opacity-0" : "opacity-100"}`}>
        <Navbar />
        <CommandMenu />
        <div className="flex flex-1 pt-12 overflow-hidden overflow-x-visible">
          <AppSidebar />
          <div className="flex-1 h-full overflow-hidden relative">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
