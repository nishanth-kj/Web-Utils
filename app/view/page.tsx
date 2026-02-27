"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ViewerContainer } from "@/components/view/viewer-container";
import { DEFAULT_CONTENT } from "@/data/default-content";

export default function ViewPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
          <ViewerContainer
            initialContent={DEFAULT_CONTENT.html}
            initialFormat="html"
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
