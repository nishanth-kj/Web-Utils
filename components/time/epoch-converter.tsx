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
    LayoutList,
    LayoutGrid,
    Columns
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
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

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
  horizontalListSortingStrategy,
  rectSortingStrategy,
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
// Sortable Card/Row Component
// ----------------------------------------------------------------------
function SortableItem({ 
    id, 
    label, 
    icon, 
    value, 
    onCopy, 
    copied, 
    onRemove,
    viewMode
}: { 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    value: string; 
    onCopy: (val: string, field: string) => void;
    copied: string | null;
    onRemove: (id: string) => void;
    viewMode: string;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const cardRef = useRef<HTMLDivElement>(null);

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
                "group flex rounded-lg border bg-card shadow-sm transition-all relative overflow-hidden",
                isDragging ? "opacity-50 border-primary scale-[1.02] shadow-md" : "hover:border-border/80",
                viewMode === "grid" ? "flex-col p-4 gap-4 h-full" : "flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 sm:gap-4 mb-2"
            )}
            style={{ ...style, resize: viewMode === 'grid' ? 'both' : 'vertical' }}
        >
            <div className={cn("flex items-center gap-3 shrink-0", viewMode === "grid" && "w-full justify-between")}>
                <div className="flex items-center gap-2">
                    <button 
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 -ml-1 rounded"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="size-4" />
                    </button>
                    <span className="text-muted-foreground shrink-0">{icon}</span>
                    <span className="font-semibold text-xs tracking-tight truncate max-w-[120px]">{label}</span>
                </div>
                
                {viewMode === "grid" && (
                    <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6" onClick={() => onCopy(value, id)}>
                            {copied === id ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => onRemove(id)}>
                            <X className="size-3" />
                        </Button>
                    </div>
                )}
            </div>

            <div className={cn("px-1 font-mono text-sm tabular-nums text-foreground break-all", viewMode === "list" && "flex-1 sm:px-4", viewMode === "grid" && "text-base")}>
                {value}
            </div>

            {viewMode === "list" && (
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => onCopy(value, id)}>
                        {copied === id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => onRemove(id)}>
                        <X className="size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}


// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export function EpochConverter() {
    // Core draggable state
    const [activeOptions, setActiveOptions] = useLocalStorage<string[]>('activeEpochOptions', DEFAULT_ACTIVE);
    const [viewMode, setViewMode] = useLocalStorage('epochViewMode', 'list');

    const [input, setInput] = useState("");
    const [openTz, setOpenTz] = useState(false);
    
    const [liveEpoch, setLiveEpoch] = useState(() => Math.floor(Date.now() / 1000));
    const [copied, setCopied] = useState<CopiedField>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveEpoch(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useGSAP(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current.children, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, { dependencies: [viewMode] }); // Re-animate on view mode change

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
            
            {/* Top Navbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-b bg-card gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <Clock className="size-5 text-primary" />
                    <span className="font-bold text-base tracking-tight">Epoch Converter</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    {/* Add Option & Timezone */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8 text-xs px-3 shadow-sm">
                                    <Plus className="size-3 mr-1.5" /> Add Option
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {availableStandardOptions.map(opt => (
                                    <DropdownMenuItem key={opt.id} onClick={() => addOption(opt.id)} className="cursor-pointer">
                                        <div className="flex items-center gap-2 text-sm">
                                            {opt.icon} {opt.label}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                {availableStandardOptions.length === 0 && (
                                    <DropdownMenuItem disabled className="text-sm text-muted-foreground">All standard fields added</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Popover open={openTz} onOpenChange={setOpenTz}>
                            <PopoverTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8 text-xs px-3 shadow-sm border">
                                    <Globe className="size-3 mr-1.5" /> All Zones
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-0" align="end">
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

                    <div className="hidden sm:block h-4 w-px bg-border shrink-0" />

                    {/* View Options (Shadcn Select) */}
                    <Select value={viewMode} onValueChange={setViewMode}>
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue placeholder="View Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="list"><div className="flex items-center gap-2"><LayoutList className="size-3"/> List View</div></SelectItem>
                            <SelectItem value="grid"><div className="flex items-center gap-2"><LayoutGrid className="size-3"/> Grid View</div></SelectItem>
                            <SelectItem value="panels"><div className="flex items-center gap-2"><Columns className="size-3"/> Resizable Panels</div></SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <div className="hidden sm:block h-4 w-px bg-border shrink-0" />

                    <div className="flex items-center gap-2">
                        <Select value={clockFormat} onValueChange={setClockFormat}>
                            <SelectTrigger className="h-8 text-xs w-[100px] border-none bg-muted/20">
                                <SelectValue placeholder="Clock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="12h" className="text-xs">12-Hour</SelectItem>
                                <SelectItem value="24h" className="text-xs">24-Hour</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-4 w-px bg-border shrink-0" />
                    
                    <div 
                        onClick={() => copyToClipboard(String(liveEpoch), "live")}
                        className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity"
                        title="Copy Live Epoch"
                    >
                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-mono text-sm font-bold tabular-nums text-primary">{liveEpoch}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 pb-32">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-10">
                    
                    {/* Centered Top Input */}
                    <div className="w-full max-w-2xl text-center space-y-4">
                        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Epoch & Time Converter</h1>
                        <p className="text-muted-foreground text-sm">Convert Unix timestamps to dates and manage dynamic time outputs.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 relative shadow-lg rounded-xl overflow-hidden mt-6 border p-1 bg-card">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter Unix timestamp or date string..."
                                    className="h-12 md:h-14 font-mono text-base md:text-lg px-4 border-none shadow-none focus-visible:ring-0 bg-transparent"
                                />
                                {isInputMillis && !error && (
                                    <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                                        MILLIS
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0 bg-muted/30 p-1 rounded-lg">
                                <div className="relative">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                                        <Calendar className="size-5 text-muted-foreground" />
                                    </Button>
                                    <Input
                                        type="datetime-local"
                                        onChange={(e) => setInput(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                    />
                                </div>
                                <Button onClick={setNow} className="h-10 md:h-12 px-6 font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                                    <RefreshCw className="size-4 mr-2" /> Now
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-sm font-semibold text-destructive mt-2">{error}</p>}
                    </div>

                    {/* Draggable Dynamic Workspace */}
                    {parsedDate && epochSeconds && epochMillis && (
                        <div className="w-full space-y-6">
                            
                            <div className="flex items-center justify-between pb-3 border-b">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Workspace</h3>
                            </div>

                            <div className="min-h-[200px]" ref={containerRef}>
                                {viewMode === 'panels' ? (
                                    <div className="h-[500px] border rounded-lg overflow-hidden bg-card/50">
                                        <ResizablePanelGroup direction="horizontal">
                                            {activeOptions.slice(0, 4).map((id, index, arr) => {
                                                const details = getOptionDetails(id, parsedDate, epochMillis, epochSeconds);
                                                if (!details) return null;
                                                return (
                                                    <React.Fragment key={id}>
                                                        <ResizablePanel defaultSize={100 / arr.length} minSize={10}>
                                                            <div className="flex flex-col h-full p-4 hover:bg-muted/10 transition-colors group relative overflow-auto custom-scrollbar">
                                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 size-6 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => removeOption(id)}>
                                                                    <X className="size-3" />
                                                                </Button>
                                                                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                                                                    {details.icon} <span className="font-semibold text-xs">{details.label}</span>
                                                                </div>
                                                                <div className="font-mono text-lg tabular-nums text-foreground break-all mb-4">
                                                                    {details.value}
                                                                </div>
                                                                <Button variant="secondary" size="sm" className="mt-auto w-full text-xs" onClick={() => copyToClipboard(details.value, id)}>
                                                                    {copied === id ? <Check className="size-3 mr-1.5 text-emerald-500" /> : <Copy className="size-3 mr-1.5" />} Copy
                                                                </Button>
                                                            </div>
                                                        </ResizablePanel>
                                                        {index < arr.length - 1 && <ResizableHandle withHandle />}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </ResizablePanelGroup>
                                        {activeOptions.length > 4 && (
                                            <div className="text-center p-2 text-xs text-muted-foreground border-t bg-muted/20">
                                                Only the first 4 active options are shown in Resizable Panel mode. Switch to List/Grid to view all {activeOptions.length} fields.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={activeOptions}
                                            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                                        >
                                            <div className={cn(
                                                viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                            )}>
                                                {activeOptions.map((id) => {
                                                    const details = getOptionDetails(id, parsedDate, epochMillis, epochSeconds);
                                                    if (!details) return null;
                                                    
                                                    return (
                                                        <SortableItem 
                                                            key={id}
                                                            id={id}
                                                            label={details.label}
                                                            icon={details.icon}
                                                            value={details.value}
                                                            copied={copied}
                                                            onCopy={copyToClipboard}
                                                            onRemove={removeOption}
                                                            viewMode={viewMode}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                                
                                {activeOptions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground mt-4 gap-2">
                                        <p className="text-base font-semibold">Your workspace is empty.</p>
                                        <p className="text-sm">Use the "Add Option" menus above to build your custom converter.</p>
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
