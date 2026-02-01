"use client";

import React, { forwardRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
    content: string;
    language: string;
    className?: string;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
}

export const CodeViewer = forwardRef<HTMLDivElement, CodeViewerProps>(({ content, language, className, showLineNumbers = true, wrapLines = true }, ref) => {
    return (
        <div ref={ref} className={className}>
            <SyntaxHighlighter
                language={language}
                style={atomDark}
                wrapLines={wrapLines}
                lineProps={{
                    style: {
                        wordBreak: 'break-all',
                        whiteSpace: wrapLines ? 'pre-wrap' : 'pre'
                    }
                }}
                customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit'
                }}
                showLineNumbers={showLineNumbers}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
});

CodeViewer.displayName = "CodeViewer";
