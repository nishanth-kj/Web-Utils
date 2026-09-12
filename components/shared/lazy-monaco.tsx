"use client";

import dynamic from "next/dynamic";

export type { OnMount } from "@monaco-editor/react";

function EditorSkeleton() {
    return (
        <div className="flex h-full w-full flex-col gap-2 bg-background p-4">
            <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            <span className="sr-only">Loading editor…</span>
        </div>
    );
}

// Monaco is ~1.5 MB, so it stays out of the shared bundle and loads only where an editor renders.
export const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: EditorSkeleton,
});
