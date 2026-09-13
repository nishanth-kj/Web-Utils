"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

type AdBannerProps = {
    dataAdSlot: string;
    dataAdFormat?: string;
    dataAdLayoutKey?: string;
    dataFullWidthResponsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

export function AdBanner({
    dataAdSlot,
    dataAdFormat = "auto",
    dataAdLayoutKey,
    dataFullWidthResponsive = true,
    className = "",
    style,
}: AdBannerProps) {
    const isDev = process.env.NODE_ENV === "development";

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        try {
            // Delay slightly to ensure DOM is mounted and has layout dimensions
            timeoutId = setTimeout(() => {
                const ads = document.getElementsByClassName("adsbygoogle");
                const unfilledAds = Array.from(ads).filter((ad) => {
                    const isUnfilled =
                        !ad.getAttribute("data-ad-status") &&
                        !ad.getAttribute("data-adsbygoogle-status");
                    const hasWidth =
                        ad.parentElement && ad.parentElement.offsetWidth > 0;
                    return isUnfilled && hasWidth;
                });

                // Push for each unfilled ad slot
                unfilledAds.forEach(() => {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (err) {
                        console.error("AdSense push error:", err);
                    }
                });
            }, 100);
        } catch (error) {
            console.error("AdSense error:", error);
        }
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={cn("overflow-hidden rounded-lg w-full block", className)}>
            <ins
                className="adsbygoogle"
                style={{
                    display: "inline-block",
                    width: "100%",
                    height: "50px",
                    minWidth: "300px",
                    minHeight: "50px",
                    ...style,
                }}
                data-ad-client="ca-pub-2215957287486434"
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                {...(dataAdLayoutKey ? { "data-ad-layout-key": dataAdLayoutKey } : {})}
                data-full-width-responsive={dataFullWidthResponsive.toString()}
                {...(isDev ? { "data-adtest": "on" } : {})}
            />
        </div>
    );
}
