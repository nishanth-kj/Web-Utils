"use client";

import { AdBanner } from "@/components/ads/AdBanner";
import { ConsentGate } from "@/components/common/ConsentGate";
import { cn } from "@/lib/utils";

// The site's AdSense in-feed unit. To use a dedicated unit for a placement
// (e.g. an in-article unit), create it in AdSense and pass its slot id.
export const IN_FEED_AD = {
    slot: "3740953936",
    format: "fluid",
    layoutKey: "-gw-3+1f-3d+2z",
};

interface AdSlotProps {
    slot?: string;
    format?: string;
    layoutKey?: string;
    /** Space reserved before the ad fills, so the page doesn't shift when it does. */
    minHeight?: number;
    className?: string;
}

// Ads only render after the visitor accepts cookies (the AdSense script
// itself is consent-gated), are always labelled, and are meant for content
// areas below the tool, never next to its controls.
export function AdSlot({
    slot = IN_FEED_AD.slot,
    format = IN_FEED_AD.format,
    layoutKey = slot === IN_FEED_AD.slot ? IN_FEED_AD.layoutKey : undefined,
    minHeight = 120,
    className,
}: AdSlotProps) {
    return (
        <ConsentGate>
            <aside aria-label="Advertisement" className={cn("w-full", className)}>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Advertisement
                </p>
                <div style={{ minHeight }}>
                    <AdBanner dataAdSlot={slot} dataAdFormat={format} dataAdLayoutKey={layoutKey} />
                </div>
            </aside>
        </ConsentGate>
    );
}
