import { useState, useEffect, useCallback } from 'react';
import { Format } from '@/types';
import { ALL_FORMATS } from '@/lib/formats';

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

// Seeds the content another format's viewer opens with (e.g. after a
// conversion), since each format keeps its own session draft.
export function writeSessionContent(format: Format, content: string) {
    sessionStorage.setItem(sessionKey(format), content);
}

export function readSessionContent(format: Format): string | null {
    return readSession(format);
}

const EDITOR_FORMAT_KEY = 'web-editor-format';

// The code editor reopens in the format it was last used with, or the one a
// viewer hands it through "Open in Editor".
export function writeEditorFormat(format: Format) {
    sessionStorage.setItem(EDITOR_FORMAT_KEY, format);
}

export function readEditorFormat(): Format | null {
    if (typeof window === 'undefined') return null;
    const value = sessionStorage.getItem(EDITOR_FORMAT_KEY);
    return value && (ALL_FORMATS as string[]).includes(value) ? (value as Format) : null;
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
