import { UmlPage } from "@/components/uml/uml-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return <ToolPageShell toolSlot={<UmlPage />} />;
}
