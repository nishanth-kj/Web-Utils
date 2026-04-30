"use client";

import React, { useState } from 'react';
import { 
    Bitcoin, 
    Search, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Blocks, 
    Wallet, 
    Activity,
    ExternalLink,
    Cpu,
    Globe,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Transaction {
    type: 'in' | 'out';
    id: string;
    date: string;
    amount: string;
    status: string;
}

interface SearchResult {
    type: 'transaction' | 'address';
    hash: string;
    balance: string;
    totalReceived: string;
    totalSent: string;
    txCount: number;
    transactions: Transaction[];
    value?: string;
}

export function BlockchainPage() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
            setResult({
                type: query.length > 42 ? 'transaction' : 'address',
                hash: query,
                balance: '1.245 BTC',
                totalReceived: '4.567 BTC',
                totalSent: '3.322 BTC',
                txCount: 42,
                transactions: [
                    { type: 'in', id: 'f418...d2c1', date: '2 mins ago', amount: '+0.042 BTC', status: 'CONFIRMED' },
                    { type: 'out', id: 'a12b...e34f', date: '1 hour ago', amount: '-0.015 BTC', status: 'CONFIRMED' },
                    { type: 'in', id: 'c98d...b76a', date: '5 hours ago', amount: '+1.120 BTC', status: 'CONFIRMED' },
                ],
                value: '$78,452.12'
            });
            setIsSearching(false);
        }, 800);
    };

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-6xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <Bitcoin className="size-8 text-amber-500" />
                            Blockchain Explorer
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Real-time simulation of Bitcoin and Ethereum network data.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex-1 max-w-md relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search address, transaction hash..." 
                            className="w-full h-12 pl-10 pr-24 rounded-xl bg-muted/20 border-border/50 border focus:border-primary/40 outline-none font-mono text-xs transition-all shadow-inner"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button type="submit" size="sm" className="absolute right-1.5 top-1.5 h-9 px-4 font-black uppercase tracking-widest text-[10px]">
                            Explore
                        </Button>
                    </form>
                </div>

                {!result && !isSearching && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Current Block', value: '835,214', icon: Blocks, color: 'text-indigo-500' },
                            { label: 'Avg Fee', value: '12 sat/vB', icon: Zap, color: 'text-amber-500' },
                            { label: 'Total Nodes', value: '14,231', icon: Globe, color: 'text-emerald-500' },
                            { label: 'Hashrate', value: '612.4 EH/s', icon: Activity, color: 'text-rose-500' }
                        ].map((stat, i) => (
                            <Card key={i} className="border-border/50 bg-muted/5">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-background shadow-sm ${stat.color}`}>
                                        <stat.icon className="size-4" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                                        <div className="text-sm font-mono font-black">{stat.value}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {isSearching && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Scanning Network...</div>
                    </div>
                )}

                {result && !isSearching && (
                    <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="md:col-span-1 border-border/50 shadow-xl bg-gradient-to-br from-background to-muted/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 uppercase">
                                        {result.type}
                                    </Badge>
                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Wallet className="size-4 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-xs font-mono font-bold mt-4 break-all opacity-60">
                                    {result.hash}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Final Balance</div>
                                    <div className="text-3xl font-mono font-black tracking-tighter flex items-baseline gap-2">
                                        {result.balance}
                                        <span className="text-xs text-muted-foreground font-medium">{result.value}</span>
                                    </div>
                                </div>
                                
                                <Separator className="bg-border/30" />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Received</div>
                                        <div className="text-xs font-mono font-bold text-emerald-500">{result.totalReceived}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Sent</div>
                                        <div className="text-xs font-mono font-bold text-rose-500">{result.totalSent}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Txs</div>
                                        <div className="text-xs font-mono font-bold">{result.txCount}</div>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest gap-2">
                                    <ExternalLink className="size-3" /> View on Explorer
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 border-border/50">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="size-4 text-amber-500" /> Recent Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {result.transactions.map((tx, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {tx.type === 'in' ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-mono font-bold">{tx.id}</div>
                                                    <div className="text-[10px] font-medium text-muted-foreground">{tx.date}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-mono font-black">{tx.amount}</div>
                                                <div className="text-[9px] font-black uppercase text-emerald-500">{tx.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card className="border-dashed border-2 bg-muted/5 border-border/50">
                    <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Cpu className="size-6 text-primary" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h3 className="font-black uppercase tracking-widest text-sm">Real-time Simulation</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                This explorer provides a simulated environment for testing blockchain queries.
                                In a production environment, this would connect to the Bitcoin Core or Ethereum JSON-RPC APIs.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
