import { useState, useEffect, useCallback } from 'react';
import { Format } from '@/types';

interface UseEditorOptions {
    initialContent: string;
    initialFormat: Format;
    debounceMs?: number;
}

function sessionKey(format: Format) {
    return `web-viewer-content-${format}`;
}

function readSession(format: Format): string | null {
    return typeof window === 'undefined' ? null : sessionStorage.getItem(sessionKey(format));
}

export function useEditor({ initialContent, initialFormat, debounceMs = 500 }: UseEditorOptions) {
    const [content, setContent] = useState(initialContent);
    const [format, setFormat] = useState<Format>(initialFormat);
    const [isSaved, setIsSaved] = useState(true);

    // Sync to prop changes during render (not an effect) so a format switch
    // via client-side navigation takes effect before the first paint.
    const [prevInitialContent, setPrevInitialContent] = useState(initialContent);
    const [prevInitialFormat, setPrevInitialFormat] = useState(initialFormat);

    if (initialContent !== prevInitialContent || initialFormat !== prevInitialFormat) {
        setPrevInitialContent(initialContent);
        setPrevInitialFormat(initialFormat);
        setContent(readSession(initialFormat) ?? initialContent);
        setFormat(initialFormat);
        setIsSaved(true);
    }

    // Restore any sessionStorage content once mounted. This can't be done
    // during render like the sync above: `content` has to start out equal to
    // `initialContent` so it matches the server-rendered HTML that preview
    // components (JSON tree, Markdown, SVG) already produced — sessionStorage
    // only exists client-side, so reading it has to wait for mount.
    useEffect(() => {
        const savedContent = readSession(format);
        if (savedContent !== null && savedContent !== content) {
            setContent(savedContent);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only, by design
    }, []);

    // Debounced sessionStorage persistence
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const timer = setTimeout(() => sessionStorage.setItem(sessionKey(format), content), debounceMs);
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
