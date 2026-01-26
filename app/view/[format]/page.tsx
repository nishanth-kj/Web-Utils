"use client";

import { use } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewerContainer } from "@/components/viewer/viewer-container";
import { FloatingAd } from "@/components/floating-ad";
import { DEFAULT_CONTENT } from "@/data/formats";

export default function FormatViewPage({ params }: { params: Promise<{ format: string }> }) {
  const { format } = use(params);

  // Normalize format name
  const formatKey = format.toLowerCase().replace(/view|viewer|tool|preview|code|render/g, '') as keyof typeof DEFAULT_CONTENT;
  const initialContent = DEFAULT_CONTENT[formatKey] || DEFAULT_CONTENT.html;

  // Explicit mapping to valid Format type
  const viewerFormat = (formatKey === 'markdown') ? 'markdown' :
    (formatKey === 'svg') ? 'svg' :
      (formatKey === 'csv') ? 'csv' :
        (formatKey === 'xml') ? 'xml' :
          (formatKey === 'json') ? 'json' :
            (formatKey === 'yaml') ? 'yaml' :
              (formatKey === 'react') ? 'react' : 'html';

  return (
    <SidebarProvider>
      <div className="flex w-full h-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
          <ViewerContainer
            initialContent={initialContent}
            initialFormat={viewerFormat as any}
          />
          <FloatingAd />
        </main>
      </div>
    </SidebarProvider>
  );
}
