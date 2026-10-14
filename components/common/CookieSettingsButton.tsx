"use client";

import { clearStoredConsent } from "@/lib/consent";

export function CookieSettingsButton({ className }: { className?: string }) {
    return (
        <button type="button" onClick={clearStoredConsent} className={className}>
            Cookie settings
        </button>
    );
}
