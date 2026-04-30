"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {SidebarProvider} from "@/components/ui/sidebar";
import {SplashScreen} from "@/components/layout/splash-screen";
import {CommandMenu} from "@/components/layout/command-menu";
import {Navbar} from "@/components/layout/navbar";
import Footer from "@/components/common/Footer";
import {AppSidebar} from "@/components/layout/app-sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isToolPage = pathname !== "/";
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("hasSeenSplash_v1")) {
      setShowSplash(false);
    }
  }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem("hasSeenSplash_v1", "true");
  };

  return (
    <SidebarProvider>
      {showSplash && <SplashScreen onCompleteAction={handleSplashComplete} />}

      {isToolPage && <AppSidebar />}

        <div
            className={`transition-opacity duration-1000 flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-background ${
                showSplash ? "opacity-0" : "opacity-100"
            }`}
        >

            {!isToolPage && (
                <Navbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />
            )}

            <CommandMenu />

            <div className={`flex flex-1 ${isToolPage ? 'pt-0' : 'pt-16'} overflow-hidden w-full`}>
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