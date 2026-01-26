"use client";

import React, { useState } from 'react';
import { Moon, Sun, Layout, Github, Menu, X, FileEdit, Code2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mode, setMode] = useState("editor");

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/view", label: "Viewer" },
        { href: "/docs", label: "Docs" },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-[100] border-b border-zinc-200/80 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Layout className="size-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                            Web File Editor
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://github.com/nishanth-kj/Web-Viewer"
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            <Github className="size-5" />
                        </a>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setMode("editor")}
                                className={`px-3 py-1 flex items-center gap-2 rounded-md text-xs font-bold transition-all ${mode === "editor" ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
                            >
                                <FileEdit className="size-3.5" /> File Editor
                            </button>
                            <button
                                onClick={() => setMode("ide")}
                                className={`px-3 py-1 flex items-center gap-2 rounded-md text-xs font-bold transition-all ${mode === "ide" ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
                            >
                                <Code2 className="size-3.5" /> IDE
                            </button>
                        </div>
                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full"
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-zinc-600 dark:text-zinc-400"
                        >
                            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-base font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://github.com/nishanth-kj/Web-Viewer"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-base font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                        >
                            <Github className="size-5" />
                            <span>GitHub</span>
                        </a>
                    </div>
                )}
            </nav>
        </>
    );
}
