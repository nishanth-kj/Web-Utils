"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Clock, 
    Calendar,
    Copy,
    RefreshCw,
    Globe,
    X,
    ChevronsUpDown,
    Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { 
    formatRelativeTime, 
    getDayOfYear, 
    getWeekNumber 
} from "@/lib/time-utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

type CopiedField = string | null;

export function EpochConverter() {
    const [prefTimeZone, setPrefTimeZone] = useLocalStorage('timeZone', 'UTC');
    const [prefTimeFormat, setPrefTimeFormat] = useLocalStorage('timeFormat', 'seconds');
    const [clockFormat, setClockFormat] = useLocalStorage('clockFormat', '12h');
    const [customTimezones, setCustomTimezones] = useLocalStorage<string[]>('customTimezones', []);

    const [input, setInput] = useState("");
    const [tzToAdd, setTzToAdd] = useState("");
    const [openTz, setOpenTz] = useState(false);
    
    const [liveEpoch, setLiveEpoch] = useState(() => Math.floor(Date.now() / 1000));
    const [copied, setCopied] = useState<CopiedField>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveEpoch(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = useCallback((text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 1500);
    }, []);

    const { parsedDate, epochSeconds, epochMillis, error, isInputMillis } = React.useMemo(() => {
        if (!input.trim()) return { parsedDate: null, epochSeconds: null, epochMillis: null, error: "", isInputMillis: false };
        
        const str = input.trim();
        
        if (/^\d+$/.test(str)) {
            const num = Number(str);
            const isMs = str.length > 10;
            const ms = isMs ? num : num * 1000;
            const d = new Date(ms);
            if (isNaN(d.getTime())) return { parsedDate: null, epochSeconds: null, epochMillis: null, error: "Invalid timestamp", isInputMillis: isMs };
            return { parsedDate: d, epochSeconds: Math.floor(d.getTime() / 1000), epochMillis: d.getTime(), error: "", isInputMillis: isMs };
        }
        
        const d = new Date(str);
        if (isNaN(d.getTime())) return { parsedDate: null, epochSeconds: null, epochMillis: null, error: "Invalid date format", isInputMillis: false };
        return { parsedDate: d, epochSeconds: Math.floor(d.getTime() / 1000), epochMillis: d.getTime(), error: "", isInputMillis: false };
    }, [input]);

    const setNow = () => {
        const now = Date.now();
        const value = prefTimeFormat === 'millis' ? now : Math.floor(now / 1000);
        setInput(String(value));
    };

    return (
        <div className="flex flex-col w-full h-full bg-background text-foreground font-sans">
            
            {/* Streamlined Navbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-card">
                <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span className="font-semibold text-sm tracking-tight">Epoch Converter</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div 
                        onClick={() => copyToClipboard(String(liveEpoch), "live")}
                        className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity"
                        title="Copy Live Epoch"
                    >
                        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="font-mono text-xs font-bold tabular-nums text-primary">{liveEpoch}</span>
                    </div>

                    <div className="h-4 w-px bg-border shrink-0" />

                    <div className="flex items-center gap-2">
                        <Select value={prefTimeZone} onValueChange={setPrefTimeZone}>
                            <SelectTrigger className="h-7 text-xs px-2 w-[110px] bg-transparent border-border hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UTC" className="text-xs">UTC Zone</SelectItem>
                                <SelectItem value="Local" className="text-xs">Local Zone</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={clockFormat} onValueChange={setClockFormat}>
                            <SelectTrigger className="h-7 text-xs px-2 w-[100px] bg-transparent border-border hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Clock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="12h" className="text-xs">12-Hour</SelectItem>
                                <SelectItem value="24h" className="text-xs">24-Hour</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={prefTimeFormat} onValueChange={setPrefTimeFormat}>
                            <SelectTrigger className="h-7 text-xs px-2 w-[100px] bg-transparent border-border hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seconds" className="text-xs">Seconds</SelectItem>
                                <SelectItem value="millis" className="text-xs">Millis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-4">
                    
                    {/* Unified Input */}
                    <div className="flex flex-col sm:flex-row gap-2 relative">
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter Unix timestamp or date string..."
                                className="h-9 font-mono text-sm px-3 focus-visible:ring-1"
                            />
                            {isInputMillis && !error && (
                                <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0">
                                    MILLIS
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0">
                                    <Calendar className="size-4 text-muted-foreground" />
                                </Button>
                                <Input
                                    type="datetime-local"
                                    onChange={(e) => setInput(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                    title="Select date and time"
                                />
                            </div>
                            <Button onClick={setNow} size="sm" className="h-9 px-4 font-semibold text-xs">
                                <RefreshCw className="size-3 mr-1.5" /> Now
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-destructive px-1">{error}</p>
                    )}

                    {/* Compact Results Table */}
                    {parsedDate && epochSeconds && epochMillis && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="rounded-md border bg-card overflow-hidden">
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs w-1/3">Unix Seconds</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{epochSeconds}</TableCell>
                                            <TableCell className="py-2 px-3 text-right w-10">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(String(epochSeconds), "sec")}>
                                                    {copied === "sec" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">Unix Millis</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{epochMillis}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(String(epochMillis), "ms")}>
                                                    {copied === "ms" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">Unix Microseconds</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{epochMillis * 1000}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(String(epochMillis * 1000), "us")}>
                                                    {copied === "us" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">Unix Nanoseconds</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{epochMillis * 1000000}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(String(epochMillis * 1000000), "ns")}>
                                                    {copied === "ns" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">GMT / UTC</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{parsedDate.toUTCString()}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(parsedDate.toUTCString(), "utc")}>
                                                    {copied === "utc" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">Local Time</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{parsedDate.toLocaleString(undefined, { hour12: clockFormat === '12h' })}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(parsedDate.toLocaleString(), "loc")}>
                                                    {copied === "loc" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">ISO 8601</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{parsedDate.toISOString()}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(parsedDate.toISOString(), "iso")}>
                                                    {copied === "iso" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">Relative</TableCell>
                                            <TableCell className="py-2 px-3 text-sm">{formatRelativeTime(parsedDate)}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(formatRelativeTime(parsedDate), "rel")}>
                                                    {copied === "rel" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="py-2 px-3 font-semibold text-xs">Hex</TableCell>
                                            <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">{`0x${epochSeconds.toString(16).toUpperCase()}`}</TableCell>
                                            <TableCell className="py-2 px-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-6" onClick={() => copyToClipboard(`0x${epochSeconds.toString(16).toUpperCase()}`, "hex")}>
                                                    {copied === "hex" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="border rounded-md bg-muted/20 p-3 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Day of Year</span>
                                    <span className="text-lg font-bold">{getDayOfYear(parsedDate)}</span>
                                </div>
                                <div className="border rounded-md bg-muted/20 p-3 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Week Number</span>
                                    <span className="text-lg font-bold">{getWeekNumber(parsedDate)}</span>
                                </div>
                            </div>

                            {/* Timezone Comparison Section */}
                            <div className="pt-6 border-t mt-6 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Compare Timezones</h3>
                                    <div className="flex items-center gap-2">
                                        <Popover open={openTz} onOpenChange={setOpenTz}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openTz}
                                                    className="w-[220px] h-8 text-xs justify-between font-normal"
                                                >
                                                    {tzToAdd || "Select timezone..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[220px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search timezone..." className="h-9 text-xs" />
                                                    <CommandList>
                                                        <CommandEmpty>No timezone found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {typeof Intl !== 'undefined' && (Intl as any).supportedValuesOf ? (
                                                                (Intl as any).supportedValuesOf('timeZone').map((tz: string) => (
                                                                    <CommandItem
                                                                        key={tz}
                                                                        value={tz}
                                                                        onSelect={(currentValue) => {
                                                                            setTzToAdd(tz);
                                                                            setOpenTz(false);
                                                                        }}
                                                                        className="text-xs"
                                                                    >
                                                                        {tz}
                                                                        <Check
                                                                            className={cn(
                                                                                "ml-auto h-4 w-4",
                                                                                tzToAdd === tz ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                ))
                                                            ) : (
                                                                <CommandItem value="America/New_York" onSelect={(val) => { setTzToAdd("America/New_York"); setOpenTz(false); }} className="text-xs">
                                                                    America/New_York
                                                                    <Check className={cn("ml-auto h-4 w-4", tzToAdd === "America/New_York" ? "opacity-100" : "opacity-0")} />
                                                                </CommandItem>
                                                            )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <Button 
                                            size="sm" 
                                            className="h-8 text-xs px-4"
                                            onClick={() => {
                                                if (tzToAdd && !customTimezones.includes(tzToAdd)) {
                                                    setCustomTimezones([...customTimezones, tzToAdd]);
                                                    setTzToAdd("");
                                                }
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {customTimezones.length > 0 && (
                                    <div className="rounded-md border bg-card overflow-hidden">
                                        <Table>
                                            <TableBody>
                                                {customTimezones.map(tz => (
                                                    <TableRow key={tz} className="hover:bg-muted/30">
                                                        <TableCell className="py-2 px-3 font-semibold text-xs w-1/3">
                                                            <div className="flex items-center gap-2">
                                                                <Globe className="size-3 text-muted-foreground" />
                                                                {tz}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 px-3 font-mono text-sm tabular-nums">
                                                            {parsedDate.toLocaleString(undefined, { timeZone: tz, hour12: clockFormat === '12h' })}
                                                        </TableCell>
                                                        <TableCell className="py-2 px-3 text-right w-10">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => setCustomTimezones(customTimezones.filter(t => t !== tz))}
                                                            >
                                                                <X className="size-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
