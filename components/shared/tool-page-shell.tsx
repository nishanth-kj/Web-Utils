import React from "react";
import { cn } from "@/lib/utils";

// Tool pages need to fill the viewport like an app (editor panes, canvases,
// resizable splits) while still letting SEO/how-to content live below the
// fold. The tool slot keeps a fixed, viewport-sized box (so nothing inside it
// shrinks to fit extra content) and the outer wrapper owns the scrolling, so
// scrolling past the tool reveals whatever is passed as `children`.
export function ToolPageShell({
    toolSlot,
    children,
    className,
}: {
    toolSlot: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex h-full w-full flex-col overflow-y-auto custom-scrollbar", className)}>
            <div className="relative h-full min-h-[560px] w-full shrink-0">{toolSlot}</div>
            {children}
        </div>
    );
}
