import {ViewerContainer} from "@/components/view/viewer-container";
import {Format} from "@/types";
import {DEFAULT_CONTENT} from "@/data/default-content";
import {labelForFormat} from "@/lib/format-labels";
import {ToolPageShell} from "@/components/shared/tool-page-shell";
import {ToolSeoSection} from "@/components/shared/tool-seo-section";
import {TOOL_SEO_CONTENT} from "@/data/tool-seo-content";

export function generateStaticParams() {
    return [
        { type: 'html' },
        { type: 'json' },
        { type: 'yaml' },
        { type: 'react' },
        { type: 'markdown' },
        { type: 'xml' },
        { type: 'svg' },
        { type: 'csv' },
        { type: 'android-xml' },
    ];
}

export default async function ViewPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const format = type as Format;
    const content = (DEFAULT_CONTENT as Record<string, string>)[format] || "";
    const seoContent = TOOL_SEO_CONTENT[`/view/${type}`];

    return (
        <ToolPageShell
            toolSlot={
                <div className="flex w-full h-full overflow-hidden">
                    <h1 className="sr-only">{labelForFormat(format)} Viewer</h1>
                    <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
                        <ViewerContainer
                            initialContent={content}
                            initialFormat={format}
                        />
                    </main>
                </div>
            }
        >
            {seoContent && <ToolSeoSection {...seoContent} />}
        </ToolPageShell>
    );
}
