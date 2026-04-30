"use client";


import { EpochConverter } from "./epoch-converter";

export function TimePage() {
    return (
        <main className="w-full h-full overflow-auto custom-scrollbar">
            <EpochConverter />
        </main>
    );
}
