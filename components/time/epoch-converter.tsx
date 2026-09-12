"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
    Plus,
    Pause,
    Play,
    ArrowRight,
    Minus,
    Maximize2
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
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

const STEP_UNITS: { id: string; label: string; seconds: number }[] = [
    { id: 'sec', label: 'sec', seconds: 1 },
    { id: 'min', label: 'min', seconds: 60 },
    { id: 'hour', label: 'hr', seconds: 3600 },
    { id: 'day', label: 'day', seconds: 86400 },
];


// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------


/**
 * Returns pointer handlers that call `onStep` once immediately, then keep
 * calling it on a repeating timer while held, ramping up from slow to fast.
 */
function useHoldRepeat(onStep: () => void) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepRef = useRef(onStep);
    stepRef.current = onStep;

    const clear = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    const start = useCallback(() => {
        stepRef.current();
        let delay = 450; // starts slow, ramps up the longer it's held
        const schedule = () => {
            timerRef.current = setTimeout(() => {
                stepRef.current();
                delay = Math.max(50, delay * 0.8);
                schedule();
            }, delay);
        };
        schedule();
    }, []);

    useEffect(() => clear, [clear]);

    return {
        onPointerDown: start,
        onPointerUp: clear,
        onPointerLeave: clear,
    };
}

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
                "group flex items-center justify-between p-3 mb-2 rounded-md border bg-card/50 hover:bg-card transition-colors",
                isDragging && "opacity-50 border-primary shadow-sm"
            )}
        >
            <div className="flex items-center gap-3 shrink-0 w-[180px]">
                <button 
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="size-4" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{icon}</span>
                    <span className="font-semibold text-xs tracking-tight">{label}</span>
                </div>
            </div>

            <div className="flex-1 px-4 font-mono text-sm tabular-nums text-foreground truncate">
                {value}
            </div>

            <div className="flex items-center gap-1 shrink-0">
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
    const [clockFormat, setClockFormat] = useLocalStorage('clockFormat', '12h');
    const [activeOptions, setActiveOptions] = useLocalStorage<string[]>('activeEpochOptions', DEFAULT_ACTIVE);

    const [input, setInput] = useState("");
    const [openTz, setOpenTz] = useState(false);

    // Seeded as null (not Date.now()) so the server and the client's first
    // render agree; the real, ticking value only exists after mount.
    const [liveEpoch, setLiveEpoch] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [copied, setCopied] = useState<CopiedField>(null);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const titleRef = React.useRef<HTMLDivElement>(null);
    const isInputEmpty = !input.trim();

    useGSAP(() => {
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                y: isInputEmpty ? '25vh' : 0,
                duration: 0.8,
                ease: "power3.inOut"
            });
        }
        if (titleRef.current) {
            gsap.to(titleRef.current, {
                height: isInputEmpty ? 'auto' : 0,
                opacity: isInputEmpty ? 1 : 0,
                marginBottom: isInputEmpty ? 24 : 0,
                duration: 0.8,
                ease: "power3.inOut"
            });
        }
    }, [isInputEmpty]);

    // Fills in the real value right after mount, once, so the placeholder
    // shown during SSR doesn't linger for a full second before the first tick.
    useEffect(() => {
        const seed = () => setLiveEpoch(Math.floor(Date.now() / 1000));
        seed();
    }, []);

    // Live clock / input ticker — respects pause state.
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            setLiveEpoch(now);

            setInput((current) => {
                if (!current.trim()) return current;
                return String(now);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);

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
        const now = Math.floor(Date.now() / 1000);
        setInput(String(now));
        setLiveEpoch(now);
    };

    // ------------------------------------------------------------
    // Input step controls
    // ------------------------------------------------------------

    const stepInput = useCallback(
        (direction: 1 | -1) => {
            const current = parsedDate ?? new Date();

            const next = new Date(
                current.getTime() + direction * 1000
            );

            setInput(String(Math.floor(next.getTime() / 1000)));
        },
        [parsedDate]
    );

    const holdForward = useHoldRepeat(() => {
        stepInput(1);
    });

    const holdBackward = useHoldRepeat(() => {
        stepInput(-1);
    });

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
            
            {/* Top Navbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-card/50">
                <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <span className="font-bold tracking-tight">Epoch Converter</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <Select value={clockFormat} onValueChange={setClockFormat}>
                        <SelectTrigger className="h-8 text-xs w-[90px] bg-transparent border-none focus:ring-0">
                            <SelectValue placeholder="Clock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12h" className="text-xs">12-Hour</SelectItem>
                            <SelectItem value="24h" className="text-xs">24-Hour</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="h-4 w-px bg-border" />
                    
                    <div
                        onClick={() => liveEpoch !== null && copyToClipboard(String(liveEpoch), "live")}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className={cn(
                            "size-2 rounded-full bg-primary",
                            !isPaused && "animate-pulse"
                        )} />
                        <span className={cn(
                            "font-mono text-sm font-semibold tabular-nums",
                            isPaused ? "text-muted-foreground" : "text-primary"
                        )}>
                            {liveEpoch ?? "—"}
                        </span>
                        {copied === "live" && <Check className="size-3.5 text-emerald-500" />}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-4 md:p-8 relative">
                <div 
                    ref={containerRef}
                    className="w-full max-w-2xl mx-auto flex flex-col items-center"
                >
                    
                    <div 
                        ref={titleRef}
                        className="text-center overflow-hidden flex flex-col items-center justify-center"
                    >
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Epoch Converter</h1>
                        <p className="text-sm text-muted-foreground">Type a unix timestamp or date string to begin converting.</p>
                    </div>
                    
                    {/* Unified Input + Controls */}
                    <div className="w-full relative shadow-sm rounded-md overflow-hidden border bg-card focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                        <div className="flex items-center w-full">

                            {/* Main Input */}
                            <div className="relative flex-1 min-w-0 flex items-center">
                                <Input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter timestamp or date..."
                                    className="h-10 font-mono text-sm px-3 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent"
                                />

                                <div className="absolute right-2 flex items-center gap-1.5 pointer-events-none">
                                    {isInputMillis && !error && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] tracking-wider uppercase font-semibold py-0 h-4"
                                        >
                                            MILLIS
                                        </Badge>
                                    )}

                                    {input && (
                                        <button
                                            type="button"
                                            className="size-5 rounded-sm flex items-center justify-center text-muted-foreground hover:bg-muted/50 pointer-events-auto"
                                            onClick={() => setInput("")}
                                            aria-label="Clear input"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right-side controls */}
                            <div className="flex items-center shrink-0 border-l bg-muted/10">

                                {/* Date picker */}
                                <div className="relative h-10 flex items-center justify-center border-r">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-3 rounded-none text-muted-foreground hover:bg-muted/30"
                                    >
                                        <Calendar className="size-3.5 mr-1.5" />
                                        <span className="text-xs">Date</span>
                                    </Button>

                                    <Input
                                        type="datetime-local"
                                        onChange={(e) => setInput(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                                        title="Pick a date"
                                    />
                                </div>

                                {/* Now */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={setNow}
                                    className="h-10 px-3 rounded-none font-medium text-xs hover:bg-muted/30 text-foreground"
                                >
                                    <RefreshCw className="size-3.5 mr-1.5" />
                                    Now
                                </Button>

                                <div className="h-5 w-px bg-border" />

                                {/* Decrease */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-10 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/40 touch-none"
                                    title="Decrease by one second"
                                    {...holdBackward}
                                >
                                    <Minus className="size-3.5" />
                                </Button>

                                {/* Pause / Play */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-10 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    onClick={() => setIsPaused((p) => !p)}
                                    title={isPaused ? "Resume live clock" : "Pause live clock"}
                                    aria-label={isPaused ? "Resume live clock" : "Pause live clock"}
                                >
                                    {isPaused ? (
                                        <Play className="size-3.5" />
                                    ) : (
                                        <Pause className="size-3.5" />
                                    )}
                                </Button>

                                {/* Increase */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-10 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/40 touch-none"
                                    title="Increase by one second"
                                    {...holdForward}
                                >
                                    <Plus className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-xs font-medium text-destructive mt-1.5 w-full px-1">{error}</p>}

                    {/* Draggable Dynamic Workspace */}
                    {parsedDate && epochSeconds && epochMillis && (
                        <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Actions Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Converted Values</h3>
                                
                                <div className="flex items-center gap-2">
<DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-xs px-2 bg-transparent border-dashed">
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
                                                <DropdownMenuItem disabled className="text-xs text-muted-foreground">All fields added</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Popover open={openTz} onOpenChange={setOpenTz}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-xs px-2 bg-transparent border-dashed">
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
<DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={activeOptions}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col mt-4">
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
                                    </div>
                                </SortableContext>
                            </DndContext>
                            
                            {activeOptions.length === 0 && (
                                <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground mt-2">
                                    <p className="text-sm">No fields visible.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}