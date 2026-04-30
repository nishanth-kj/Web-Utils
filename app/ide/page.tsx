"use client";

import { WorkspaceContainer } from "@/components/workspace/workspace-container";

export default function IdePage() {
    return (
        <div className="h-full overflow-hidden">
            <WorkspaceContainer initialContent='// Unified Workspace Active\nconsole.log("Ready");' initialFormat="javascript" />
        </div>
    );
}
