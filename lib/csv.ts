// RFC 4180 CSV parsing and serialization. Splitting on "," and "\n" breaks
// on quoted fields ("Smith, John"), escaped quotes ("") and line breaks
// inside quotes, so editing a table and writing it back silently corrupted
// valid files.

export function parseCsv(text: string, delimiter = ","): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i += 2;
                    continue;
                }
                inQuotes = false;
            } else {
                field += char;
            }
            i++;
            continue;
        }

        if (char === '"' && field === "") {
            inQuotes = true;
        } else if (char === delimiter) {
            row.push(field);
            field = "";
        } else if (char === "\n" || char === "\r") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
            if (char === "\r" && text[i + 1] === "\n") i++;
        } else {
            field += char;
        }
        i++;
    }

    if (inQuotes) {
        throw new Error("Unterminated quoted field: a value opens with \" but never closes.");
    }

    // A trailing newline ends the last row rather than starting an empty one.
    if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

function needsQuoting(value: string, delimiter: string) {
    return value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r");
}

export function stringifyCsv(rows: string[][], delimiter = ","): string {
    return rows
        .map((row) =>
            row
                .map((value) => (needsQuoting(value, delimiter) ? `"${value.replace(/"/g, '""')}"` : value))
                .join(delimiter)
        )
        .join("\n");
}

// The table editor keys cells by column name, so blank or repeated headers
// would collapse columns together; give them unique names instead.
function uniqueHeaders(headers: string[]): string[] {
    const seen = new Map<string, number>();
    return headers.map((header, index) => {
        const base = header.trim() === "" ? `column_${index + 1}` : header;
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count === 0 ? base : `${base}_${count + 1}`;
    });
}

export function csvToRecords(text: string): Record<string, string>[] {
    const [headerRow, ...dataRows] = parseCsv(text.trim() === "" ? "" : text);
    if (!headerRow) return [];

    const headers = uniqueHeaders(headerRow);
    return dataRows.map((values) =>
        Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
    );
}

export function recordsToCsv(records: Record<string, string>[]): string {
    if (records.length === 0) return "";
    const headers = Object.keys(records[0]);
    return stringifyCsv([headers, ...records.map((record) => headers.map((header) => String(record[header] ?? "")))]);
}
