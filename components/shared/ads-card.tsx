"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdsCardProps {
    variant?: "sidebar" | "horizontal" | "native";
    className?: string;
    href: string;
    eyebrow?: string;
    title: string;
    description: string;
    ctaLabel?: string;
}

export function AdsCard({
    variant = "sidebar",
    className,
    href,
    eyebrow = "Web Utils",
    title,
    description,
    ctaLabel,
}: AdsCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group relative block overflow-hidden rounded-2xl border transition-colors",
                variant === "sidebar"
                    ? "border-border bg-muted/40 p-4 hover:bg-muted/70"
                    : variant === "horizontal"
                      ? "border-border bg-muted/30 p-5 hover:bg-muted/50 sm:p-6"
                      : "border-border bg-card p-3 hover:bg-accent/40",
                className
            )}
        >
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <ShieldCheck className="size-3.5" />
                        <span className="text-[11px] font-medium uppercase tracking-wider">
                            {eyebrow}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                            {title}
                        </h4>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
                {ctaLabel ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {ctaLabel}
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                ) : (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                )}
            </div>
        </Link>
    );
}
