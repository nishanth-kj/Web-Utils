"use client";

import { useEffect, useState } from "react";

// TypeScript's DOM lib doesn't declare this Chrome-only Speculation Rules API yet.
type PrerenderableDocument = Document & { prerendering?: boolean };

// Speculation Rules can prerender this page in the background before the user
// ever navigates to it. Analytics and ads must not fire during that
// speculative render — only once the page is actually activated — or a page
// that's merely hovered (never visited) still counts as a pageview/impression.
// https://developer.chrome.com/docs/web-platform/prerender-pages#detect_when_a_page_is_prerendered_or_used_for_a_full_navigation
export function DeferOnPrerender({ children }: { children: React.ReactNode }) {
    const [canRender, setCanRender] = useState(
        () => typeof document === "undefined" || !(document as PrerenderableDocument).prerendering
    );

    useEffect(() => {
        if (canRender) return;
        const onActivate = () => setCanRender(true);
        document.addEventListener("prerenderingchange", onActivate, { once: true });
        return () => document.removeEventListener("prerenderingchange", onActivate);
    }, [canRender]);

    if (!canRender) return null;
    return <>{children}</>;
}
