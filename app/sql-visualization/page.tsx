import { SqlVisuPage } from "@/components/sql-visu/sql-visu-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export default function Page() {
    return (
        <ToolPageShell toolSlot={<SqlVisuPage />}>
            <ToolSeoSection {...TOOL_SEO_CONTENT["/sql-visualization"]} />
        </ToolPageShell>
    );
}
