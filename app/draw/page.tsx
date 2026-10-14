import { DrawPage } from "@/components/draw/draw-page";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Online Diagram and Whiteboard Editor</h1>
                    <DrawPage />
                </>
            }
        />
    );
}
