import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Page not found",
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 bg-background px-6 text-center">
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">404</p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    This page does not exist
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    The page may have moved, or the tool you are looking for has been renamed.
                </p>
            </div>
            <Button asChild>
                <Link href="/">Browse all tools</Link>
            </Button>
        </div>
    );
}
