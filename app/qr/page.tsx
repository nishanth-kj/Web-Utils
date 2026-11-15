import { QrCodePage } from "@/components/qr-code/qr-code-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return <ToolPageShell toolSlot={<QrCodePage />} />;
}
