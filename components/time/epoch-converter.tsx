"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Clock, 
    Calendar,
    Copy,
    RefreshCw,
    Globe,
    X,
    Check,
    Hash,
    Zap,
    Timer,
    Code2,
    GripVertical,
    Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    formatRelativeTime, 
    getDayOfYear, 
    getWeekNumber 
} from "@/lib/time-utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";

type CopiedField = string | null;

const BASE_OPTIONS = [
    { id: 'sec', label: 'Unix Seconds', icon: <Hash className="size-4" /> },
    { id: 'ms', label: 'Unix Millis', icon: <Zap className="size-4" /> },
    { id: 'us', label: 'Unix Microseconds', icon: <Timer className="size-4" /> },
    { id: 'ns', label: 'Unix Nanoseconds', icon: <Timer className="size-4" /> },
    { id: 'utc', label: 'GMT / UTC', icon: <Globe className="size-4" /> },
    { id: 'loc', label: 'Local Time', icon: <Calendar className="size-4" /> },
    { id: 'iso', label: 'ISO 8601', icon: <Code2 className="size-4" /> },
    { id: 'rel', label: 'Relative Time', icon: <Clock className="size-4" /> },
    { id: 'hex', label: 'Hex (Seconds)', icon: <Hash className="size-4" /> },
    { id: 'doy', label: 'Day of Year', icon: <Calendar className="size-4" /> },
    { id: 'wn', label: 'Week Number', icon: <Calendar className="size-4" /> },
];

const DEFAULT_ACTIVE = ['sec', 'ms', 'utc', 'loc', 'iso', 'rel'];

// ----------------------------------------------------------------------
// Sortable Row Component
// ----------------------------------------------------------------------
function SortableRow({ 
    id, 
    label, 
    icon, 
    value, 
    onCopy, 
    copied, 
    onRemove 
}: { 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    value: string; 
    onCopy: (val: string, field: string) => void;
    copied: string | null;
    onRemove: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "group flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 sm:gap-4 mb-2 rounded-lg border bg-card shadow-sm transition-all relative",
                isDragging ? "opacity-50 border-primary scale-[1.01]" : "hover:border-border/80"
            )}
        >
            <div className="flex items-center gap-3 shrink-0">
                <button 
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 -ml-1 rounded"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="size-4" />
                </button>
                <div className="flex items-center gap-2 w-40 shrink-0">
                    <span className="text-muted-foreground shrink-0">{icon}</span>
                    <span className="font-semibold text-xs tracking-tight truncate">{label}</span>
                </div>
            </div>

            <div className="flex-1 px-1 sm:px-4 font-mono text-sm tabular-nums text-foreground break-all">
                {value}
            </div>

            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => onCopy(value, id)}>
                    {copied === id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => onRemove(id)}>
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}


// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export function EpochConverter() {
    const [prefTimeZone, setPrefTimeZone] = useLocalStorage('timeZone', 'UTC');
    const [prefTimeFormat, setPrefTimeFormat] = useLocalStorage('timeFormat', 'seconds');
    const [clockFormat, setClockFormat] = useLocalStorage('clockFormat', '12h');
    
    // Core draggable state
    const [activeOptions, setActiveOptions] = useLocalStorage<string[]>('activeEpochOptions', DEFAULT_ACTIVE);

    const [input, setInput] = useState("");
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

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setActiveOptions((items) => {
                const oldIndex = items.indexOf(String(active.id));
                const newIndex = items.indexOf(String(over.id));
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeOption = (id: string) => {
        setActiveOptions(prev => prev.filter(opt => opt !== id));
    };

    const addOption = (id: string) => {
        if (!activeOptions.includes(id)) {
            setActiveOptions(prev => [...prev, id]);
        }
    };

    const availableStandardOptions = BASE_OPTIONS.filter(o => !activeOptions.includes(o.id));

    const getOptionDetails = (id: string, date: Date, ms: number, sec: number) => {
        if (id.startsWith('tz_')) {
            const tz = id.replace('tz_', '');
            let val = "Invalid Timezone";
            try {
                val = date.toLocaleString(undefined, { timeZone: tz, hour12: clockFormat === '12h' });
            } catch (e) {}
            return {
                label: tz,
                icon: <Globe className="size-4" />,
                value: val
            };
        }

        const base = BASE_OPTIONS.find(o => o.id === id);
        if (!base) return null;

        let val = "";
        switch(id) {
            case 'sec': val = String(sec); break;
            case 'ms': val = String(ms); break;
            case 'us': val = String(ms * 1000); break;
            case 'ns': val = String(ms * 1000000); break;
            case 'utc': val = date.toUTCString(); break;
            case 'loc': val = date.toLocaleString(undefined, { hour12: clockFormat === '12h' }); break;
            case 'iso': val = date.toISOString(); break;
            case 'rel': val = formatRelativeTime(date); break;
            case 'hex': val = `0x${sec.toString(16).toUpperCase()}`; break;
            case 'doy': val = String(getDayOfYear(date)); break;
            case 'wn': val = String(getWeekNumber(date)); break;
            default: val = "";
        }

        return { label: base.label, icon: base.icon, value: val };
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

                    <div className="flex items-center gap-3">
                        <select 
                            value={prefTimeZone}
                            onChange={(e) => setPrefTimeZone(e.target.value)}
                            className="bg-transparent text-xs text-muted-foreground font-medium outline-none cursor-pointer hover:text-foreground transition-colors"
                        >
                            <option value="UTC">UTC Zone</option>
                            <option value="Local">Local Zone</option>
                        </select>
                        
                        <select 
                            value={clockFormat}
                            onChange={(e) => setClockFormat(e.target.value)}
                            className="bg-transparent text-xs text-muted-foreground font-medium outline-none cursor-pointer hover:text-foreground transition-colors"
                        >
                            <option value="12h">12-Hour</option>
                            <option value="24h">24-Hour</option>
                        </select>
                        
                        <select 
                            value={prefTimeFormat}
                            onChange={(e) => setPrefTimeFormat(e.target.value)}
                            className="bg-transparent text-xs text-muted-foreground font-medium outline-none cursor-pointer hover:text-foreground transition-colors"
                        >
                            <option value="seconds">Seconds</option>
                            <option value="millis">Millis</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-6 pb-32">
                <div className="max-w-2xl mx-auto space-y-6">
                    
                    {/* Unified Input */}
                    <div className="flex flex-col sm:flex-row gap-2 relative shadow-sm rounded-md">
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter Unix timestamp or date string..."
                                className="h-10 font-mono text-sm px-4 focus-visible:ring-1"
                            />
                            {isInputMillis && !error && (
                                <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0">
                                    MILLIS
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Button variant="outline" size="sm" className="h-10 w-10 p-0 shrink-0">
                                    <Calendar className="size-4 text-muted-foreground" />
                                </Button>
                                <Input
                                    type="datetime-local"
                                    onChange={(e) => setInput(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                    title="Select date and time"
                                />
                            </div>
                            <Button onClick={setNow} size="sm" className="h-10 px-5 font-semibold text-xs">
                                <RefreshCw className="size-3 mr-2" /> Now
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-destructive px-1">{error}</p>
                    )}

                    {/* Draggable Dynamic Workspace */}
                    {parsedDate && epochSeconds && epochMillis && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            
                            <div className="flex items-center justify-between pb-2 border-b">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Fields</h3>
                                
                                <div className="flex items-center gap-2">
                                    {/* Add Standard Field Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                                <Plus className="size-3 mr-1" /> Add Field
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            {availableStandardOptions.map(opt => (
                                                <DropdownMenuItem key={opt.id} onClick={() => addOption(opt.id)}>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        {opt.icon} {opt.label}
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                            {availableStandardOptions.length === 0 && (
                                                <DropdownMenuItem disabled className="text-xs text-muted-foreground">All standard fields added</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Add Timezone Combobox */}
                                    <Popover open={openTz} onOpenChange={setOpenTz}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                                <Globe className="size-3 mr-1" /> Timezone
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[220px] p-0" align="end">
                                            <Command>
                                                <CommandInput placeholder="Search timezone..." className="h-9 text-xs" />
                                                <CommandList>
                                                    <CommandEmpty>No timezone found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {typeof Intl !== 'undefined' && (Intl as any).supportedValuesOf ? (
                                                            (Intl as any).supportedValuesOf('timeZone').map((tz: string) => {
                                                                const tzId = `tz_${tz}`;
                                                                return (
                                                                    <CommandItem
                                                                        key={tz}
                                                                        value={tz}
                                                                        onSelect={() => {
                                                                            addOption(tzId);
                                                                            setOpenTz(false);
                                                                        }}
                                                                        className="text-xs"
                                                                        disabled={activeOptions.includes(tzId)}
                                                                    >
                                                                        {tz}
                                                                        <Check className={cn("ml-auto h-4 w-4", activeOptions.includes(tzId) ? "opacity-100" : "opacity-0")} />
                                                                    </CommandItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <CommandItem value="America/New_York" onSelect={() => { addOption('tz_America/New_York'); setOpenTz(false); }} className="text-xs">
                                                                America/New_York
                                                            </CommandItem>
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="min-h-[200px]">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={activeOptions}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {activeOptions.map((id) => {
                                            const details = getOptionDetails(id, parsedDate, epochMillis, epochSeconds);
                                            if (!details) return null;
                                            
                                            return (
                                                <SortableRow 
                                                    key={id}
                                                    id={id}
                                                    label={details.label}
                                                    icon={details.icon}
                                                    value={details.value}
                                                    copied={copied}
                                                    onCopy={copyToClipboard}
                                                    onRemove={removeOption}
                                                />
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>
                                
                                {activeOptions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/20 text-muted-foreground mt-4">
                                        <p className="text-sm">No fields active.</p>
                                        <p className="text-xs">Use the buttons above to add fields.</p>
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
