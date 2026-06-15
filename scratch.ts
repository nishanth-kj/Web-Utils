import { jsonrepair } from 'jsonrepair';

function parseMultipleJson(content: string): any[] {
    const text = content.trim();
    if (!text) return [];

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
                    try {
                        const repaired = jsonrepair(chunk);
                        results.push(JSON.parse(repaired));
                    } catch (e2) {}
                }
            } else {
                i++;
            }
        } else if (char === '"') {
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
            while (i < text.length && !/\s|,|\]|\}/.test(text[i])) {
                i++;
            }
            if (i > start) {
                const chunk = text.substring(start, i);
                try {
                    results.push(JSON.parse(chunk));
                } catch {
                    try {
                        results.push(JSON.parse(jsonrepair(chunk)));
                    } catch {}
                }
            } else {
                i++;
            }
        }
    }

    if (results.length > 0) return results;
    throw new Error('Invalid JSON format');
}

const text = `
{
  {"asf":"asfd"},
  "tool": "Web Utils Pro",
  "status": "ready",
  "capabilities": {
    "syntax_highlighting": true,
    "formatting": "automatic",
    "supported_formats": [
      "JSON",
      "YAML", 
      "XML", 
      "CSV", 
      "Markdown"
    ]
  },
  "metrics": {
    "speed": "instant",
    "reliability": 0.999,
    "latency": "14ms"
  },
  "author": "Nishanth KJ"
}som thliek this {
  {"asf":"asfd"},
  "tool": "Web Utils Pro",
  "status": "ready",
  "capabilities": {
    "syntax_highlighting": true,
    "formatting": "automatic",
    "supported_formats": [
      "JSON",
      "YAML", 
      "XML", 
      "CSV", 
      "Markdown"
    ]
  },
  "metrics": {
    "speed": "instant",
    "reliability": 0.999,
    "latency": "14ms"
  },
  "author": "Nishanth KJ"
}
`;

console.log(JSON.stringify(parseMultipleJson(text), null, 2));
