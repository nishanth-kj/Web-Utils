import type { SqlValue } from "sql.js";
import { serializeTablesToDdl } from "./ddl-serializer";
import { generateSampleInserts } from "./sample-data";
import type { ParsedTable } from "./types";

export interface PreviewTable {
    name: string;
    columns: string[];
    rows: SqlValue[][];
}

let sqlJsPromise: ReturnType<typeof import("sql.js").default> | null = null;

// sql.js's WASM binary is ~650KB, so it only loads the first time someone actually
// runs a preview — never on initial page load, matching how this app already
// lazy-loads Monaco, Prettier, and sql-formatter.
async function getSqlJs() {
    if (!sqlJsPromise) {
        const initSqlJs = (await import("sql.js")).default;
        sqlJsPromise = initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
    }
    return sqlJsPromise;
}

/**
 * Actually runs the generated schema + sample data through a real (in-memory,
 * throwaway) SQLite engine compiled to WASM, instead of only trusting that the
 * DDL/INSERT text is syntactically plausible. Always serializes as the SQLite
 * dialect regardless of the dialect selected elsewhere in the UI, since that's
 * the engine actually executing it.
 */
export async function runSchemaPreview(tables: ParsedTable[], rowsPerTable: number): Promise<PreviewTable[]> {
    const SQL = await getSqlJs();
    const db = new SQL.Database();

    try {
        const ddl = serializeTablesToDdl(tables, "sqlite");
        db.run(ddl);

        const inserts = generateSampleInserts(tables, "sqlite", rowsPerTable);
        if (inserts.trim()) db.run(inserts);

        return tables.map((table): PreviewTable => {
            const result = db.exec(`SELECT * FROM "${table.name}" LIMIT 50`);
            const [first] = result;
            return { name: table.name, columns: first?.columns ?? table.columns.map((c) => c.name), rows: first?.values ?? [] };
        });
    } finally {
        db.close();
    }
}
