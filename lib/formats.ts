import { Format } from "@/types";

export const PREVIEWABLE_FORMATS: Format[] = ['html', 'json', 'yaml', 'react', 'markdown', 'xml', 'svg', 'csv', 'android-xml'];

export const ALL_FORMATS: Format[] = [
    'html',
    'json',
    'yaml',
    'react',
    'markdown',
    'xml',
    'android-xml',
    'svg',
    'csv',
    'typescript',
    'javascript',
    'css',
    'sql',
    'python',
    'golang',
    'rust',
    'cpp',
    'java'
];

export const getLanguage = (fmt: string) => {
    const f = fmt.toLowerCase();
    if (f === 'react') return 'tsx';
    if (f === 'markdown') return 'markdown';
    if (['svg', 'xml', 'android-xml'].includes(f)) return 'xml';
    if (f === 'typescript') return 'typescript';
    if (f === 'javascript') return 'javascript';
    if (f === 'golang') return 'go';
    if (f === 'python') return 'python';
    return f;
};
