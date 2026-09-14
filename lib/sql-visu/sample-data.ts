import type { ParsedTable, TableColumn, SqlDialect } from "./types";

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Jamie", "Avery", "Quinn"];
const LAST_NAMES = ["Smith", "Johnson", "Lee", "Brown", "Garcia", "Miller", "Davis", "Wilson", "Clark", "Lewis"];
const WORDS = ["alpha", "beta", "gamma", "delta", "nova", "echo", "pulse", "forge", "orbit", "harbor"];

function pick<T>(arr: T[], seed: number): T {
    return arr[((seed % arr.length) + arr.length) % arr.length];
}

type FakeValue = string | number | boolean;

/** Heuristic fake value from a column's declared type and its name — no real data, nothing sent anywhere. */
function fakeValueFor(column: TableColumn, rowIndex: number): FakeValue {
    const type = column.dataType.toUpperCase();
    const name = column.name.toLowerCase();

    if (/DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL/.test(type)) return Number((10 + rowIndex * 3.37).toFixed(2));
    if (/INT|SERIAL/.test(type)) return rowIndex + 1;
    if (/BOOL/.test(type)) return rowIndex % 2 === 0;
    if (/DATE|TIME/.test(type)) {
        const d = new Date(Date.UTC(2024, 0, 1 + rowIndex));
        const iso = d.toISOString();
        return type.includes("TIME") ? iso.slice(0, 19).replace("T", " ") : iso.slice(0, 10);
    }

    if (name.includes("email")) return `${pick(FIRST_NAMES, rowIndex).toLowerCase()}.${pick(LAST_NAMES, rowIndex + 1).toLowerCase()}${rowIndex}@example.com`;
    if (name.includes("name")) return `${pick(FIRST_NAMES, rowIndex)} ${pick(LAST_NAMES, rowIndex + 2)}`;
    if (name.includes("phone")) return `555-01${String(rowIndex).padStart(2, "0")}`;
    if (name.includes("url") || name.includes("link")) return `https://example.com/${pick(WORDS, rowIndex)}`;
    if (name.includes("title") || name.includes("subject")) return `${pick(WORDS, rowIndex)} ${pick(WORDS, rowIndex + 3)}`;
    if (name === "id" || name.endsWith("_id")) return rowIndex + 1;

    return `${pick(WORDS, rowIndex)}_${rowIndex + 1}`;
}

function formatValue(value: FakeValue, dialect: SqlDialect): string {
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") {
        return dialect === "postgresql" || dialect === "sqlite" ? (value ? "TRUE" : "FALSE") : value ? "1" : "0";
    }
    return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Builds INSERT statements with plausible fake values for every parsed table — for pasting
 * into a scratch database to try the schema out, not real data. Tables with no foreign keys
 * are emitted first so a straight top-to-bottom run respects FK order; a foreign key column's
 * value is kept within `1..rowsPerTable` so it always points at a row the referenced table's
 * own INSERT actually creates.
 */
export function generateSampleInserts(tables: ParsedTable[], dialect: SqlDialect, rowsPerTable: number): string {
    const byName = new Map(tables.map((t) => [t.name, t]));
    const ordered = [...tables].sort((a, b) => a.foreignKeys.length - b.foreignKeys.length);

    return ordered
        .map((table) => {
            if (table.columns.length === 0) return "";
            const columnNames = table.columns.map((c) => c.name);
            const rows: string[] = [];

            for (let i = 0; i < rowsPerTable; i++) {
                const values = table.columns.map((col) => {
                    const fk = table.foreignKeys.find((f) => f.columns.includes(col.name));
                    if (fk && byName.has(fk.refTable)) return formatValue((i % rowsPerTable) + 1, dialect);
                    return formatValue(fakeValueFor(col, i), dialect);
                });
                rows.push(`  (${values.join(", ")})`);
            }

            return `INSERT INTO ${table.name} (${columnNames.join(", ")})\nVALUES\n${rows.join(",\n")};`;
        })
        .filter(Boolean)
        .join("\n\n");
}
