"use client";

import React from 'react';
import {Github, Moon, Sun, Command} from 'lucide-react';
import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

import { useSidebar } from "@/components/ui/sidebar";

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const { state } = useSidebar();

    return (
        <nav className={`fixed top-0 right-0 z-[100] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out ${state === 'collapsed' ? 'left-0' : 'left-[var(--sidebar-width)]'}`}>
            <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2.5">
                        <div className="size-7 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Command className="size-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Web Utils</span>
                    </Link>

                </div>

                <div className="flex items-center gap-2">
                    <nav className="flex items-center gap-1">
                        <a href="https://github.com/nishanth-kj/Web-Utils" target="_blank" rel="noreferrer" className="inline-block">
                            <Button variant="ghost" size="icon" className="size-8">
                                <Github className="size-4" />
                                <span className="sr-only">GitHub</span>
                            </Button>
                        </a>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
