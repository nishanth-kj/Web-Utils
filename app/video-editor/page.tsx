import { VideoEditorPage } from "@/components/video-editor/video-editor-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Video Editor</h1>
                    <VideoEditorPage />
                </>
            }
        >
            <ToolSeoSection {...TOOL_SEO_CONTENT["/video-editor"]} />
        </ToolPageShell>
    );
}
