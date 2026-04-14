"use client";

import React, { useState } from 'react';
import { 
    Search, 
    Filter,
    LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdsCard } from '@/components/shared/ads-card';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TOOLS, TOOL_CATEGORIES, type Tool, type Category } from '@/lib/constants/tools';

export default function ToolsListingPage() {
    const container = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".tool-card", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out",
            delay: 0.2
        });
        
        gsap.from(".category-btn", {
            x: -20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "back.out(1.7)"
        });
    }, { scope: container });

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredTools = TOOLS.filter((tool: Tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div ref={container} className="h-full overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative p-6 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                            All Tools
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                            Explore our comprehensive suite of developer utilities and converters.
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                        <Input 
                            placeholder="Search tools, formats, and utilities..." 
                            className="pl-12 h-14 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl text-lg shadow-sm focus-visible:ring-indigo-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <Filter className="size-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <LayoutGrid className="size-5" />
                        </Button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={activeCategory === "all" ? "default" : "outline"}
                        className={`category-btn rounded-xl px-6 h-10 font-bold transition-all ${activeCategory === 'all' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-white dark:bg-zinc-900'}`}
                        onClick={() => setActiveCategory("all")}
                    >
                        All Tools
                    </Button>
                    {TOOL_CATEGORIES.map((cat: Category) => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "default" : "outline"}
                            className={`category-btn rounded-xl px-6 h-10 font-bold transition-all ${activeCategory === cat.id ? 'bg-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTools.map((tool: Tool) => (
                        <div 
                            key={tool.id} 
                            className="tool-card group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden"
                            onClick={() => window.open(tool.href, '_self')}
                        >
                            <div className="relative z-10 space-y-4">
                                <div className="size-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <tool.icon className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{tool.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{tool.description}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${tool.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {tool.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="tool-card md:col-span-2 lg:col-span-1">
                        <AdsCard variant="sidebar" className="h-full" />
                    </div>
                </div>


            </div>
        </div>
    );
}
