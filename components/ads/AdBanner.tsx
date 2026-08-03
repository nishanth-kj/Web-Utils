"use client";

import { useEffect } from "react";

type AdBannerProps = {
    dataAdSlot: string;
    dataAdFormat?: string;
    dataAdLayoutKey?: string;
    dataFullWidthResponsive?: boolean;
    className?: string;
};

declare global {
    interface Window {
        adsbygoogle: any;
    }
}

export function AdBanner({
    dataAdSlot,
    dataAdFormat = "auto",
    dataAdLayoutKey,
    dataFullWidthResponsive = true,
    className = ""
}: AdBannerProps) {
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        try {
            // Slight delay to ensure DOM is ready
            timeoutId = setTimeout(() => {
                const ads = document.getElementsByClassName('adsbygoogle');
                const unfilledAds = Array.from(ads).filter(
                    (ad) => {
                        const isUnfilled = !ad.getAttribute('data-ad-status');
                        // Ensure the ad container is actually visible (not display: none or 0 width)
                        const hasWidth = ad.parentElement && ad.parentElement.offsetWidth > 0;
                        return isUnfilled && hasWidth;
                    }
                );
                
                // Only push if there are empty ad slots, prevents "already have ads" error
                if (unfilledAds.length > 0) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            }, 100);
        } catch (error) {
            console.error("AdSense error:", error);
        }
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={`overflow-hidden rounded-lg bg-muted/20 border border-border/50 min-h-[100px] min-w-[250px] w-full block ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: "block", width: "100%", height: "100%", minWidth: "250px", minHeight: "100px" }}
                data-ad-client="ca-pub-2215957287486434"
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                {...(dataAdLayoutKey ? { "data-ad-layout-key": dataAdLayoutKey } : {})}
                data-full-width-responsive={dataFullWidthResponsive.toString()}
            />
        </div>
    );
}
