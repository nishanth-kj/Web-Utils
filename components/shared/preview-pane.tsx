import React, { useMemo } from 'react';
import { HTMLViewer } from '@/components/shared/html-viewer';
import { CodeViewer } from '@/components/shared/code-viewer';
import { TableViewer } from '@/components/shared/table-viewer';
import { JsonTreeViewer } from '@/components/json/tree-viewer';
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
            {!isPreviewable && (
                <div className="flex flex-col items-center justify-center text-center h-full p-20 opacity-30">
                    <LayoutIcon className="size-16 mb-4 text-primary" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Live Preview</p>
                </div>
            )}
        </div>
    );
}
