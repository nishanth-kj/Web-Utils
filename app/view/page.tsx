import { ViewerContainer } from "@/components/view/viewer-container";
import { DEFAULT_CONTENT } from "@/data/default-content";

export default function ViewPage() {
  return (
    <div className="h-full overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
      <ViewerContainer
        initialContent={DEFAULT_CONTENT.html}
        initialFormat="html"
      />
    </div>
  );
}
