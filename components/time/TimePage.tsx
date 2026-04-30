"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { EpochConverter } from "./epoch-converter";

export function TimePage() {
    return (
        <main className="w-full h-full overflow-auto custom-scrollbar">
            <EpochConverter />
        </main>
    );
}
