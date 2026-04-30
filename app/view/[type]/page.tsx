import {ViewerContainer} from "@/components/view/viewer-container";
import {Format} from "@/types";
import {DEFAULT_CONTENT} from "@/data/default-content";

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
    ];
}

export default async function ViewPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const format = type as Format;
    const content = (DEFAULT_CONTENT as Record<string, string>)[format] || "";

    return (
        <div className="flex w-full h-full overflow-hidden">
            <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 relative">
                <ViewerContainer
                    initialContent={content}
                    initialFormat={format}
                />
            </main>
        </div>
    );
}
