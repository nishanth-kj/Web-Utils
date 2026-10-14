import type { Mermaid } from "mermaid";
import { svgToDataUrl } from "@/lib/preview-document";

export interface UmlDiagram {
    /** Standalone SVG document with explicit pixel width/height. */
    svg: string;
    width: number;
    height: number;
}

// Mermaid is large; load it only when the UML editor actually renders.
let mermaidPromise: Promise<Mermaid> | null = null;
function loadMermaid(): Promise<Mermaid> {
    mermaidPromise ??= import("mermaid").then((module) => module.default);
    return mermaidPromise;
}

let renderCount = 0;

export async function renderUml(source: string, dark: boolean): Promise<UmlDiagram> {
    const mermaid = await loadMermaid();
    mermaid.initialize({
        startOnLoad: false,
        // Diagram text is user input: strict mode sanitizes labels and disables
        // click handlers and scripts.
        securityLevel: "strict",
        theme: dark ? "dark" : "default",
        // Plain SVG text instead of HTML <foreignObject> labels, so the result
        // renders as an <img> and can be drawn onto a canvas for PNG export.
        htmlLabels: false,
        // System fonts: an SVG shown as an image can't use the page's web fonts,
        // and text is measured with this font while laying out the diagram.
        fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    });

    // parse() reports syntax errors with line information; render() would
    // also leave an error graphic in the document.
    await mermaid.parse(source);

    const id = `uml-render-${++renderCount}`;
    try {
        const { svg } = await mermaid.render(id, source);
        return toStandaloneSvg(svg);
    } finally {
        document.getElementById(id)?.remove();
        document.getElementById(`d${id}`)?.remove();
    }
}

// Mermaid sizes its SVG to the container (width="100%" plus a max-width
// style). Give it fixed pixel dimensions from its viewBox so it has an
// intrinsic size as an image and as a downloaded file.
function toStandaloneSvg(svg: string): UmlDiagram {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.documentElement;
    const [, , viewWidth, viewHeight] = (root.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
    const width = Math.ceil(viewWidth || 800);
    const height = Math.ceil(viewHeight || 600);

    root.setAttribute("width", String(width));
    root.setAttribute("height", String(height));
    root.style.removeProperty("max-width");
    if (!root.getAttribute("xmlns")) root.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    return { svg: new XMLSerializer().serializeToString(root), width, height };
}

export async function diagramToPng(diagram: UmlDiagram, background: string, scale = 2): Promise<Blob> {
    const image = new Image();
    image.src = svgToDataUrl(diagram.svg);
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(diagram.width * scale);
    canvas.height = Math.ceil(diagram.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) =>
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed."))), "image/png")
    );
}
