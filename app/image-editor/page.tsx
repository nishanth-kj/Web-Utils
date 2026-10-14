import { ImageEditorPage } from "@/components/image-editor/image-editor-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Image Editor</h1>
                    <ImageEditorPage />
                </>
            }
        >
            <ToolSeoSection {...TOOL_SEO_CONTENT["/image-editor"]} />
        </ToolPageShell>
    );
}
