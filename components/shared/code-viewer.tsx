"use client";

import React, { forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface CodeViewerProps {
    content: string;
    language: string;
    className?: string;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
}

export const CodeViewer = forwardRef<HTMLDivElement, CodeViewerProps>(({ content, language, className, wrapLines = true }, ref) => {
    const { resolvedTheme } = useTheme();

    return (
        <div ref={ref} className={`h-full w-full ${className}`}>
            <Editor
                height="100%"
                language={language}
                value={content}
                theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: wrapLines ? "on" : "off",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderLineHighlight: "none",
                    scrollbar: {
                        vertical: "hidden",
                        horizontal: "hidden"
                    },
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    contextmenu: false,
                    padding: { top: 8 }
                }}
            />
        </div>
    );
});

CodeViewer.displayName = "CodeViewer";
