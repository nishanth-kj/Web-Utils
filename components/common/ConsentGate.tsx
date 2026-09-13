"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_CHANGE_EVENT, getStoredConsent } from "@/lib/consent";

function subscribe(callback: () => void) {
    window.addEventListener(CONSENT_CHANGE_EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}

function getSnapshot() {
    return getStoredConsent() === "accepted";
}
function getServerSnapshot() {
    return false;
}

// Analytics/ads must not load until the visitor accepts the cookie banner —
// otherwise the banner is just a notice with no effect, which is the exact
// mismatch this component exists to close.
export function ConsentGate({ children }: { children: React.ReactNode }) {
    const accepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!accepted) return null;
    return <>{children}</>;
}
