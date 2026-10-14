import { CircuitPage } from "@/components/circuit/circuit-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return <ToolPageShell toolSlot={<CircuitPage />} />;
}
