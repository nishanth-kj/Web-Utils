"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {SidebarProvider} from "@/components/ui/sidebar";
import {SplashScreen} from "@/components/layout/splash-screen";
import {Navbar} from "@/components/layout/navbar";
import {AppSidebar} from "@/components/layout/app-sidebar";

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

  return (
    <SidebarProvider>
      {showSplash && <SplashScreen onCompleteAction={handleSplashComplete} />}

      <AppSidebar />

        <div
            className={`transition-opacity duration-1000 flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-background ${
                showSplash ? "opacity-0" : "opacity-100"
            }`}
        >

            {isHomePage && (
                <Navbar />
            )}

            <div className={`flex flex-1 ${isHomePage ? 'pt-16' : 'pt-0'} overflow-hidden w-full`}>
          <div className="flex-1 h-full overflow-hidden relative flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}