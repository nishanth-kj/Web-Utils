"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, Copy, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdsCard } from "@/components/shared/ads-card";
import { type Category, type Tool, TOOL_CATEGORIES, TOOLS } from "@/lib/constants/tools";
import Footer from "@/components/common/Footer";
import { cn } from "@/lib/utils";

export default function ToolsListingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    // Seeded as null (not Date.now()) so the server and the client's first
    // render agree; the real, ticking value only exists after mount.
    const [liveEpoch, setLiveEpoch] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const tick = () => setLiveEpoch(Math.floor(Date.now() / 1000));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const filteredTools = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return TOOLS.filter((tool: Tool) => {
            const matchesSearch =
                !query ||
                tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query);
            const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const groupedTools = useMemo(() => {
        return TOOL_CATEGORIES.map((category) => ({
            ...category,
            tools: filteredTools.filter((tool) => tool.category === category.id),
        })).filter((category) => category.tools.length > 0);
    }, [filteredTools]);

    const handleCopyEpoch = () => {
        if (liveEpoch === null) return;
        navigator.clipboard.writeText(String(liveEpoch));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setActiveCategory("all");
        searchInputRef.current?.focus();
    };

    return (
        <main className="flex h-full flex-col overflow-auto bg-background custom-scrollbar">
            <div className="relative isolate flex-1">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-muted/50 to-transparent"
                />

                <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
                    <section className="max-w-3xl">
                        <p className="text-sm font-medium text-muted-foreground">Web Utils</p>
                        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
                            Developer tools that stay in your browser.
                        </h1>
                        <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                            Format, convert, preview, and generate. A small collection of fast utilities
                            with no signup and nothing uploaded.
                        </p>
                    </section>

                    <div className="relative mt-8 max-w-2xl">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search tools..."
                            className="h-12 rounded-xl border-border bg-background pl-10 pr-4 text-base shadow-none md:text-[15px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search tools"
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span>{TOOLS.length} tools</span>
                        <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                        <span>No account required</span>
                        <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                        <button
                            type="button"
                            onClick={handleCopyEpoch}
                            title="Copy Unix epoch"
                            className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-accent"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            <span className="tabular-nums">{liveEpoch ?? "—"}</span>
                            {copied ? (
                                <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <Copy className="size-3 text-muted-foreground" />
                            )}
                            <span className="sr-only">{copied ? "Copied epoch" : "Copy epoch"}</span>
                        </button>
                    </div>

                    <div className="mt-10 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        <FilterChip
                            label="All"
                            active={activeCategory === "all"}
                            onClick={() => setActiveCategory("all")}
                        />
                        {TOOL_CATEGORIES.filter((cat: Category) =>
                            TOOLS.some((tool) => tool.category === cat.id)
                        ).map((cat: Category) => (
                            <FilterChip
                                key={cat.id}
                                label={cat.label}
                                active={activeCategory === cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                            />
                        ))}
                    </div>

                    <div className="mt-10 space-y-12 pb-8">
                        {groupedTools.length === 0 ? (
                            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
                                <p className="text-sm font-medium text-foreground">No tools match that search.</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try a different keyword, or reset the filters.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-5"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            groupedTools.map((category) => (
                                <section key={category.id} aria-labelledby={`category-${category.id}`}>
                                    <div className="mb-4 flex items-end justify-between gap-4">
                                        <div>
                                            <h2
                                                id={`category-${category.id}`}
                                                className="text-sm font-semibold tracking-tight text-foreground"
                                            >
                                                {category.label}
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {category.description}
                                            </p>
                                        </div>
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            {category.tools.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {category.tools.map((tool) => (
                                            <ToolCard key={tool.id} tool={tool} />
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>

                    <AdsCard
                        variant="horizontal"
                        className="mt-4 mb-8"
                        href="/about"
                        title="Most tools run entirely in your browser"
                        description="No signup required. Web Utils processes your data locally instead of sending it to a server."
                        ctaLabel="Read our approach"
                    />
                </div>
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </main>
    );
}

function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
                active
                    ? "border-foreground/15 bg-foreground text-background"
                    : "border-transparent bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {label}
        </button>
    );
}

function ToolCard({ tool }: { tool: Tool }) {
    const category = TOOL_CATEGORIES.find((item) => item.id === tool.category);

    return (
        <Link
            href={tool.href}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/15 hover:bg-accent/40"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-foreground">
                        <tool.icon className="size-4" />
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                        {tool.name}
                    </h3>
                </div>
                {tool.isNew ? (
                    <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background">
                        New
                    </span>
                ) : tool.status !== "Available" ? (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tool.status}
                    </span>
                ) : null}
            </div>
            <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {tool.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{category?.label}</span>
                <ArrowUpRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>
        </Link>
    );
}
