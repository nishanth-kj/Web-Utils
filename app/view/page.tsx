"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewerContainer } from "@/components/view/viewer-container";
import { FloatingAd } from "@/components/floating-ad";

const DEFAULT_CONTENT = `<!-- Bootstrap Example -->
<div class="card shadow-lg border-0">
  <div class="card-body p-5">
    <h2 class="card-title text-primary mb-4">Welcome to Web Utils</h2>
    <p class="card-text lead">
      This is a premium view of your HTML with full Bootstrap 5.3 support.
    </p>
    <div class="d-flex gap-2">
      <button class="btn btn-primary rounded-pill px-4">Get Started</button>
      <button class="btn btn-outline-secondary rounded-pill px-4">Learn More</button>
    </div>
    
    <div class="mt-5">
      <div class="alert alert-info">
        Try switching formats in the sidebar or using the tabs above!
      </div>
    </div>
  </div>
</div>`;

export default function ViewPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
          <ViewerContainer
            initialContent={DEFAULT_CONTENT}
            initialFormat="html"
          />
          <FloatingAd />
        </main>
      </div>
    </SidebarProvider>
  );
}
