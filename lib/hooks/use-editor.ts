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
        
        let savedContent = null;
        if (typeof window !== 'undefined') {
            savedContent = sessionStorage.getItem(`web-viewer-content-${initialFormat}`);
        }

        setContent(savedContent !== null ? savedContent : initialContent);
        setFormat(initialFormat);
        setIsSaved(true);
    }

    // Load initial data on mount. `content` deliberately starts out equal to
    // `initialContent` (matching the server-rendered snapshot) and is only
    // corrected from sessionStorage — a client-only store — once mounted;
    // seeding it eagerly via a lazy useState initializer instead would read
    // sessionStorage during the client's first render and mismatch the
    // server HTML that server-rendered preview components (JSON tree,
    // Markdown, SVG) already produced from `initialContent`.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedContent = sessionStorage.getItem(`web-viewer-content-${format}`);
        if (savedContent !== null && savedContent !== content) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(savedContent);
        }
        // Deliberately empty: this must run exactly once on mount, reading
        // whatever `format`/`content` were at that moment — not on every
        // change, which is what including them as deps would do.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
