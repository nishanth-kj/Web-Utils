"use client";

import React, { useState } from 'react';
import { 
    Search, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdsCard } from '@/components/shared/ads-card';
import { TOOLS, TOOL_CATEGORIES, type Tool, type Category } from '@/lib/constants/tools';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ToolsListingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredTools = TOOLS.filter((tool: Tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-full overflow-auto bg-background p-6 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Web Utils
                    </h1>
                    <p className="text-muted-foreground">
                        A clean, minimalist suite of developer utilities and converters.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search tools..." 
                            className="pl-9 h-10 bg-background border-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
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

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    <AdsCard variant="sidebar" className="h-full min-h-[160px]" />
                </div>
            </div>
        </div>
    );
}
