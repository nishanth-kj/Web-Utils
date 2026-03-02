"use client";

import React, { useState } from 'react';
import { Moon, Sun, Layout, Github, Menu, X, FileEdit, Code2, Home, ArrowLeftRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/documentation", label: "Docs" },
    ];

    const tools = [
        { id: "editor", label: "Editor", href: "/editor", icon: FileEdit },
        { id: "viewer", label: "Viewer", href: "/view", icon: Layout },
        { id: "ide", label: "IDE", href: "/ide", icon: Code2 },
        { id: "convert", label: "Convert", href: "/convert/epoch", icon: ArrowLeftRight }
    ];

    const activeTool = pathname.includes("editor") ? "editor"
        : pathname.includes("ide") ? "ide"
            : pathname.includes("view") ? "viewer"
                : pathname.includes("convert") ? "convert"
                    : null;

    return (
        <>
            <nav className="fixed top-0 w-full z-[100] border-b border-zinc-200/80 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Layout className="size-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                            Web Utils
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
                            href="https://github.com/nishanth-kj/Web-Utils"
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mr-2"
                        >
                            <Github className="size-5" />
                        </a>

                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/50 shadow-inner">
                            {tools.map((tool) => (
                                <Link key={tool.id} href={tool.href}>
                                    <button
                                        className={`px-4 py-2 flex items-center gap-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeTool === tool.id
                                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-md scale-[1.02]"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                            }`}
                                    >
                                        <tool.icon className={`size-4 ${activeTool === tool.id ? "text-indigo-500" : ""}`} />
                                        <span>{tool.label}</span>
                                    </button>
                                </Link>
                            ))}
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
                        {tools.map((tool) => (
                            <Link
                                key={tool.id}
                                href={tool.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl text-base font-semibold transition-colors ${activeTool === tool.id
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <tool.icon className="size-5" />
                                <span>{tool.label}</span>
                            </Link>
                        ))}
                        <a
                            href="https://github.com/nishanth-kj/Web-Utils"
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
