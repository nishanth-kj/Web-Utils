import { SqlVisuPage } from "@/components/sql-visu/sql-visu-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return <ToolPageShell toolSlot={<SqlVisuPage />} />;
}
