"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Copy,
    Check,
    ArrowRight,
    RefreshCw,
    Calendar,
    Globe,
    Timer,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const absDiff = Math.abs(diffMs);
    const isFuture = diffMs < 0;
    const prefix = isFuture ? "in " : "";
    const suffix = isFuture ? "" : " ago";

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${prefix}${seconds} second${seconds !== 1 ? "s" : ""}${suffix}`;
    if (minutes < 60) return `${prefix}${minutes} minute${minutes !== 1 ? "s" : ""}${suffix}`;
    if (hours < 24) return `${prefix}${hours} hour${hours !== 1 ? "s" : ""}${suffix}`;
    if (days < 30) return `${prefix}${days} day${days !== 1 ? "s" : ""}${suffix}`;
    if (months < 12) return `${prefix}${months} month${months !== 1 ? "s" : ""}${suffix}`;
    return `${prefix}${years} year${years !== 1 ? "s" : ""}${suffix}`;
}

function toLocalDatetimeString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

type CopiedField = string | null;

export function EpochConverter() {
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

    // Derived from epochInput
    const { parsedDate, epochError, isMillis } = React.useMemo(() => {
        if (!epochInput.trim()) {
            return { parsedDate: null, epochError: "", isMillis: false };
        }
        const num = Number(epochInput.trim());
        if (isNaN(num)) {
            return { parsedDate: null, epochError: "Enter a valid number", isMillis: false };
        }
        // Auto-detect: if > 10 digits, treat as milliseconds
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
        const now = Math.floor(Date.now() / 1000);
        setEpochInput(String(now));
    };

    const setDateNow = () => {
        setDateInput(toLocalDatetimeString(new Date()));
    };

    const CopyButton = ({ value, field }: { value: string; field: string }) => (
        <button
            onClick={() => copyToClipboard(value, field)}
            className="flex items-center justify-center size-7 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition-all active:scale-90"
            title="Copy"
        >
            {copied === field ? (
                <Check className="size-3.5 text-emerald-500" />
            ) : (
                <Copy className="size-3.5" />
            )}
        </button>
    );

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Top Bar — live epoch */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                        <Timer className="size-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Epoch Converter</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <Zap className="size-3 text-amber-500 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 tabular-nums">{liveEpoch}</span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(String(liveEpoch), "live")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                        {copied === "live" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        Copy
                    </button>
                </div>
            </div>

            {/* Main Content — Two Cards */}
            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

                    {/* Card 1: Epoch -> Date */}
                    <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                        {/* Card Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-500/5 dark:to-purple-500/5">
                            <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Clock className="size-4.5 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Epoch to Date</h2>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Convert Unix timestamp to human-readable date</p>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-5 space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={epochInput}
                                        onChange={(e) => setEpochInput(e.target.value)}
                                        placeholder="e.g. 1740000000"
                                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all placeholder:text-zinc-400"
                                    />
                                    {isMillis && epochInput && !epochError && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">ms</span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={setNow}
                                    className="h-11 px-4 rounded-xl border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-xs font-bold gap-1.5 shrink-0"
                                >
                                    <RefreshCw className="size-3.5" /> Now
                                </Button>
                            </div>
                            {epochError && (
                                <p className="text-xs text-red-500 font-medium pl-1">{epochError}</p>
                            )}

                            {/* Results */}
                            {parsedDate && (
                                <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                                    {[
                                        { label: "UTC", value: parsedDate.toUTCString(), field: "utc", icon: Globe },
                                        { label: "Local", value: parsedDate.toLocaleString(), field: "local", icon: Calendar },
                                        { label: "ISO 8601", value: parsedDate.toISOString(), field: "iso", icon: Clock },
                                        { label: "Relative", value: formatRelativeTime(parsedDate), field: "relative", icon: Timer },
                                    ].map((item) => (
                                        <div
                                            key={item.field}
                                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <item.icon className="size-3.5 text-zinc-400 shrink-0" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 w-16 shrink-0">{item.label}</span>
                                                <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate">{item.value}</span>
                                            </div>
                                            <CopyButton value={item.value} field={item.field} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!parsedDate && !epochError && !epochInput && (
                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                    <Clock className="size-10 mb-3 text-indigo-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Enter a timestamp above</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Date -> Epoch */}
                    <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                        {/* Card Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-500/5 dark:to-pink-500/5">
                            <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Calendar className="size-4.5 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Date to Epoch</h2>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Convert date and time to Unix timestamp</p>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-5 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    className="flex-1 h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={setDateNow}
                                    className="h-11 px-4 rounded-xl border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 text-xs font-bold gap-1.5 shrink-0"
                                >
                                    <RefreshCw className="size-3.5" /> Now
                                </Button>
                            </div>

                            {/* Results */}
                            {dateEpochSeconds !== null && (
                                <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                                    {[
                                        { label: "Seconds", value: String(dateEpochSeconds), field: "d-sec" },
                                        { label: "Millis", value: String(dateEpochMillis), field: "d-ms" },
                                    ].map((item) => (
                                        <div
                                            key={item.field}
                                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-purple-200 dark:hover:border-purple-500/20 transition-all"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Timer className="size-3.5 text-zinc-400 shrink-0" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 w-16 shrink-0">{item.label}</span>
                                                <span className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">{item.value}</span>
                                            </div>
                                            <CopyButton value={item.value} field={item.field} />
                                        </div>
                                    ))}

                                    {/* Extra info */}
                                    <div className="mt-3 space-y-2">
                                        {[
                                            { label: "UTC", value: new Date(dateEpochSeconds * 1000).toUTCString(), field: "d-utc", icon: Globe },
                                            { label: "ISO 8601", value: new Date(dateEpochSeconds * 1000).toISOString(), field: "d-iso", icon: Clock },
                                            { label: "Relative", value: formatRelativeTime(new Date(dateEpochSeconds * 1000)), field: "d-rel", icon: ArrowRight },
                                        ].map((item) => (
                                            <div
                                                key={item.field}
                                                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100/50 dark:border-zinc-800/50 transition-all"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <item.icon className="size-3 text-zinc-400 shrink-0" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 w-16 shrink-0">{item.label}</span>
                                                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">{item.value}</span>
                                                </div>
                                                <CopyButton value={item.value} field={item.field} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {dateEpochSeconds === null && (
                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                    <Calendar className="size-10 mb-3 text-purple-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Select a date above</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
