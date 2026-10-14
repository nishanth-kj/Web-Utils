import { PasswordPage } from "@/components/password/password-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return <ToolPageShell toolSlot={<PasswordPage />} />;
}
