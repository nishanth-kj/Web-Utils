import { getGrammar, Prism } from "./languages";
import { CodeTheme, BackgroundPreset, resolveTokenColor, paintBackground } from "./themes";
import { CodeVideoConfig } from "./types";

export interface FlatChar {
    ch: string;
    color: string;
}

interface RowInfo {
    start: number; // index into chars[] where this row's text begins
    length: number; // number of visible (non-newline) chars in this row
}

export interface RenderModel {
    chars: FlatChar[];
    cumTime: number[];
    rows: RowInfo[];
    totalDuration: number;
    maxLineLength: number;
}

// Deterministic PRNG so the same code + settings always produce the same
// "human" typing rhythm, in both the live preview and the exported video.
function mulberry32(seed: number) {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function flattenTokens(code: string, languageId: string, theme: CodeTheme): FlatChar[] {
    const grammar = getGrammar(languageId);
    const tokens = Prism.tokenize(code, grammar);
    const chars: FlatChar[] = [];

    const pushText = (text: string, color: string) => {
        for (const ch of text) chars.push({ ch, color });
    };

    const walk = (list: (string | Prism.Token)[], color: string) => {
        for (const tok of list) {
            if (typeof tok === "string") {
                pushText(tok, color);
                continue;
            }
            const aliases: string[] = [tok.type, ...(Array.isArray(tok.alias) ? tok.alias : tok.alias ? [tok.alias] : [])];
            const tokColor = resolveTokenColor(theme, aliases);
            if (Array.isArray(tok.content)) {
                walk(tok.content, tokColor);
            } else if (typeof tok.content === "string") {
                pushText(tok.content, tokColor);
            }
        }
    };

    walk(tokens, theme.text);
    return chars;
}

const HOLD_SECONDS = 1.6;

export function buildRenderModel(code: string, languageId: string, theme: CodeTheme, cps: number): RenderModel {
    const chars = flattenTokens(code, languageId, theme);
    const rand = mulberry32(0x9e3779b9);
    const base = 1 / Math.max(1, cps);

    const cumTime: number[] = new Array(chars.length);
    const rows: RowInfo[] = [];
    let rowStart = 0;
    let t = 0;
    let maxLineLength = 0;

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i].ch;
        const jitter = 0.55 + rand() * 0.9;
        let dt = base * jitter;
        if (ch === "\n") dt += base * 3;
        else if (ch === " " || ch === "\t") dt *= 0.55;

        t += dt;
        cumTime[i] = t;

        if (ch === "\n") {
            const length = i - rowStart;
            maxLineLength = Math.max(maxLineLength, length);
            rows.push({ start: rowStart, length });
            rowStart = i + 1;
        }
    }
    const lastLength = chars.length - rowStart;
    maxLineLength = Math.max(maxLineLength, lastLength);
    rows.push({ start: rowStart, length: lastLength });

    return {
        chars,
        cumTime,
        rows,
        totalDuration: t + HOLD_SECONDS,
        maxLineLength,
    };
}

export function getRevealCount(model: RenderModel, t: number): number {
    const { cumTime } = model;
    if (cumTime.length === 0) return 0;
    let lo = 0;
    let hi = cumTime.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (cumTime[mid] <= t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

function locateCursor(model: RenderModel, n: number): { row: number; col: number } {
    const { rows } = model;
    let lo = 0;
    let hi = rows.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >>> 1;
        if (rows[mid].start <= n) lo = mid;
        else hi = mid - 1;
    }
    const row = lo;
    const col = Math.min(n - rows[row].start, rows[row].length);
    return { row, col };
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

export interface FontInfo {
    family: string;
}

export interface RenderOptions {
    /** Reveal everything and hide the cursor — used for the full-frame PNG export. */
    staticFull?: boolean;
    /** Override the width-derived scale factor (used by the PNG exporter, which has no fixed resolution). */
    scale?: number;
}

const REF_WIDTH = 1920;
const WINDOW_MARGIN = 56;

export function renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    model: RenderModel,
    config: CodeVideoConfig,
    theme: CodeTheme,
    background: BackgroundPreset,
    font: FontInfo,
    t: number,
    opts: RenderOptions = {}
) {
    const scale = opts.scale ?? width / REF_WIDTH;
    ctx.clearRect(0, 0, width, height);
    paintBackground(ctx, width, height, background);

    const outerMargin = WINDOW_MARGIN * scale;
    const winX = outerMargin;
    const winY = outerMargin;
    const winW = width - outerMargin * 2;
    const winH = height - outerMargin * 2;
    const radius = 18 * scale;

    // Drop shadow behind the window.
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 60 * scale;
    ctx.shadowOffsetY = 20 * scale;
    ctx.fillStyle = theme.windowBg;
    roundRectPath(ctx, winX, winY, winW, winH, radius);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.lineWidth = Math.max(1, scale);
    ctx.strokeStyle = theme.borderColor;
    roundRectPath(ctx, winX, winY, winW, winH, radius);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    roundRectPath(ctx, winX, winY, winW, winH, radius);
    ctx.clip();
    ctx.fillStyle = theme.windowBg;
    ctx.fillRect(winX, winY, winW, winH);

    const chromeH = config.showWindowChrome ? 46 * scale : 0;
    if (config.showWindowChrome) {
        ctx.fillStyle = theme.chromeBg;
        ctx.fillRect(winX, winY, winW, chromeH);

        const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
        const dotR = 7 * scale;
        const dotY = winY + chromeH / 2;
        dotColors.forEach((color, i) => {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(winX + 24 * scale + i * 20 * scale, dotY, dotR, 0, Math.PI * 2);
            ctx.fill();
        });

        const chromeFontSize = Math.max(11 * scale, config.fontSize * scale * 0.5);
        ctx.font = `${chromeFontSize}px ${font.family}`;
        ctx.fillStyle = theme.lineNumber;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(config.fileName || "untitled", winX + winW / 2, dotY);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
    }

    const fs = config.fontSize * scale;
    const lineHeight = Math.round(fs * 1.55);
    ctx.font = `${fs}px ${font.family}`;
    ctx.textBaseline = "top";
    const charWidth = ctx.measureText("0").width;

    const pad = config.padding * scale;
    const contentX = winX;
    const contentY = winY + chromeH;
    const contentW = winW;
    const contentH = winH - chromeH;
    const innerX = contentX + pad;
    const innerY = contentY + pad;
    const innerW = contentW - pad * 2;
    const innerH = contentH - pad * 2;

    const digits = String(model.rows.length).length;
    const gutterW = config.showLineNumbers ? (digits + 1.5) * charWidth : 0;
    const codeAreaX = innerX + gutterW;
    const codeAreaW = innerW - gutterW;

    const n = opts.staticFull ? model.chars.length : getRevealCount(model, t);
    const { row: cursorRow, col: cursorCol } = locateCursor(model, n);

    const visibleRows = Math.max(1, Math.floor(innerH / lineHeight));
    let scrollRows = opts.staticFull ? 0 : Math.max(0, cursorRow - (visibleRows - 3));
    if (opts.staticFull) scrollRows = 0;

    const visibleCols = Math.max(1, Math.floor(codeAreaW / charWidth));
    const scrollCols = opts.staticFull ? 0 : Math.max(0, cursorCol - (visibleCols - 3));

    ctx.save();
    ctx.beginPath();
    ctx.rect(innerX, innerY, innerW, innerH);
    ctx.clip();

    const lastVisibleRow = opts.staticFull ? model.rows.length - 1 : Math.min(model.rows.length - 1, scrollRows + visibleRows + 1);

    for (let r = scrollRows; r <= lastVisibleRow; r++) {
        const rowInfo = model.rows[r];
        if (!rowInfo) break;
        const y = innerY + (r - scrollRows) * lineHeight;

        if (config.showLineNumbers) {
            ctx.font = `${fs}px ${font.family}`;
            ctx.fillStyle = theme.lineNumber;
            ctx.textAlign = "right";
            ctx.fillText(String(r + 1), innerX + gutterW - 10 * scale, y);
            ctx.textAlign = "left";
        }

        const visibleLen = opts.staticFull ? rowInfo.length : Math.max(0, Math.min(rowInfo.length, n - rowInfo.start));
        if (visibleLen <= 0) continue;

        let runColor: string | null = null;
        let runText = "";
        let runStartCol = 0;

        const flush = () => {
            if (!runText) return;
            const x = codeAreaX + (runStartCol - scrollCols) * charWidth;
            ctx.fillStyle = runColor as string;
            ctx.fillText(runText, x, y);
            runText = "";
        };

        for (let c = 0; c < visibleLen; c++) {
            const ch = model.chars[rowInfo.start + c];
            if (ch.color !== runColor) {
                flush();
                runColor = ch.color;
                runStartCol = c;
            }
            runText += ch.ch;
        }
        flush();
    }

    if (!opts.staticFull) {
        const blinkOn = Math.floor(t * 2.2) % 2 === 0;
        if (blinkOn && cursorRow >= scrollRows && cursorRow <= lastVisibleRow) {
            const cx = codeAreaX + (cursorCol - scrollCols) * charWidth;
            const cy = innerY + (cursorRow - scrollRows) * lineHeight;
            ctx.fillStyle = theme.cursor;
            ctx.fillRect(cx, cy, Math.max(2, charWidth * 0.55), lineHeight * 0.86);
        }
    }

    ctx.restore(); // content clip
    ctx.restore(); // window clip
}

// Sizes a canvas that fits the full code block with no scrolling/clipping,
// for the "download as PNG" export. `scale` here doubles as a pixel-density
// multiplier (pass 2 for a crisp @2x image) rather than a resolution-preset ratio.
export function measureStaticSize(config: CodeVideoConfig, model: RenderModel, font: FontInfo, scale: number): { width: number; height: number } {
    const measureCanvas = document.createElement("canvas");
    const mctx = measureCanvas.getContext("2d")!;
    const fs = config.fontSize * scale;
    mctx.font = `${fs}px ${font.family}`;
    const charWidth = mctx.measureText("0").width;
    const lineHeight = Math.round(fs * 1.55);
    const chromeH = config.showWindowChrome ? 46 * scale : 0;
    const pad = config.padding * scale;
    const outerMargin = WINDOW_MARGIN * scale;
    const digits = String(model.rows.length).length;
    const gutterW = config.showLineNumbers ? (digits + 1.5) * charWidth : 0;
    const width = Math.ceil(gutterW + model.maxLineLength * charWidth + pad * 2 + outerMargin * 2);
    const height = Math.ceil(chromeH + model.rows.length * lineHeight + pad * 2 + outerMargin * 2);
    return { width: Math.max(width, 320), height: Math.max(height, 200) };
}
