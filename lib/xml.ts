// Prettier has no built-in XML parser, and its HTML parser rewrites XML
// (void elements, whitespace, casing rules), so XML/SVG/Android layouts get
// their own small pretty-printer.

const TOKEN_PATTERN = /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!(?:"[^"]*"|'[^']*'|[^'">])*>|<(?:"[^"]*"|'[^']*'|[^'">])*>|[^<]+/g;

function isOpeningTag(token: string) {
    return /^<[^!?/]/.test(token) && !token.endsWith("/>");
}

export function formatXml(xml: string, indent = "  "): string {
    const tokens = xml.trim().match(TOKEN_PATTERN) ?? [];
    const lines: string[] = [];
    let depth = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (/^[^<]/.test(token)) {
            const text = token.trim();
            if (text) lines.push(indent.repeat(depth) + text);
            continue;
        }

        if (token.startsWith("</")) {
            depth = Math.max(0, depth - 1);
            lines.push(indent.repeat(depth) + token);
            continue;
        }

        if (isOpeningTag(token)) {
            // Keep <tag>text</tag> on one line.
            const next = tokens[i + 1];
            const after = tokens[i + 2];
            if (next !== undefined && /^[^<]/.test(next) && after?.startsWith("</")) {
                lines.push(indent.repeat(depth) + token + next.trim() + after);
                i += 2;
                continue;
            }
            if (next?.startsWith("</")) {
                lines.push(indent.repeat(depth) + token + next);
                i += 1;
                continue;
            }
            lines.push(indent.repeat(depth) + token);
            depth++;
            continue;
        }

        lines.push(indent.repeat(depth) + token);
    }

    return lines.join("\n");
}

// Browser-only: reports the parser's first well-formedness error, or null.
export function findXmlError(xml: string): string | null {
    if (typeof DOMParser === "undefined") return null;
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const error = doc.getElementsByTagName("parsererror")[0];
    if (!error) return null;
    const message = error.textContent?.replace(/\s+/g, " ").trim() || "The document is not well-formed XML.";
    return message.replace(/^This page contains the following errors:\s*/i, "").replace(/\s*Below is a rendering.*$/i, "");
}
