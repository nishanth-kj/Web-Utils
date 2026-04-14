"use client";

import React, { useState } from 'react';
import { Moon, Sun, Github, Menu, X, Home, FileEdit } from 'lucide-react';
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
        { href: "/editor", label: "Workspace", icon: FileEdit },
    ];

    return (
        <nav className="fixed top-0 w-full z-[100] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-lg tracking-tight">Web Utils</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors hover:text-foreground/80 ${pathname === link.href ? "text-foreground" : "text-foreground/60"}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <nav className="flex items-center gap-1">
                        <a href="https://github.com/nishanth-kj/Web-Utils" target="_blank" rel="noreferrer" className="hidden sm:inline-block">
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
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-background p-4 flex flex-col gap-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium ${pathname === link.href ? "bg-secondary" : "hover:bg-accent"}`}
                        >
                            <link.icon className="size-4" />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
