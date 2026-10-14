import { CodeVideoPage } from "@/components/code-video/code-video-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Code Typing Video Generator</h1>
                    <CodeVideoPage />
                </>
            }
        >
            <ToolSeoSection {...TOOL_SEO_CONTENT["/code-video"]} />
        </ToolPageShell>
    );
}
