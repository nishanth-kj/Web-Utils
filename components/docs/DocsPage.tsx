"use client";

import React from 'react';
import Link from 'next/link';
import {
    Book,
    Zap,
    Shield,
    Globe,
    Braces,
    Box,
    Terminal,
    Cpu
} from 'lucide-react';

import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/nishanth-kj/Web-Utils";

const DOCS_SECTIONS = [
    {
        title: "Getting Started",
        items: [
            {
                icon: Zap,
                label: "Introduction",
                content: "Web Utils is a high-performance, universal file editor and code previewer designed for modern developers. It allows you to instantly edit, visualize, and format multiple data structures with zero setup."
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
                content: "Syntax highlighting and formatting for React components. Useful for reviewing component structures."
            }
        ]
    },
    {
        title: "Advanced Features",
        items: [
            {
                icon: Cpu,
                label: "Performance",
                content: "Built on Next.js for fast route transitions. Heavy dependencies like Monaco and Prettier load on demand instead of blocking first paint."
            },
            {
                icon: Shield,
                label: "Privacy",
                content: "Tools process your data locally in the browser using JavaScript and WebAssembly. Nothing you paste or upload is sent to our servers."
            }
        ]
    }
];

export function DocsPage() {
    return (
        <div className="h-full overflow-y-auto bg-background custom-scrollbar px-4 py-16 md:py-20">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                        <Book className="size-3" />
                        <span>Documentation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                        Everything you need to <br /> scale your workflow.
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        A guide to using and extending the Web Utils platform.
                    </p>
                </header>

                <div className="space-y-16">
                    {DOCS_SECTIONS.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-xl font-bold mb-8 border-b border-border pb-4 flex items-center gap-3 text-foreground">
                                <span className="size-1.5 rounded-full bg-primary" />
                                {section.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.items.map((item) => (
                                    <div key={item.label} className="group p-6 rounded-xl border border-border bg-card transition-colors hover:border-foreground/15 hover:bg-accent/40">
                                        <div className="size-10 rounded-lg bg-background border border-border flex items-center justify-center text-foreground mb-5">
                                            <item.icon className="size-5" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-3 text-foreground">{item.label}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-20 mb-16 p-8 rounded-xl border border-border bg-muted/30 text-center">
                    <h2 className="text-2xl font-bold mb-3 text-foreground">Ready to get started?</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                        Free, browser-based developer tools — no signup, nothing uploaded.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild size="lg">
                            <Link href="/">Explore tools</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                                Star on GitHub
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
