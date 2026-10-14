import { CodeVisualizerContainer } from "@/components/code-visualizer/code-visualizer-container";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Code Visualizer — Step-by-Step Code Debugger</h1>
                    <CodeVisualizerContainer />
                </>
            }
        >
            <ToolSeoSection {...TOOL_SEO_CONTENT["/code-visualizer"]} />
        </ToolPageShell>
    );
}
