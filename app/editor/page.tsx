import { EditorTool } from "@/components/workspace/editor-tool";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function EditorPage() {
    return (
        <ToolPageShell toolSlot={<EditorTool />}>
            <ToolSeoSection {...TOOL_SEO_CONTENT["/editor"]} />
        </ToolPageShell>
    );
}
