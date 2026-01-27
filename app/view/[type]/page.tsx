import { ViewerContainer } from "@/components/viewer/viewer-container";
import { DEFAULT_CONTENT } from "@/lib/data";

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
    const format = type as any; // Cast to Format
    const content = DEFAULT_CONTENT[format as keyof typeof DEFAULT_CONTENT] || "";

    return (
        <ViewerContainer initialContent={content} initialFormat={format} />
    );
}
