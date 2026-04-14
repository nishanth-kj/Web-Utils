import { useState, useEffect, useCallback } from 'react';
import { Format } from '@/types';

interface UseEditorOptions {
    initialContent: string;
    initialFormat: Format;
    debounceMs?: number;
}

export function useEditor({ initialContent, initialFormat, debounceMs = 500 }: UseEditorOptions) {
    const [content, setContent] = useState(initialContent);
    const [format, setFormat] = useState<Format>(initialFormat);
    const [isSaved, setIsSaved] = useState(true);
    
    // Sync to props without useEffect to avoid cascading renders
    const [prevInitialContent, setPrevInitialContent] = useState(initialContent);
    const [prevInitialFormat, setPrevInitialFormat] = useState(initialFormat);

    if (initialContent !== prevInitialContent || initialFormat !== prevInitialFormat) {
        setPrevInitialContent(initialContent);
        setPrevInitialFormat(initialFormat);
        setContent(initialContent);
        setFormat(initialFormat);
        setIsSaved(true);
    }

    // Debounced sessionStorage persistence
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const timer = setTimeout(() => {
            sessionStorage.setItem(`web-viewer-content-${format}`, content);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [content, format, debounceMs]);

    const updateContent = useCallback((newContent: string) => {
        setContent(newContent);
        setIsSaved(false);
    }, []);

    const updateFormat = useCallback((newFormat: Format) => {
        setFormat(newFormat);
        setIsSaved(false);
    }, []);

    return {
        content,
        setContent: updateContent,
        format,
        setFormat: updateFormat,
        isSaved,
        setIsSaved
    };
}
