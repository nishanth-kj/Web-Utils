"use client";

import React from 'react';
import { Github, Layout } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-zinc-500 text-sm order-2 md:order-1">
                    <Layout className="size-5 opacity-50" />
                    <span>© 2026 Web Viewer Pro. Built by <a href="https://github.com/nishanth-kj" target="_blank" rel="noreferrer" className="text-zinc-900 dark:text-white font-bold hover:text-indigo-600 transition-colors">Nishanth K J</a>.</span>
                </div>

                <div className="flex items-center gap-8 text-sm font-medium text-zinc-500 order-1 md:order-2">
                    <Link href="/docs" className="hover:text-indigo-600 transition-colors">Documentation</Link>
                    <Link href="/view" className="hover:text-indigo-600 transition-colors">Viewer</Link>
                    <a
                        href="https://github.com/nishanth-kj/Web-Viewer"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <Github className="size-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
