"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Settings,
    HelpCircle,
    ChevronRight,
    Search,
    X,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuAction,
    useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOOLS, TOOL_CATEGORIES, type Tool, type Category } from "@/lib/constants/tools";

export function AppSidebar() {
    const pathname = usePathname();
    const { setOpen, setOpenMobile, isMobile, open } = useSidebar();
    const [searchQuery, setSearchQuery] = React.useState("");
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const closeSidebar = React.useCallback(() => {
        setOpen(false);
        setOpenMobile(false);
    }, [setOpen, setOpenMobile]);

    const previousPathname = React.useRef(pathname);
    React.useEffect(() => {
        if (previousPathname.current === pathname) return;
        previousPathname.current = pathname;
        setOpen(false);
        setOpenMobile(false);
    }, [pathname, setOpen, setOpenMobile]);

    React.useEffect(() => {
        if (!open || isMobile) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, isMobile, setOpen]);

    React.useEffect(() => {
        if (open && !isMobile) {
            const frame = window.requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });
            return () => window.cancelAnimationFrame(frame);
        }
    }, [open, isMobile]);

    const visibleCategories = TOOL_CATEGORIES.map((cat: Category) => ({
        ...cat,
        tools: TOOLS.filter(
            (tool: Tool) =>
                tool.category === cat.id &&
                (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
    })).filter((cat) => cat.tools.length > 0);

    return (
        <>
            {!isMobile && open ? (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 dark:bg-black/40"
                    onClick={() => setOpen(false)}
                />
            ) : null}

            <Sidebar
                side="left"
                variant="sidebar"
                collapsible="offcanvas"
                className="z-50 border-r bg-background/95 backdrop-blur-xl duration-300 ease-out"
                style={{ top: "4rem", height: "calc(100svh - 4rem)" }}
            >
                <SidebarHeader className="gap-3 border-b border-sidebar-border px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <p className="px-1 text-sm font-semibold tracking-tight">Tools</p>
                        {!isMobile ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                onClick={closeSidebar}
                            >
                                <X className="size-4" />
                                <span className="sr-only">Close sidebar</span>
                            </Button>
                        ) : null}
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Filter tools..."
                            className="h-8 bg-muted/50 pl-8 text-xs shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </SidebarHeader>

                <SidebarContent className="flex-1 overflow-y-auto pt-1 custom-scrollbar">
                    {visibleCategories.length === 0 ? (
                        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                            No tools match “{searchQuery}”.
                        </p>
                    ) : (
                        visibleCategories.map((cat) => (
                            <SidebarGroup key={cat.id}>
                                <SidebarGroupLabel className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                    {cat.label}
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {cat.tools.map((tool: Tool) => {
                                            const hasSubOptions = tool.subOptions && tool.subOptions.length > 0;
                                            const isActive =
                                                pathname === tool.href ||
                                                (hasSubOptions &&
                                                    tool.subOptions!.some((sub) => pathname.startsWith(sub.href)));

                                            if (hasSubOptions) {
                                                return (
                                                    <Collapsible
                                                        key={tool.id}
                                                        asChild
                                                        defaultOpen={isActive}
                                                        className="group/collapsible"
                                                    >
                                                        <SidebarMenuItem>
                                                            <SidebarMenuButton
                                                                tooltip={tool.name}
                                                                isActive={isActive}
                                                                asChild
                                                                className="h-9 rounded-md"
                                                            >
                                                                <Link href={tool.href} onClick={closeSidebar}>
                                                                    <tool.icon className="size-4" />
                                                                    <span className="flex-1">{tool.name}</span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuAction
                                                                    showOnHover={false}
                                                                    className="mt-0.5"
                                                                >
                                                                    <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                                    <span className="sr-only">Toggle</span>
                                                                </SidebarMenuAction>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <SidebarMenuSub>
                                                                    {tool.subOptions!.map((sub) => {
                                                                        const isSubActive = pathname === sub.href;
                                                                        return (
                                                                            <SidebarMenuSubItem key={sub.name}>
                                                                                <SidebarMenuSubButton
                                                                                    asChild
                                                                                    isActive={isSubActive}
                                                                                >
                                                                                    <Link href={sub.href} onClick={closeSidebar}>
                                                                                        <span className="text-xs">
                                                                                            {sub.name}
                                                                                        </span>
                                                                                    </Link>
                                                                                </SidebarMenuSubButton>
                                                                            </SidebarMenuSubItem>
                                                                        );
                                                                    })}
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </SidebarMenuItem>
                                                    </Collapsible>
                                                );
                                            }

                                            return (
                                                <SidebarMenuItem key={tool.id}>
                                                    <SidebarMenuButton
                                                        tooltip={tool.name}
                                                        isActive={isActive}
                                                        asChild
                                                        className="h-9 rounded-md"
                                                    >
                                                        <Link href={tool.href} onClick={closeSidebar}>
                                                            <tool.icon className="size-4" />
                                                            <span className="flex-1">{tool.name}</span>
                                                            {tool.isNew ? (
                                                                <span className="rounded bg-foreground px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-background">
                                                                    New
                                                                </span>
                                                            ) : null}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))
                    )}
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border p-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Docs"
                                isActive={pathname === "/documentation" || pathname === "/docs"}
                                asChild
                                className="h-9 rounded-md"
                            >
                                <Link href="/documentation" onClick={closeSidebar}>
                                    <HelpCircle className="size-4" />
                                    <span>Documentation</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Settings"
                                isActive={pathname === "/settings"}
                                asChild
                                className="h-9 rounded-md"
                            >
                                <Link href="/settings" onClick={closeSidebar}>
                                    <Settings className="size-4" />
                                    <span>Settings</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    );
}
