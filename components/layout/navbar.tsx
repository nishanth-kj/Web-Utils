"use client";

import React from 'react';
import { Github, Moon, Sun, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const { state, isMobile } = useSidebar();

    return (
        <nav className={`fixed top-0 right-0 z-[100] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out ${isMobile || state === 'collapsed' ? 'left-0' : 'left-[var(--sidebar-width)]'}`}>
            <div className="flex h-16 items-center justify-between px-4 md:px-6 w-full max-w-6xl mx-auto">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Command className="size-5" />
                        </div>
                        <span className="font-black text-lg md:text-xl tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-none">Web Utils</span>
                    </Link>
                </div>

                <div className="flex items-center gap-1">
                    {isMobile && <SidebarTrigger className="size-9" />}
                    <a href="https://github.com/nishanth-kj/Web-Utils" target="_blank" rel="noreferrer" className="hidden sm:inline-block">
                        <Button variant="ghost" size="icon" className="size-9">
                            <Github className="size-5" />
                            <span className="sr-only">GitHub</span>
                        </Button>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
