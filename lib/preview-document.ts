// Live previews render arbitrary pasted markup, so they must never run with
// this site's origin. Every preview document is loaded into a frame that is
// sandboxed *without* allow-same-origin: scripts still run (so interactive
// snippets work), but in an opaque origin that cannot read cookies,
// localStorage, or the parent page's DOM.

export const PREVIEW_SANDBOX_WITH_JS = "allow-scripts allow-popups";
export const PREVIEW_SANDBOX_NO_JS = "allow-popups";

const BOOTSTRAP_CSS = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">';
const BOOTSTRAP_JS = '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>';
const TAILWIND_JS = '<script src="https://cdn.tailwindcss.com"></script>';

interface PreviewOptions {
    useBootstrap?: boolean;
    useTailwind?: boolean;
    background?: string;
}

export function buildPreviewDocument(content: string, { useBootstrap = false, useTailwind = false, background = "transparent" }: PreviewOptions = {}): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${useBootstrap ? BOOTSTRAP_CSS : ""}
${useTailwind ? TAILWIND_JS : ""}
<style>body { margin: 0; padding: 0; background-color: ${background} !important; }</style>
</head>
<body>
${content}
${useBootstrap ? BOOTSTRAP_JS : ""}
</body>
</html>`;
}

export function escapeHtmlAttribute(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// A Blob URL inherits this site's origin, so the page opened in the new tab
// only contains a trusted wrapper; the user's markup lives in a sandboxed
// srcdoc frame inside it, exactly like the inline preview.
export function openSandboxedPreview(previewDocument: string) {
    const wrapper = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview - Web Utils</title>
<style>html, body { margin: 0; height: 100%; } iframe { display: block; width: 100%; height: 100%; border: 0; }</style>
</head>
<body>
<iframe title="Preview" sandbox="${PREVIEW_SANDBOX_WITH_JS}" srcdoc="${escapeHtmlAttribute(previewDocument)}"></iframe>
</body>
</html>`;

    const url = URL.createObjectURL(new Blob([wrapper], { type: "text/html" }));
    const previewWindow = window.open(url, "_blank");
    // Cross-origin frames can still reach `top.opener`; cut the link so the
    // preview can't navigate this tab (reverse tabnabbing).
    if (previewWindow) previewWindow.opener = null;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Rendering SVG through <img> disables its scripts, event handlers and
// external resource loads, unlike inserting the markup into the page DOM.
export function svgToDataUrl(svg: string): string {
    let markup = svg.trim();
    // Standalone SVG documents need the namespace to render as an image;
    // markup copied from HTML/JSX often omits it.
    if (/^<svg\b/i.test(markup) && !/^<svg\b[^>]*\sxmlns\s*=/i.test(markup)) {
        markup = markup.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
