"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Clock, 
    Calendar, 
    Timer, 
    Globe, 
    Copy, 
    Check, 
    RefreshCw, 
    Zap, 
    Table as TableIcon, 
    ArrowRight 
} from "lucide-react";
import { 
    ResizableHandle, 
    ResizablePanel, 
    ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { 
    formatRelativeTime, 
    getDayOfYear, 
    getWeekNumber, 
    toLocalDatetimeString 
} from "@/lib/time-utils";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";

type CopiedField = string | null;

interface CopyButtonProps {
    value: string;
    field: string;
    className?: string;
    copied: string | null;
    onCopy: (text: string, field: string) => void;
}

const CopyButton = ({ value, field, className, copied, onCopy }: CopyButtonProps) => (
    <button
        onClick={() => onCopy(value, field)}
        className={cn("flex items-center justify-center size-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary transition-all active:scale-90", className)}
        title="Copy"
    >
        {copied === field ? (
            <Check className="size-4 text-emerald-500" />
        ) : (
            <Copy className="size-4" />
        )}
    </button>
);

interface TableRowProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    value: string;
    field: string;
    mono?: boolean;
    isPreferred?: boolean;
    copied: string | null;
    onCopy: (text: string, field: string) => void;
}

const TableRow = ({ icon: Icon, label, value, field, mono = true, isPreferred = false, copied, onCopy }: TableRowProps) => (
    <tr className={cn(
        "border-b border-muted/30 group hover:bg-muted/5 transition-colors",
        isPreferred && "bg-primary/[0.03] border-l-2 border-l-primary"
    )}>
        <td className="py-3 pl-4 pr-2">
            <div className="flex items-center gap-3">
                <Icon className={cn("size-3.5 transition-colors", isPreferred ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", isPreferred ? "text-primary" : "text-muted-foreground")}>{label}</span>
            </div>
        </td>
        <td className={cn("py-3 px-4 text-sm font-medium tabular-nums truncate", mono ? "font-mono" : "text-foreground", isPreferred && "text-primary font-bold")}>
            {value}
        </td>
        <td className="py-3 pl-2 pr-4 text-right">
            <CopyButton value={value} field={field} copied={copied} onCopy={onCopy} />
        </td>
    </tr>
);

export function EpochConverter() {
    // Settings
    const [prefTimeZone] = useLocalStorage('timeZone', 'UTC');
    const [prefTimeFormat] = useLocalStorage('timeFormat', 'seconds');

    // State
    const [epochInput, setEpochInput] = useState("");
    const [dateInput, setDateInput] = useState("");
    const [liveEpoch, setLiveEpoch] = useState(() => Math.floor(Date.now() / 1000));
    const [copied, setCopied] = useState<CopiedField>(null);

    // Live clock effect
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

    const copyAsTable = (date: Date, field: string) => {
        const table = `| Format | Value |\n| --- | --- |\n| GMT / UTC | ${date.toUTCString()} |\n| Local Time | ${date.toLocaleString()} |\n| ISO 8601 | ${date.toISOString()} |\n| Relative | ${formatRelativeTime(date)} |`;
        navigator.clipboard.writeText(table);
        setCopied(field);
        setTimeout(() => setCopied(null), 1500);
    };

    // Derived from epochInput
    const { parsedDate, epochError, isMillis } = React.useMemo(() => {
        if (!epochInput.trim()) {
            return { parsedDate: null, epochError: "", isMillis: false };
        }
        const num = Number(epochInput.trim());
        if (isNaN(num)) {
            return { parsedDate: null, epochError: "Enter a valid number", isMillis: false };
        }
        const isMs = epochInput.trim().length > 10;
        const ms = isMs ? num : num * 1000;
        const d = new Date(ms);
        if (isNaN(d.getTime())) {
            return { parsedDate: null, epochError: "Invalid timestamp", isMillis: isMs };
        }
        return { parsedDate: d, epochError: "", isMillis: isMs };
    }, [epochInput]);

    // Derived from dateInput
    const { dateEpochSeconds, dateEpochMillis } = React.useMemo(() => {
        if (!dateInput) {
            return { dateEpochSeconds: null, dateEpochMillis: null };
        }
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) {
            return { dateEpochSeconds: null, dateEpochMillis: null };
        }
        return { 
            dateEpochSeconds: Math.floor(d.getTime() / 1000), 
            dateEpochMillis: d.getTime() 
        };
    }, [dateInput]);

    const setNow = () => {
        const now = Date.now();
        const value = prefTimeFormat === 'millis' ? now : Math.floor(now / 1000);
        setEpochInput(String(value));
    };

    const setDateNow = () => {
        setDateInput(toLocalDatetimeString(new Date()));
    };


    return (
        <div className="flex flex-col w-full h-full bg-background text-foreground overflow-hidden">
            {/* Header section with Live Epoch */}
            <div className="relative border-b bg-muted/5 px-8 py-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Clock className="size-4 text-primary" />
                            <h1 className="text-xl font-bold tracking-tight">Time & Date</h1>
                        </div>
                        <p className="text-muted-foreground text-[11px]">Professional epoch converter and time utility</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div 
                            className="flex items-center gap-3 bg-muted/20 px-3 py-1.5 rounded-lg group cursor-pointer hover:bg-muted/30 transition-all border border-transparent hover:border-primary/20" 
                            onClick={() => copyToClipboard(String(liveEpoch), "live")}
                        >
                            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                            <div className="flex flex-col">
                                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                                    {liveEpoch}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                                    {new Date(liveEpoch * 1000).toUTCString().split(' ').slice(0, 5).join(' ')} UTC
                                </span>
                            </div>
                            <div className="flex items-center justify-center ml-2">
                                {copied === "live" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="h-full max-w-7xl mx-auto px-6 py-6">
                    <ResizablePanelGroup direction="horizontal" className="h-full gap-4">
                        {/* Epoch to Date */}
                        <ResizablePanel defaultSize={50} minSize={30}>
                            <div className="h-full overflow-auto custom-scrollbar pr-2">
                                <div className="space-y-4">
                                    <div className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
                                        <div className="p-5 border-b bg-muted/5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                    <Timer className="size-4 text-indigo-500" />
                                                </div>
                                                <h3 className="font-bold text-sm">Epoch to Date</h3>
                                            </div>
                                            
                                            {parsedDate && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary gap-1.5"
                                                    onClick={() => copyAsTable(parsedDate, "table-epoch")}
                                                >
                                                    {copied === "table-epoch" ? <Check className="size-3" /> : <TableIcon className="size-3" />}
                                                    Copy Table
                                                </Button>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text"
                                                        value={epochInput}
                                                        onChange={(e) => setEpochInput(e.target.value)}
                                                        placeholder="Enter epoch (e.g. 1711206600)"
                                                        className="w-full h-10 px-4 rounded-lg bg-muted/20 border border-transparent focus:border-primary/30 outline-none transition-all font-mono text-xs placeholder:text-muted-foreground/40 shadow-inner"
                                                    />
                                                    {isMillis && epochInput && !epochError && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                                                            <Zap className="size-2.5 text-amber-500" />
                                                            <span className="text-[8px] font-bold text-amber-600">MS</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button onClick={setNow} variant="secondary" size="sm" className="h-10 rounded-lg px-4 font-bold text-xs">
                                                    Now
                                                </Button>
                                            </div>
                                            {epochError && <p className="text-[10px] text-destructive font-semibold px-1">{epochError}</p>}

                                            {parsedDate ? (
                                                <div className="rounded-lg border border-muted/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <table className="w-full text-left border-collapse">
                                                        <tbody>
                                                            <TableRow icon={Globe} label="GMT / UTC" value={parsedDate.toUTCString()} field="utc" isPreferred={prefTimeZone === 'UTC'} copied={copied} onCopy={copyToClipboard} />
                                                            <TableRow icon={Calendar} label="Local Time" value={parsedDate.toLocaleString()} field="local" isPreferred={prefTimeZone === 'Local'} copied={copied} onCopy={copyToClipboard} />
                                                            <TableRow icon={Clock} label="ISO 8601" value={parsedDate.toISOString()} field="iso" copied={copied} onCopy={copyToClipboard} />
                                                            <TableRow icon={Timer} label="Relative" value={formatRelativeTime(parsedDate)} field="rel" mono={false} copied={copied} onCopy={copyToClipboard} />
                                                        </tbody>
                                                    </table>
                                                    <div className="grid grid-cols-2 border-t border-muted/50 divide-x divide-muted/50 bg-muted/5">
                                                        <div className="p-3 flex flex-col items-center justify-center">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Day of Year</span>
                                                            <span className="text-sm font-bold text-primary">{getDayOfYear(parsedDate)}</span>
                                                        </div>
                                                        <div className="p-3 flex flex-col items-center justify-center">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Week Number</span>
                                                            <span className="text-sm font-bold text-primary">{getWeekNumber(parsedDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-muted/50 bg-muted/5 text-muted-foreground/30">
                                                    <Clock className="size-10 mb-2 stroke-[1]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Waiting for input</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="bg-border/50" />

                        {/* Date to Epoch */}
                        <ResizablePanel defaultSize={50} minSize={30}>
                            <div className="h-full overflow-auto custom-scrollbar pl-2">
                                <div className="space-y-4">
                                    <div className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
                                        <div className="p-5 border-b bg-muted/5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                    <Calendar className="size-4 text-purple-500" />
                                                </div>
                                                <h3 className="font-bold text-sm">Date to Epoch</h3>
                                            </div>

                                            {dateEpochSeconds && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary gap-1.5"
                                                    onClick={() => copyAsTable(new Date(dateEpochSeconds * 1000), "table-date")}
                                                >
                                                    {copied === "table-date" ? <Check className="size-3" /> : <TableIcon className="size-3" />}
                                                    Copy Table
                                                </Button>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex gap-2">
                                                <input
                                                    type="datetime-local"
                                                    value={dateInput}
                                                    onChange={(e) => setDateInput(e.target.value)}
                                                    className="flex-1 h-10 px-4 rounded-lg bg-muted/20 border border-transparent focus:border-primary/30 outline-none transition-all font-mono text-xs [color-scheme:light] dark:[color-scheme:dark] shadow-inner"
                                                />
                                                <Button onClick={setDateNow} variant="secondary" size="sm" className="h-10 rounded-lg px-4 font-bold text-xs">
                                                    Now
                                                </Button>
                                            </div>

                                            {dateEpochSeconds ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="rounded-lg border border-muted/50 overflow-hidden">
                                                        <table className="w-full text-left border-collapse">
                                                            <tbody>
                                                                <TableRow icon={RefreshCw} label="Unix Seconds" value={String(dateEpochSeconds)} field="d-sec" isPreferred={prefTimeFormat === 'seconds'} copied={copied} onCopy={copyToClipboard} />
                                                                <TableRow icon={Zap} label="Unix Millis" value={String(dateEpochMillis)} field="d-ms" isPreferred={prefTimeFormat === 'millis'} copied={copied} onCopy={copyToClipboard} />
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    
                                                    <div className="pt-4 border-t border-dashed border-muted">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Globe className="size-3 text-muted-foreground" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Verification</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-1.5">
                                                            <div className="flex items-center justify-between text-[10px] px-3 py-1.5 rounded-md bg-muted/10">
                                                                <span className="text-muted-foreground">UTC Date</span>
                                                                <span className="font-mono font-medium text-foreground">{new Date(dateEpochSeconds * 1000).toUTCString()}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] px-3 py-1.5 rounded-md bg-muted/10">
                                                                <span className="text-muted-foreground">ISO Format</span>
                                                                <span className="font-mono font-medium text-foreground">{new Date(dateEpochSeconds * 1000).toISOString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-muted/50 bg-muted/5 text-muted-foreground/30">
                                                    <Calendar className="size-10 mb-2 stroke-[1]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Select a date</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Extra Utilities Box */}
                                    <div className="p-5 bg-muted/5 border border-muted/50 rounded-xl">
                                        <h4 className="font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2 text-primary">
                                            <ArrowRight className="size-3" />
                                            Quick Tips
                                        </h4>
                                        <ul className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
                                            <li className="flex gap-2">
                                                <span className="text-primary font-bold">•</span>
                                                Automatic millisecond detection for inputs &gt; 10 digits.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary font-bold">•</span>
                                                Epoch time starts from January 1st, 1970 (UTC).
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    );
}
