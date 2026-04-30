"use client";

import * as React from "react";
import {
    Settings,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Command,
    Home,
    Search
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS, TOOL_CATEGORIES, type Tool, type Category } from "@/lib/constants/tools";

export function AppSidebar() {
    const pathname = usePathname();
    const { toggleSidebar, state } = useSidebar();
    const [searchQuery, setSearchQuery] = React.useState("");
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar
            side="left"
            collapsible="offcanvas"
            className="fixed top-0 left-0 h-screen border-r border-sidebar-border transition-all duration-500 ease-in-out group/sidebar [&_[data-sidebar=sidebar]]:overflow-visible [&_[data-sidebar=sidebar]]:bg-sidebar/80 [&_[data-sidebar=sidebar]]:backdrop-blur-xl"
        >

            {/* Toggle Button "On the Line" - Placed Between Header and Content */}
            <div className={`absolute right-0 bottom-12 z-[100] transition-all duration-500 ${isCollapsed ? 'translate-x-full' : 'translate-x-1/2'}`}>
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

            <SidebarHeader className="border-b border-sidebar-border px-4 py-4 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                    <Link href="/" className="flex items-center space-x-2.5">
                        <div className="size-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Command className="size-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Web Utils</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors ml-1">
                        <Home className="size-4" />
                        <span>Home</span>
                    </Link>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input 
                        placeholder="Search tools..." 
                        className="pl-8 h-8 text-xs bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-y-auto overflow-x-visible pt-2 custom-scrollbar">
                {TOOL_CATEGORIES.map((cat: Category) => {
                    const categoryTools = TOOLS.filter(
                        (tool: Tool) => 
                            tool.category === cat.id &&
                            (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    );

                    if (categoryTools.length === 0) return null;

                    return (
                        <SidebarGroup key={cat.id}>
                            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">
                                {cat.label}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="px-2 transition-all">
                                    {categoryTools.map((tool: Tool) => (
                                        <SidebarMenuItem key={tool.name}>
                                            <Link href={tool.href} className="w-full">
                                                <SidebarMenuButton 
                                                    tooltip={tool.name} 
                                                    isActive={pathname === tool.href}
                                                    className={`rounded-lg h-10 transition-all w-full ${pathname === tool.href ? 'bg-indigo-500/10 text-indigo-500 font-bold hover:bg-indigo-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                                >
                                                    <tool.icon className={`size-4 ${pathname === tool.href ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                                                    <span className={`text-sm ${pathname === tool.href ? 'font-bold' : 'font-medium'}`}>{tool.name}</span>
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/documentation" className="w-full">
                            <SidebarMenuButton 
                                tooltip="Docs" 
                                isActive={pathname === '/documentation'}
                                className={`rounded-lg h-10 transition-all ${pathname === '/documentation' ? 'bg-indigo-500/10 text-indigo-500 font-bold hover:bg-indigo-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                                <HelpCircle className={`size-4 ${pathname === '/documentation' ? 'text-indigo-500' : ''}`} />
                                <span className="font-medium">Documentation</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/settings" className="w-full">
                            <SidebarMenuButton 
                                tooltip="Settings" 
                                isActive={pathname === '/settings'}
                                className={`rounded-lg h-10 transition-all ${pathname === '/settings' ? 'bg-indigo-500/10 text-indigo-500 font-bold hover:bg-indigo-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                                <Settings className={`size-4 ${pathname === '/settings' ? 'text-indigo-500' : ''}`} />
                                <span className="font-medium">Settings</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
