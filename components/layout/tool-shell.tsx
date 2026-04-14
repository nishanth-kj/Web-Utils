"use client";

import React from 'react';
import Link from 'next/link';
import { 
    ChevronRight, 
    Home,
} from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface ToolShellProps {
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

export function ToolShell({ 
    title, 
    description, 
    breadcrumbs, 
    children, 
    sidebar 
}: ToolShellProps) {
    return (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50">
            {/* Tool Header & Breadcrumbs */}
            <div className="px-6 py-8 md:px-12 md:py-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <Link href="/" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                            <Home className="size-3" /> Home
                        </Link>
                        {breadcrumbs.map((item, i) => (
                            <React.Fragment key={i}>
                                <ChevronRight className="size-3" />
                                {item.href ? (
                                    <Link href={item.href} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-zinc-600 dark:text-zinc-300">{item.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>

                    {/* Title Area */}
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Layout Area */}
            <div className="flex-1 overflow-hidden relative">
                <div className="h-full flex flex-col md:flex-row max-w-[1600px] mx-auto">
                    {/* Parameters Sidebar (Optional) */}
                    {sidebar && (
                        <aside className="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto p-6">
                            {sidebar}
                        </aside>
                    )}

                    {/* Content Canvas */}
                    <main className="flex-1 overflow-auto p-6 md:p-10">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
