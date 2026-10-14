import { DummyFilePage } from "@/components/dummy/dummy-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell toolSlot={<DummyFilePage />}>
            <ToolSeoSection {...TOOL_SEO_CONTENT["/dummy"]} />
        </ToolPageShell>
    );
}
