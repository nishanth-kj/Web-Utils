"use client";

import { WorkspaceContainer } from "@/components/workspace/workspace-container";

export default function IdePage() {
    return (
        <div className="h-full overflow-hidden">
            <h1 className="sr-only">Online IDE and Code Sandbox</h1>
            <WorkspaceContainer initialContent='// Unified Workspace Active\nconsole.log("Ready");' initialFormat="javascript" />
        </div>
    );
}
