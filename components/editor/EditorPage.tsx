"use client";

import { EditorContainer } from "./editor-container";
import { DEFAULT_CONTENT } from "@/data/default-content";

export function EditorPage() {
    return (
        <div className="flex w-full h-full overflow-hidden bg-background">
            <main className="flex-1 overflow-hidden relative">
                <EditorContainer
                    initialContent={DEFAULT_CONTENT.html}
                    initialFormat="html"
                />
            </main>
        </div>
    );
}
