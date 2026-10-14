import { VideoEditorPage } from "@/components/video-editor/video-editor-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Video Editor</h1>
                    <VideoEditorPage />
                </>
            }
        />
    );
}
