"use client";

import React, {useState, useEffect, useRef} from 'react';
import {Search, Copy, Check, ChevronRight} from 'lucide-react';
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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Developer Tools
                        </h1>
                        <p className="text-muted-foreground">
                            A clean, minimalist suite of developer utilities and converters.
                        </p>
                    </div>

                    <div 
                        className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted/30 rounded-lg transition-all group animate-in fade-in slide-in-from-right-4 duration-700"
                        onClick={handleCopyEpoch}
                        title="Click to copy epoch"
                    >
                        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                                {liveEpoch}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                                {new Date(liveEpoch * 1000).toUTCString().split(' ').slice(0, 5).join(' ')} UTC
                            </span>
                        </div>
                        <div className="flex items-center justify-center">
                            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
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
