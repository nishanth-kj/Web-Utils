export interface CodeTheme {
    id: string;
    name: string;
    windowBg: string;
    chromeBg: string;
    text: string;
    lineNumber: string;
    cursor: string;
    borderColor: string;
    tokens: Record<string, string>;
}

// Colors are keyed by Prism token type/alias. resolveTokenColor() walks a
// token's aliases in order and returns the first match, falling back to `text`.
export const THEMES: CodeTheme[] = [
    {
        id: "midnight",
        name: "Midnight",
        windowBg: "#282c34",
        chromeBg: "#21252b",
        text: "#abb2bf",
        lineNumber: "#495162",
        cursor: "#61afef",
        borderColor: "rgba(255,255,255,0.08)",
        tokens: {
            comment: "#5c6370",
            prolog: "#5c6370",
            doctype: "#5c6370",
            cdata: "#5c6370",
            punctuation: "#abb2bf",
            property: "#d19a66",
            tag: "#e06c75",
            boolean: "#d19a66",
            number: "#d19a66",
            constant: "#d19a66",
            symbol: "#d19a66",
            selector: "#98c379",
            "attr-name": "#d19a66",
            string: "#98c379",
            char: "#98c379",
            builtin: "#56b6c2",
            inserted: "#98c379",
            operator: "#56b6c2",
            entity: "#56b6c2",
            url: "#56b6c2",
            atrule: "#c678dd",
            "attr-value": "#98c379",
            keyword: "#c678dd",
            function: "#61afef",
            "class-name": "#e5c07b",
            regex: "#98c379",
            important: "#c678dd",
            variable: "#e06c75",
        },
    },
    {
        id: "dracula",
        name: "Dracula",
        windowBg: "#282a36",
        chromeBg: "#21222c",
        text: "#f8f8f2",
        lineNumber: "#6272a4",
        cursor: "#ff79c6",
        borderColor: "rgba(255,255,255,0.08)",
        tokens: {
            comment: "#6272a4",
            punctuation: "#f8f8f2",
            property: "#bd93f9",
            tag: "#ff79c6",
            boolean: "#bd93f9",
            number: "#bd93f9",
            constant: "#bd93f9",
            selector: "#50fa7b",
            "attr-name": "#50fa7b",
            string: "#f1fa8c",
            char: "#f1fa8c",
            builtin: "#8be9fd",
            operator: "#ff79c6",
            entity: "#8be9fd",
            url: "#8be9fd",
            atrule: "#ff79c6",
            "attr-value": "#f1fa8c",
            keyword: "#ff79c6",
            function: "#50fa7b",
            "class-name": "#8be9fd",
            regex: "#f1fa8c",
            important: "#ff79c6",
            variable: "#f8f8f2",
        },
    },
    {
        id: "nord",
        name: "Nord",
        windowBg: "#2e3440",
        chromeBg: "#272c36",
        text: "#d8dee9",
        lineNumber: "#4c566a",
        cursor: "#88c0d0",
        borderColor: "rgba(255,255,255,0.08)",
        tokens: {
            comment: "#4c566a",
            punctuation: "#eceff4",
            property: "#8fbcbb",
            tag: "#81a1c1",
            boolean: "#b48ead",
            number: "#b48ead",
            constant: "#8fbcbb",
            selector: "#a3be8c",
            "attr-name": "#8fbcbb",
            string: "#a3be8c",
            char: "#a3be8c",
            builtin: "#88c0d0",
            operator: "#81a1c1",
            entity: "#88c0d0",
            url: "#88c0d0",
            atrule: "#81a1c1",
            "attr-value": "#a3be8c",
            keyword: "#81a1c1",
            function: "#88c0d0",
            "class-name": "#8fbcbb",
            regex: "#ebcb8b",
            important: "#81a1c1",
            variable: "#d8dee9",
        },
    },
    {
        id: "monokai",
        name: "Monokai",
        windowBg: "#272822",
        chromeBg: "#1f201b",
        text: "#f8f8f2",
        lineNumber: "#75715e",
        cursor: "#f92672",
        borderColor: "rgba(255,255,255,0.08)",
        tokens: {
            comment: "#75715e",
            punctuation: "#f8f8f2",
            property: "#ae81ff",
            tag: "#f92672",
            boolean: "#ae81ff",
            number: "#ae81ff",
            constant: "#ae81ff",
            selector: "#a6e22e",
            "attr-name": "#a6e22e",
            string: "#e6db74",
            char: "#e6db74",
            builtin: "#66d9ef",
            operator: "#f92672",
            entity: "#66d9ef",
            url: "#66d9ef",
            atrule: "#f92672",
            "attr-value": "#e6db74",
            keyword: "#f92672",
            function: "#a6e22e",
            "class-name": "#a6e22e",
            regex: "#e6db74",
            important: "#f92672",
            variable: "#f8f8f2",
        },
    },
    {
        id: "github-light",
        name: "GitHub Light",
        windowBg: "#ffffff",
        chromeBg: "#f6f8fa",
        text: "#24292e",
        lineNumber: "#a8b1bb",
        cursor: "#0969da",
        borderColor: "rgba(0,0,0,0.08)",
        tokens: {
            comment: "#6a737d",
            punctuation: "#24292e",
            property: "#005cc5",
            tag: "#22863a",
            boolean: "#005cc5",
            number: "#005cc5",
            constant: "#005cc5",
            selector: "#22863a",
            "attr-name": "#6f42c1",
            string: "#032f62",
            char: "#032f62",
            builtin: "#005cc5",
            operator: "#d73a49",
            entity: "#6f42c1",
            url: "#032f62",
            atrule: "#d73a49",
            "attr-value": "#032f62",
            keyword: "#d73a49",
            function: "#6f42c1",
            "class-name": "#6f42c1",
            regex: "#032f62",
            important: "#d73a49",
            variable: "#e36209",
        },
    },
    {
        id: "synthwave",
        name: "Synthwave",
        windowBg: "#241b2f",
        chromeBg: "#1c1527",
        text: "#ffffff",
        lineNumber: "#614b79",
        cursor: "#36f9f6",
        borderColor: "rgba(255,255,255,0.1)",
        tokens: {
            comment: "#614b79",
            punctuation: "#ffffff",
            property: "#f97e72",
            tag: "#ff7edb",
            boolean: "#f97e72",
            number: "#f97e72",
            constant: "#f97e72",
            selector: "#fede5d",
            "attr-name": "#36f9f6",
            string: "#fede5d",
            char: "#fede5d",
            builtin: "#36f9f6",
            operator: "#ff7edb",
            entity: "#36f9f6",
            url: "#36f9f6",
            atrule: "#ff7edb",
            "attr-value": "#fede5d",
            keyword: "#ff7edb",
            function: "#36f9f6",
            "class-name": "#fede5d",
            regex: "#fede5d",
            important: "#ff7edb",
            variable: "#ffffff",
        },
    },
];

export function getTheme(id: string): CodeTheme {
    return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function resolveTokenColor(theme: CodeTheme, aliases: string[]): string {
    for (const alias of aliases) {
        if (theme.tokens[alias]) return theme.tokens[alias];
    }
    return theme.text;
}

export interface BackgroundPreset {
    id: string;
    name: string;
    swatch: string;
    stops: string[];
    angle: number;
}

export const BACKGROUNDS: BackgroundPreset[] = [
    { id: "plain-dark", name: "Plain Dark", swatch: "#0d1117", stops: ["#0d1117", "#0d1117"], angle: 135 },
    { id: "plain-light", name: "Plain Light", swatch: "#eef0f3", stops: ["#eef0f3", "#eef0f3"], angle: 135 },
    { id: "ocean", name: "Ocean", swatch: "linear-gradient(135deg,#0f2027,#2c5364)", stops: ["#0f2027", "#203a43", "#2c5364"], angle: 135 },
    { id: "sunset", name: "Sunset", swatch: "linear-gradient(135deg,#ff512f,#8e2de2)", stops: ["#ff512f", "#dd2476", "#8e2de2"], angle: 135 },
    { id: "aurora", name: "Aurora", swatch: "linear-gradient(135deg,#43cea2,#185a9d)", stops: ["#43cea2", "#185a9d"], angle: 135 },
    { id: "candy", name: "Candy", swatch: "linear-gradient(135deg,#ee9ca7,#ffdde1)", stops: ["#ee9ca7", "#ffdde1"], angle: 135 },
    { id: "forest", name: "Forest", swatch: "linear-gradient(135deg,#134e5e,#71b280)", stops: ["#134e5e", "#71b280"], angle: 135 },
];

export function getBackground(id: string): BackgroundPreset {
    return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[2];
}

export function paintBackground(ctx: CanvasRenderingContext2D, width: number, height: number, bg: BackgroundPreset) {
    if (bg.stops.length <= 1 || (bg.stops.length === 2 && bg.stops[0] === bg.stops[1])) {
        ctx.fillStyle = bg.stops[0];
        ctx.fillRect(0, 0, width, height);
        return;
    }
    const rad = (bg.angle * Math.PI) / 180;
    const x = Math.cos(rad) * width;
    const y = Math.sin(rad) * height;
    const gradient = ctx.createLinearGradient(0, 0, x, y);
    bg.stops.forEach((color, i) => {
        gradient.addColorStop(i / (bg.stops.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}
