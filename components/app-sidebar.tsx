"use client";

import * as React from "react";
import {
    Settings,
    HelpCircle,
    Layout,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    FileEdit,
    FileSearch,
    Type,
    X,
    Sidebar as SidebarIcon,
    Braces,
    Globe,
    Box,
    FileCode,
    StickyNote,
    Table,
    Image
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
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AppSidebar() {
    const { toggleSidebar, state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar
            side="left"
            collapsible="icon"
            className="fixed top-16 left-0 h-[calc(100vh-64px)] border-r border-sidebar-border transition-all duration-500 ease-in-out group/sidebar [&_[data-sidebar=sidebar]]:overflow-visible [&_[data-sidebar=sidebar]]:bg-sidebar/80 [&_[data-sidebar=sidebar]]:backdrop-blur-xl"
        >

            {/* Toggle Button "On the Line" - Placed Between Header and Content */}
            <div className="absolute right-0 top-[40px] -translate-y-1/2 translate-x-1/2 z-[100] transition-all duration-500">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="size-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer shadow-indigo-500/10"
                >
                    {isCollapsed ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        <ChevronLeft className="size-4" />
                    )}
                </Button>
            </div>

            <SidebarContent className="flex-1 overflow-y-auto overflow-x-visible pt-2 custom-scrollbar">
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.05);
                        border-radius: 10px;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.05);
                    }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.1);
                    }
                    .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                    }
                `}</style>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Formats</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 px-2 transition-all">
                            {[
                                { id: "html", label: "HTML Preview", icon: Globe, tooltip: "HTML View" },
                                { id: "json", label: "JSON Tool", icon: Braces, tooltip: "JSON View" },
                                { id: "yaml", label: "YAML View", icon: StickyNote, tooltip: "YAML View" },
                                { id: "react", label: "React Code", icon: Box, tooltip: "React Code" },
                                { id: "markdown", label: "Markdown View", icon: FileEdit, tooltip: "Markdown View" },
                                { id: "xml", label: "XML Viewer", icon: FileCode, tooltip: "XML View" },
                                { id: "svg", label: "SVG Render", icon: Image, tooltip: "SVG Render" },
                                { id: "csv", label: "CSV Viewer", icon: Table, tooltip: "CSV View" },
                            ].map((item) => (
                                <SidebarMenuItem key={item.label} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                    <Link href={`/view/${item.id}`} className="w-full">
                                        <SidebarMenuButton tooltip={item.tooltip} className="rounded-lg h-10 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full">
                                            <item.icon className="size-4" />
                                            <span className="font-medium">{item.label}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 group-data-[collapsible=icon]:px-0">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton tooltip="Docs" className="rounded-lg h-10">
                            <HelpCircle className="size-4" />
                            <span className="font-medium">Documentation</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton tooltip="Settings" className="rounded-lg h-10">
                            <Settings className="size-4" />
                            <span className="font-medium">Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
