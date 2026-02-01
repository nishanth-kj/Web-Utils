import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewerContainer } from "@/components/view/viewer-container";
import { FloatingAd } from "@/components/floating-ad";
import { Format } from "@/types";
import { DEFAULT_CONTENT } from "@/lib/data";

export function generateStaticParams() {
    return [
        { type: 'html' },
        { type: 'json' },
        { type: 'yaml' },
        { type: 'react' },
        { type: 'markdown' },
        { type: 'xml' },
        { type: 'svg' },
        { type: 'csv' },
    ];
}

export default async function ViewPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const format = type as Format;
    const content = (DEFAULT_CONTENT as Record<string, string>)[format] || "";

    return (
        <SidebarProvider>
            <div className="flex w-full h-full overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
                    <ViewerContainer
                        initialContent={content}
                        initialFormat={format}
                    />
                    <FloatingAd />
                </main>
            </div>
        </SidebarProvider>
    );
}
