import { DrawPage } from "@/components/draw/draw-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Online Diagram and Whiteboard Editor</h1>
                    <DrawPage />
                </>
            }
        >
            <ToolSeoSection {...TOOL_SEO_CONTENT["/draw"]} />
        </ToolPageShell>
    );
}
