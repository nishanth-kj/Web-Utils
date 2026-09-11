"use client";

import * as React from "react";
import { BookOpen, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { TOOLS, TOOL_CATEGORIES, type Tool } from "@/lib/constants/tools";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [isMac, setIsMac] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    }, []);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((current) => !current);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-9 w-9 justify-center px-0 text-muted-foreground md:w-56 md:justify-start md:px-3"
            >
                <Search className="size-4" />
                <span className="hidden flex-1 text-left text-sm font-normal md:inline">
                    Search tools...
                </span>
                <Kbd className="ml-auto hidden md:inline-flex">
                    {isMac ? "⌘" : "Ctrl"}K
                </Kbd>
            </Button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Search tools"
                description="Jump to a Web Utils tool"
            >
                <CommandInput placeholder="Search tools..." />
                <CommandList>
                    <CommandEmpty>No tools found.</CommandEmpty>
                    {TOOL_CATEGORIES.map((category) => {
                        const tools = TOOLS.filter((tool: Tool) => tool.category === category.id);
                        if (tools.length === 0) return null;
                        return (
                            <CommandGroup key={category.id} heading={category.label}>
                                {tools.map((tool: Tool) => (
                                    <CommandItem
                                        key={tool.id}
                                        value={`${tool.name} ${tool.description}`}
                                        onSelect={() => runCommand(() => router.push(tool.href))}
                                    >
                                        <tool.icon className="size-4" />
                                        <span>{tool.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        );
                    })}
                    <CommandSeparator />
                    <CommandGroup heading="Pages">
                        <CommandItem onSelect={() => runCommand(() => router.push("/documentation"))}>
                            <BookOpen className="size-4" />
                            <span>Documentation</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                            <Settings className="size-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
