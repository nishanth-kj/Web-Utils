"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Info, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
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
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:bg-muted rounded-md p-1 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We use cookies to personalize content and ads, to provide social media features and to analyze our traffic.{" "}
          <Link href="/privacy" className="text-primary hover:underline font-medium">
            Learn more
          </Link>.
        </p>
        <button
          onClick={handleAccept}
          className="w-full mt-1 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
