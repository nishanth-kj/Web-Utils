import { DummyFilePage } from "@/components/dummy/dummy-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return <ToolPageShell toolSlot={<DummyFilePage />} />;
}
