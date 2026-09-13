"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Moon, Sun, Command } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { JsonLdSchema } from "@/components/seo/Schema";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { AdBanner } from "@/components/ads/AdBanner";

export function Navbar() {
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();
    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/80 bg-background/80 backdrop-blur-xl">
            <div className="flex h-full w-full items-center justify-between gap-3 px-3 sm:px-4">
                <div className="flex shrink-0 items-center gap-2.5">
                    <SidebarTrigger className="size-9 shrink-0 text-muted-foreground hover:text-foreground" />

                    <Link
                        href="/"
                        className="flex shrink-0 min-w-0 items-center gap-2.5 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-foreground">
                            <Command className="size-4" />
                        </div>
                        <span className="truncate text-[15px] font-semibold tracking-tight">
                            Web Utils
                        </span>
                    </Link>

                    {breadcrumbs.length > 0 && (
                        <JsonLdSchema
                            type="BreadcrumbList"
                            data={{
                                itemListElement: [{ label: "Home", href: "/" }, ...breadcrumbs].map(
                                    (crumb, index) => ({
                                        "@type": "ListItem",
                                        position: index + 1,
                                        name: crumb.label,
                                        item: `https://webutils.site${crumb.href}`,
                                    })
                                ),
                            }}
                        />
                    )}

                    {breadcrumbs.length > 0 && (
                        <nav
                            aria-label="Breadcrumb"
                            className="ml-1 hidden min-w-0 items-center gap-1 text-sm md:flex"
                        >
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={crumb.href}>
                                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                                        {isLast ? (
                                            <span className="truncate font-medium text-foreground">
                                                {crumb.label}
                                            </span>
                                        ) : (
                                            <Link
                                                href={crumb.href}
                                                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* Desktop Ad Banner - Perfectly Centered in Navbar */}
                <div className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex">
                    <div className="relative flex h-[50px] w-[320px] lg:w-[468px] items-center justify-center overflow-hidden">
                        <AdBanner
                            dataAdSlot="3740953936"
                            dataAdFormat="auto"
                            dataFullWidthResponsive={false}
                            className="h-[50px] w-full border-none bg-transparent"
                            style={{ height: "50px", width: "100%" }}
                        />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    <CommandMenu />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="relative size-9"
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    >
                        <Sun className="size-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute size-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
