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
    Copy,
    Check,
    Cpu,
    Globe,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function BlockchainPage() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<any>(null);

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
                value: '$78,452.12',
                transactions: [
                    { id: '0x7d...f2a', type: 'in', amount: '0.05 BTC', date: '2 mins ago', status: 'Confirmed' },
                    { id: '0x4b...e91', type: 'out', amount: '1.12 BTC', date: '5 hours ago', status: 'Confirmed' },
                    { id: '0x1c...a3d', type: 'in', amount: '0.32 BTC', date: '1 day ago', status: 'Confirmed' },
                ]
            });
            setIsSearching(false);
        }, 800);
    };

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full flex flex-col">
            <div className="max-w-6xl mx-auto space-y-8 flex-1 w-full p-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3 uppercase">
                            <Bitcoin className="size-6 text-amber-500" />
                            Blockchain Inspector
                        </h1>
                        <p className="text-muted-foreground text-xs font-medium">
                            On-chain analytics and address tracking.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 bg-muted/20 rounded-md border border-border/50">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">BTC</span>
                            <span className="text-xs font-mono font-bold">$63,412.00</span>
                        </div>
                        <div className="px-3 py-1.5 bg-muted/20 rounded-md border border-border/50">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Gas</span>
                            <span className="text-xs font-mono font-bold">12 Gwei</span>
                        </div>
                    </div>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="relative">
                    <div className="relative flex items-center gap-2 p-1.5 bg-background border rounded-lg shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
                        <Search className="size-5 text-muted-foreground ml-3" />
                        <input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Address / Tx Hash / Block..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2 placeholder:text-muted-foreground/50"
                        />
                        <Button 
                            type="submit"
                            size="sm"
                            className="rounded-md px-6 font-bold uppercase tracking-widest h-9"
                            disabled={isSearching}
                        >
                            {isSearching ? <Cpu className="size-4 animate-spin" /> : 'Inspect'}
                        </Button>
                    </div>
                </form>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Supply', value: '19.6M BTC', icon: Blocks },
                        { label: 'Active Wallets', value: '842K', icon: Wallet },
                        { label: 'TPS', value: '7.42', icon: Activity },
                        { label: 'Nodes', value: '12,412', icon: Globe },
                    ].map((stat, i) => (
                        <Card key={i} className="border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                                <stat.icon className="size-4 text-primary opacity-50" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-xl font-mono font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Results Section */}
                {result && (
                    <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="md:col-span-1 border-primary/20 bg-primary/5 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Wallet className="size-4" /> Wallet Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Final Balance</span>
                                    <div className="text-3xl font-mono font-bold text-foreground">{result.balance}</div>
                                    <div className="text-sm font-medium text-muted-foreground">{result.value} USD</div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-muted-foreground">Type</span>
                                        <Badge variant="secondary" className="uppercase text-[9px] font-black">{result.type}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-muted-foreground">Hash</span>
                                        <span className="text-xs font-mono text-primary cursor-pointer hover:underline">0x...{result.hash.slice(-6)}</span>
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
                                    {result.transactions.map((tx: any, i: number) => (
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
            </div>
        </div>
    );
}
