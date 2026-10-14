import { EditorTool } from "@/components/workspace/editor-tool";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function EditorPage() {
    return <ToolPageShell toolSlot={<EditorTool />} />;
}
