"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { CONSENT_CHANGE_EVENT, getStoredConsent, setStoredConsent } from "@/lib/consent";

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// No decision can be read during SSR/hydration, so assume one has already
// been made (banner hidden) until the client snapshot says otherwise — this
// avoids flashing the banner on every load for returning visitors.
function getSnapshot() {
  return getStoredConsent() === null;
}
function getServerSnapshot() {
  return false;
}

export function CookieConsent() {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleChoice = (accepted: boolean) => {
    setStoredConsent(accepted ? "accepted" : "declined");
  };

  if (!isVisible) return null;

  return (
    // Kept deliberately compact — on short mobile viewports this sits over
    // page content (it's `fixed`), so extra height directly risks covering
    // a tool's primary action button.
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-[999] p-3 bg-card border border-border shadow-2xl rounded-xl transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-5">
      <div className="flex flex-col gap-2.5">
        <p className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <Info className="size-4 shrink-0 mt-0.5 text-primary" />
          <span>
            Tools run in your browser — nothing you paste is uploaded. We use cookies for analytics and ads;{" "}
            <Link href="/privacy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>.
          </span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleChoice(false)}
            className="flex-1 py-1.5 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/70 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="flex-1 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
