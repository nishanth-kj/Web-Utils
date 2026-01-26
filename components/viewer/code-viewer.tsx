"use client";

import React, { forwardRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
    content: string;
    language: string;
    className?: string;
    showLineNumbers?: boolean;
}

export const CodeViewer = forwardRef<HTMLDivElement, CodeViewerProps>(({ content, language, className, showLineNumbers = true }, ref) => {
    return (
        <div ref={ref} className={`rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 ${className || ""}`}>
            <SyntaxHighlighter
                language={language}
                style={atomDark}
                customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                }}
                codeTagProps={{
                    style: {
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit'
                    }
                }}
                preTagProps={{
                    style: {
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit'
                    }
                }}
                showLineNumbers={showLineNumbers}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
});

CodeViewer.displayName = "CodeViewer";
