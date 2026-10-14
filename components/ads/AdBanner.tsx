"use client";

import React, { useEffect, useRef } from "react";
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
    const insRef = useRef<HTMLModElement>(null);
    const requested = useRef(false);

    useEffect(() => {
        // One push per <ins>, from the instance that owns it. Pushing once per
        // unfilled slot on every mount over-requests as soon as two banners
        // share a page, and StrictMode re-runs effects in development.
        // The short delay lets the slot get its layout width first.
        const timeoutId = setTimeout(() => {
            const ins = insRef.current;
            if (!ins || requested.current || ins.getAttribute("data-adsbygoogle-status")) return;
            requested.current = true;
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error("AdSense push error:", err);
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={cn("overflow-hidden rounded-lg w-full block", className)}>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{
                    display: "block",
                    width: "100%",
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
