"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIALECTS, type SqlDialect } from "@/lib/sql-visu/types";
import { FormatView, SAMPLE_FORMAT_QUERY } from "./format-view";
import { ErDiagramView, SAMPLE_DDL } from "./er-diagram-view";
import { QueryFlowView, SAMPLE_QUERY } from "./query-flow-view";

type Mode = "format" | "er" | "query";

export function SqlVisuPage() {
    const [mode, setMode] = useState<Mode>("er");
    const [dialect, setDialect] = useState<SqlDialect>("postgresql");
    const [ddl, setDdl] = useState(SAMPLE_DDL);
    const [query, setQuery] = useState(SAMPLE_QUERY);
    const [formatInput, setFormatInput] = useState(SAMPLE_FORMAT_QUERY);

    return (
        <div className="flex flex-col h-full w-full bg-background">
            <div className="flex items-center justify-between gap-3 px-4 h-14 border-b bg-muted/10 flex-wrap">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <Database className="size-4 text-primary" />
                    </div>
                    <h1 className="text-xs font-black uppercase tracking-widest text-foreground">
                        SQL Visualizer
                    </h1>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {mode !== "format" && (
                        <Select value={dialect} onValueChange={(v) => setDialect(v as SqlDialect)}>
                            <SelectTrigger className="h-8 w-[140px] text-[11px] font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DIALECTS.map((d) => (
                                    <SelectItem key={d.value} value={d.value} className="text-[11px] font-bold">
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                        <TabsList className="h-9 bg-muted/50">
                            <TabsTrigger value="er" className="text-[10px] font-bold uppercase tracking-wide px-3">
                                ER Diagram
                            </TabsTrigger>
                            <TabsTrigger value="query" className="text-[10px] font-bold uppercase tracking-wide px-3">
                                Query Flow
                            </TabsTrigger>
                            <TabsTrigger value="format" className="text-[10px] font-bold uppercase tracking-wide px-3">
                                Format
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {mode === "format" && <FormatView input={formatInput} onInputChange={setFormatInput} />}
                {mode === "er" && <ErDiagramView dialect={dialect} ddl={ddl} onDdlChange={setDdl} />}
                {mode === "query" && <QueryFlowView dialect={dialect} query={query} onQueryChange={setQuery} />}
            </div>
        </div>
    );
}
