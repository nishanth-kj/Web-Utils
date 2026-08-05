import React, { useMemo } from 'react';
import { HTMLViewer } from '@/components/shared/html-viewer';
import { CodeViewer } from '@/components/shared/code-viewer';
import { TableViewer } from '@/components/shared/table-viewer';
import { JsonTreeViewer } from '@/components/json/tree-viewer';
import { AndroidXmlViewer } from '@/components/shared/android-viewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LayoutIcon } from "lucide-react";
import { PREVIEWABLE_FORMATS } from '@/lib/formats';
import { Format } from '@/types';

interface PreviewPaneProps {
    format: Format;
    content: string;
    setContent?: (content: string) => void;
    useBootstrap?: boolean;
    useTailwind?: boolean;
}

export function PreviewPane({ format, content, setContent, useBootstrap = false, useTailwind = false }: PreviewPaneProps) {
    const tableData = useMemo(() => {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                    return parsed;
                }
            } else if (format === 'csv') {
                const lines = content.trim().split('\n');
                if (lines.length > 0) {
                    const headers = lines[0].split(',');
                    return lines.slice(1).map(line => {
                        const values = line.split(',');
                        return headers.reduce((obj, header, i) => {
                            obj[header] = values[i];
                            return obj;
                        }, {} as any);
                    });
                }
            }
        } catch {
            return null;
        }
        return null;
    }, [content, format]);

    const formattedJsonContent = useMemo(() => {
        if (format !== 'json') return content;
        try {
            return JSON.stringify(JSON.parse(content), null, 2);
        } catch {
            return content;
        }
    }, [content, format]);

    const handleTableDataChange = (newData: any[]) => {
        if (!setContent) return;
        if (format === 'json') {
            setContent(JSON.stringify(newData, null, 2));
        } else if (format === 'csv') {
            if (newData.length > 0) {
                const headers = Object.keys(newData[0]);
                const newContent = [
                    headers.join(','), 
                    ...newData.map(row => headers.map(h => row[h]).join(','))
                ].join('\n');
                setContent(newContent);
            }
        }
    };

    const parsedJson = useMemo(() => {
        if (format !== 'json') return null;
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    }, [content, format]);

    const isPreviewable = PREVIEWABLE_FORMATS.includes(format);

    return (
        <div className="absolute inset-0 bg-background overflow-hidden">
            {format === 'html' && <HTMLViewer content={content} useBootstrap={useBootstrap} useTailwind={useTailwind} enableJS={true} />}
            {format === 'json' && (
                tableData 
                ? <div className="p-8 bg-background min-h-full overflow-auto"><TableViewer data={tableData} onDataChange={handleTableDataChange} /></div> 
                : <div className="p-0 bg-background h-full overflow-auto"><JsonTreeViewer data={parsedJson} /></div>
            )}
            {format === 'markdown' && (
                <div className="prose prose-zinc dark:prose-invert max-w-none bg-background p-8 h-full overflow-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
            )}
            {format === 'svg' && (
                <div className="flex items-center justify-center p-8 bg-background h-full overflow-auto" dangerouslySetInnerHTML={{ __html: content }} />
            )}
            {format === 'csv' && (
                <div className="p-8 bg-background h-full overflow-auto">
                    <TableViewer data={tableData || []} onDataChange={handleTableDataChange} />
                </div>
            )}
            {['yaml', 'react', 'xml'].includes(format) && (
                <div className="bg-background h-full overflow-auto p-0">
                    <CodeViewer 
                        content={content} 
                        language={format === 'react' ? 'tsx' : format === 'yaml' ? 'yaml' : 'xml'} 
                        wrapLines={true} 
                    />
                </div>
            )}
            {format === 'android-xml' && (
                <AndroidXmlViewer content={content} />
            )}
            {!isPreviewable && (
                <div className="flex flex-col items-center justify-center text-center h-full p-20 relative overflow-hidden bg-background">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-96 h-96 bg-primary/40 rounded-full blur-[100px] animate-pulse duration-3000" />
                        <div className="w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] absolute translate-x-20 -translate-y-20 animate-pulse duration-5000" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse duration-2000" />
                            <div className="size-24 rounded-2xl bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <LayoutIcon className="size-10 text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all duration-500" strokeWidth={1.5} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-3">Preview Unavailable</h3>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                            The <span className="font-mono text-primary font-bold px-1.5 py-0.5 rounded-md bg-primary/10">{format.toUpperCase()}</span> format cannot be rendered as a live preview. Switch to the Code Viewer or Raw Output to see the contents.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
