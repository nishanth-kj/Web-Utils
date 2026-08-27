"use client";

import React, {useState, useEffect, useRef} from 'react';
import {Search, Copy, Check, ChevronRight, Github} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {AdsCard} from '@/components/shared/ads-card';
import {type Category, type Tool, TOOL_CATEGORIES, TOOLS} from '@/lib/constants/tools';
import {Card, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import Footer from "@/components/common/Footer";

export default function ToolsListingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [liveEpoch, setLiveEpoch] = useState(() => Math.floor(Date.now() / 1000));
    const [copied, setCopied] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveEpoch(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);


    const filteredTools = TOOLS.filter((tool: Tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCopyEpoch = () => {
        navigator.clipboard.writeText(String(liveEpoch));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
            <div className="max-w-6xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-8 md:p-12 mb-12 border border-border/50">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-2xl space-y-4">
                            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-500">
                                <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                                Universal Code Previewer & Editor
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                                Supercharge your <br className="hidden md:block"/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                                    development workflow.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground">
                                A professional suite of fast, precise, and free online developer tools. Format, convert, and preview your code instantly without leaving your browser.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" className="rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all" onClick={() => {
                                    searchInputRef.current?.focus();
                                }}>
                                    <Search className="mr-2 size-4" />
                                    Explore Tools
                                </Button>
                               
                            </div>
                        </div>

                        {/* Epoch Widget in Hero */}
                        <div 
                            className="flex flex-col items-center justify-center p-6 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl cursor-pointer hover:border-indigo-500/30 transition-all group shrink-0 min-w-[200px]"
                            onClick={handleCopyEpoch}
                            title="Click to copy epoch"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-2 rounded-full bg-indigo-500 animate-ping absolute" />
                                <div className="size-2 rounded-full bg-indigo-500 relative" />
                                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Live Epoch Time</span>
                            </div>
                            <span className="font-mono text-3xl font-bold text-foreground tabular-nums tracking-tighter">
                                {liveEpoch}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-1">
                                {new Date(liveEpoch * 1000).toUTCString().split(' ').slice(0, 5).join(' ')} UTC
                            </span>
                            <div className="h-8 mt-2 flex items-center justify-center">
                                {copied ? (
                                    <span className="flex items-center text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full"><Check className="size-3 mr-1" /> Copied</span>
                                ) : (
                                    <span className="flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="size-3 mr-1" /> Click to copy</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            ref={searchInputRef}
                            placeholder="Search tools..." 
                            className="pl-9 pr-12 h-10 bg-background border-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 transition-opacity group-focus-within:opacity-0">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={activeCategory === 'all' ? "secondary" : "ghost"}
                            size="sm"
                            className="h-10 px-4 font-semibold"
                            onClick={() => setActiveCategory('all')}
                        >
                            All
                        </Button>
                        {TOOL_CATEGORIES.map((cat: Category) => (
                            <Button
                                key={cat.id}
                                variant={activeCategory === cat.id ? "secondary" : "ghost"}
                                size="sm"
                                className="h-10 px-4 font-semibold"
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Unified Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredTools.map((tool: Tool) => (
                        <div 
                            key={tool.id} 
                            onClick={() => window.open(tool.href, '_self')}
                            className="group flex flex-col p-5 bg-card border border-border rounded-xl transition-all hover:border-foreground/20 hover:shadow-sm cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-md bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <tool.icon className="size-4" />
                                </div>
                                <h3 className="font-semibold text-foreground tracking-tight">{tool.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">{tool.description}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tool.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                    {tool.status}
                                </span>
                                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                            </div>
                        </div>
                    ))}
                </div>
                <AdsCard variant="horizontal" className="mt-8 mb-12" />
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </main>
    );
}
