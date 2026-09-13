"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { Info, X } from "lucide-react";
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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[999] p-4 bg-card border border-border shadow-2xl rounded-xl transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Info className="size-4 text-primary" />
            Cookie Consent
          </div>
          <button
            onClick={() => handleChoice(false)}
            className="text-muted-foreground hover:bg-muted rounded-md p-1 transition-colors"
            aria-label="Dismiss and decline"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Web Utils tools run entirely in your browser — nothing you paste or upload is sent to us. We&apos;d like to use
          analytics and ad cookies to support the site.{" "}
          <Link href="/privacy" className="text-primary hover:underline font-medium">
            Learn more
          </Link>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleChoice(false)}
            className="flex-1 py-2 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/70 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
