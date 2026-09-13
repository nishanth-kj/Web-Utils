"use client";

import { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { AlertTriangle, Copy, Trash, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonacoEditor as Editor } from "@/components/shared/lazy-monaco";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { formatSql } from "@/lib/format-code";

export const SAMPLE_FORMAT_QUERY = `select u.id, u.name, count(p.id) as post_count from users u left join posts p on p.user_id = u.id where u.active = 1 group by u.id, u.name order by post_count desc limit 20;`;

interface FormatViewProps {
    input: string;
    onInputChange: (value: string) => void;
}

export function FormatView({ input, onInputChange }: FormatViewProps) {
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isFormatting, setIsFormatting] = useState(false);

    const handleFormat = useCallback(async () => {
        setIsFormatting(true);
        setError(null);
        try {
            setOutput(await formatSql(input));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to format SQL.");
        } finally {
            setIsFormatting(false);
        }
    }, [input]);

    const handleCopy = useCallback(() => {
        if (output) navigator.clipboard.writeText(output);
    }, [output]);

    return (
        <ResizablePanelGroup key={isMobile ? "mobile" : "desktop"} direction={isMobile ? "vertical" : "horizontal"} className="flex-1 min-h-0 min-w-0">
            <ResizablePanel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
                <div className={`flex flex-col h-full bg-muted/5 min-h-0 min-w-0 ${isMobile ? "border-b" : "border-r"}`}>
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/10 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Source SQL
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                className="h-7 text-[10px] font-bold uppercase gap-1.5"
                                onClick={handleFormat}
                                disabled={isFormatting || !input.trim()}
                            >
                                <Wand2 className="size-3" /> Format
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                    onInputChange("");
                                    setOutput("");
                                }}
                                title="Clear"
                            >
                                <Trash className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden min-h-0 min-w-0">
                        <Editor
                            height="100%"
                            language="sql"
                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                            value={input}
                            onChange={(val) => onInputChange(val ?? "")}
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on",
                                padding: { top: 10, bottom: 10 },
                            }}
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive" className="m-3 mt-0">
                            <AlertTriangle className="size-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0 min-w-0">
                <div className="flex flex-col h-full bg-background min-h-0 min-w-0">
                    <div className="flex items-center justify-between px-4 h-11 border-b bg-muted/5 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Formatted Output
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                            disabled={!output}
                            title="Copy"
                        >
                            <Copy className="size-3.5" />
                        </Button>
                    </div>
                    <div className="flex-1 relative overflow-hidden min-h-0 min-w-0">
                        <Editor
                            height="100%"
                            language="sql"
                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                            value={output}
                            options={{
                                readOnly: true,
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on",
                                padding: { top: 10, bottom: 10 },
                            }}
                        />
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
