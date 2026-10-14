import { ImageEditorPage } from "@/components/image-editor/image-editor-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Image Editor</h1>
                    <ImageEditorPage />
                </>
            }
        />
    );
}
