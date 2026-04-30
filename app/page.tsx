"use client";

import React, {useState, useEffect, useRef} from 'react';
import {Search, Copy, Check} from 'lucide-react';
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
        <div className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredTools.map((tool: Tool) => (
                        <Card 
                            key={tool.id} 
                            className="group hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => window.open(tool.href, '_self')}
                        >
                            <CardHeader className="p-5">
                                <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-primary mb-3">
                                    <tool.icon className="size-5" />
                                </div>
                                <CardTitle className="text-base font-bold uppercase tracking-tight">{tool.name}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2 mt-1">{tool.description}</CardDescription>
                                <div className="pt-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${tool.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {tool.status}
                                    </span>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
                <AdsCard variant="horizontal" className="mt-8 mb-12" />
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}
