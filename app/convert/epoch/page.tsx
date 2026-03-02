"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { EpochConverter } from "@/components/convert/epoch-converter";

export default function EpochConverterPage() {
    return (
        <SidebarProvider>
            <div className="flex w-full h-full overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
                    <EpochConverter />
                </main>
            </div>
        </SidebarProvider>
    );
}
