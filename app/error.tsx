"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 bg-background px-6 text-center">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Something went wrong
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    This tool hit an unexpected error. Your work is kept in this browser, so
                    retrying usually recovers it.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={reset}>Try again</Button>
                <Button variant="ghost" asChild>
                    <Link href="/">Back to all tools</Link>
                </Button>
            </div>
        </div>
    );
}
