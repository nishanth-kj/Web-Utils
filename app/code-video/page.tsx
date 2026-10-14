import { CodeVideoPage } from "@/components/code-video/code-video-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Code Typing Video Generator</h1>
                    <CodeVideoPage />
                </>
            }
        />
    );
}
