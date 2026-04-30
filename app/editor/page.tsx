"use client";

import { WorkspaceContainer } from "@/components/workspace/workspace-container";

export default function EditorPage() {
    return (
        <div className="flex w-full h-full overflow-hidden bg-background">
            <main className="flex-1 overflow-hidden relative">
                <WorkspaceContainer 
                    initialContent='{\n  "name": "Web Utils Workspace",\n  "status": "Ready"\n}' 
                    initialFormat="json" 
                />
            </main>
        </div>
    );
}
