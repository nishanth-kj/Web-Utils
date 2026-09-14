import { CodeVisualizerContainer } from "@/components/code-visualizer/code-visualizer-container";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export default function Page() {
    return (
        <ToolPageShell
            toolSlot={
                <>
                    <h1 className="sr-only">Code Visualizer — Step-by-Step Code Debugger</h1>
                    <CodeVisualizerContainer />
                </>
            }
        />
    );
}
