export function parseMultipleJson(content: string): any[] {
    const text = content.trim();
    if (!text) return [];

    // Try a single JSON object first (most common case, fastest)
    try {
        return [JSON.parse(text)];
    } catch {}

    const results: any[] = [];
    let i = 0;

    function skipWhitespaceAndCommas() {
        while (i < text.length && (/\s/.test(text[i]) || text[i] === ',')) {
            i++;
        }
    }

    while (i < text.length) {
        skipWhitespaceAndCommas();
        if (i >= text.length) break;

        const char = text[i];
        let start = i;

        if (char === '{' || char === '[') {
            // Read until balanced
            let braces = 0;
            let brackets = 0;
            let inString = false;
            let escape = false;

            while (i < text.length) {
                const c = text[i];
                if (escape) {
                    escape = false;
                } else if (c === '\\') {
                    escape = true;
                } else if (c === '"') {
                    inString = !inString;
                } else if (!inString) {
                    if (c === '{') braces++;
                    if (c === '}') braces--;
                    if (c === '[') brackets++;
                    if (c === ']') brackets--;
                }

                i++;

                if (!inString && braces === 0 && brackets === 0) {
                    break;
                }
            }

            if (braces === 0 && brackets === 0) {
                const chunk = text.substring(start, i);
                try {
                    results.push(JSON.parse(chunk));
                } catch (e) {
                    // Ignore invalid JSON
                }
            } else {
                // Unbalanced, skip one char to prevent infinite loop
                i++;
            }
        } else if (char === '"') {
            // String literal
            let escape = false;
            i++;
            while (i < text.length) {
                const c = text[i];
                if (escape) {
                    escape = false;
                } else if (c === '\\') {
                    escape = true;
                } else if (c === '"') {
                    i++;
                    break;
                }
                i++;
            }
            try {
                results.push(JSON.parse(text.substring(start, i)));
            } catch {}
        } else {
            // Number, boolean, null
            while (i < text.length && !/\s|,|\]|\}/.test(text[i])) {
                i++;
            }
            if (i > start) {
                const chunk = text.substring(start, i);
                try {
                    results.push(JSON.parse(chunk));
                } catch {
                    // Not valid JSON literal
                }
            } else {
                i++;
            }
        }
    }

    if (results.length > 0) return results;

    throw new Error('Invalid JSON format');
}

export function formatMultipleJson(content: string): string {
    try {
        const parsedArray = parseMultipleJson(content);
        return parsedArray.map(obj => JSON.stringify(obj, null, 2)).join('\n\n');
    } catch {
        return content;
    }
}
