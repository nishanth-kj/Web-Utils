export interface ResolutionPreset {
    id: string;
    label: string;
    width: number;
    height: number;
    group: "Landscape" | "Vertical" | "Square";
}

export const RESOLUTIONS: ResolutionPreset[] = [
    { id: "720p", label: "720p (1280×720)", width: 1280, height: 720, group: "Landscape" },
    { id: "1080p", label: "1080p (1920×1080)", width: 1920, height: 1080, group: "Landscape" },
    { id: "1440p", label: "1440p (2560×1440)", width: 2560, height: 1440, group: "Landscape" },
    { id: "4k", label: "4K (3840×2160)", width: 3840, height: 2160, group: "Landscape" },
    { id: "1080p-vertical", label: "1080×1920 (Shorts/Reels)", width: 1080, height: 1920, group: "Vertical" },
    { id: "4k-vertical", label: "4K Vertical (2160×3840)", width: 2160, height: 3840, group: "Vertical" },
    { id: "square", label: "Square (1080×1080)", width: 1080, height: 1080, group: "Square" },
];

export const FPS_OPTIONS = [24, 30, 60, 120] as const;
export type FpsOption = (typeof FPS_OPTIONS)[number];

export interface CodeVideoConfig {
    code: string;
    languageId: string;
    themeId: string;
    backgroundId: string;
    fileName: string;
    fontSize: number;
    padding: number;
    showLineNumbers: boolean;
    showWindowChrome: boolean;
    cps: number;
    resolutionId: string;
    fps: FpsOption;
}

export const DEFAULT_CONFIG: CodeVideoConfig = {
    code: `function greet(name) {\n  const message = \`Hello, \${name}!\`;\n  console.log(message);\n  return message;\n}\n\ngreet("world");\n`,
    languageId: "javascript",
    themeId: "midnight",
    backgroundId: "ocean",
    fileName: "index.js",
    fontSize: 22,
    padding: 28,
    showLineNumbers: true,
    showWindowChrome: true,
    cps: 26,
    resolutionId: "1080p",
    fps: 60,
};
