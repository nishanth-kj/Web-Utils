"use client";

import React from 'react';
import {
    Book,
    Code2,
    Layout,
    Zap,
    Shield,
    Globe,
    FileCode,
    Braces,
    Box,
    StickyNote,
    Terminal,
    Cpu
} from 'lucide-react';
import { FloatingAd } from "@/components/floating-ad";
import { Footer } from "@/components/landing/footer";

const DOCS_SECTIONS = [
    {
        title: "Getting Started",
        items: [
            {
                icon: Zap,
                label: "Introduction",
                content: "Web Viewer is a high-performance, universal code previewer designed for modern developers. It allows you to instantly visualize and format multiple data structures with zero setup."
            },
            {
                icon: Terminal,
                label: "Quick Start",
                content: "Navigate to the /view route, paste your code into the editor, and watch as it instantly renders in the preview pane. Use the sidebar to switch between output formats."
            }
        ]
    },
    {
        title: "Supported Formats",
        items: [
            {
                icon: Globe,
                label: "HTML & Bootstrap",
                content: "Full support for HTML5 and Bootstrap 5.3. Renders code in a safe, sandboxed iframe environment."
            },
            {
                icon: Braces,
                label: "JSON & YAML",
                content: "Automatic syntax validation and beautification for structured data. Error highlighting for invalid syntax."
            },
            {
                icon: Box,
                label: "React (JSX/TSX)",
                content: "Premium syntax highlighting for React components. Perfect for reviewing component structures."
            }
        ]
    },
    {
        title: "Advanced Features",
        items: [
            {
                icon: Cpu,
                label: "Performance",
                content: "Built on Next.js 15 for lightning-fast route transitions and optimized rendering cycles."
            },
            {
                icon: Shield,
                label: "Security",
                content: "All previews are sandboxed to prevent script execution from impacting the main application window."
            }
        ]
    }
];

export default function DocsPage() {
    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950 px-4 py-20 scrollbar-none">
            <div className="max-w-4xl mx-auto">
                <header className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest mb-6">
                        <Book className="size-3" />
                        <span>Documentation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-300 dark:to-zinc-500">
                        Everything you need to <br /> scale your workflow.
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        A comprehensive guide to using and extending the Web Viewer platform.
                    </p>
                </header>

                <div className="space-y-20">
                    {DOCS_SECTIONS.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-xl font-bold mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4 flex items-center gap-3">
                                <span className="size-1.5 rounded-full bg-indigo-500" />
                                {section.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {section.items.map((item) => (
                                    <div key={item.label} className="group p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl transition-all duration-300">
                                        <div className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white mb-5 transition-transform group-hover:scale-110 shadow-sm">
                                            <item.icon className="size-5" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-3 dark:text-zinc-100">{item.label}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            {item.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer info */}
                <div className="mt-32 p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center shadow-2xl shadow-indigo-500/20 mb-20">
                    <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
                        Join thousands of developers using Web Viewer to preview their code more efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                            Launch Viewer App
                        </button>
                        <button className="px-8 py-3 bg-indigo-500/20 text-white border border-white/20 font-bold rounded-xl hover:bg-indigo-500/30 transition-colors">
                            Star on GitHub
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
            <FloatingAd />
        </div>
    );
}
