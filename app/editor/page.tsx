"use client";

import { EditorContainer } from "@/components/editor/editor-container";
import { DEFAULT_CONTENT } from "@/lib/data";

export default function EditorPage() {
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
