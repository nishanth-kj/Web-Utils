import type { ParsedTable, TableColumn, SqlDialect } from "./types";

const QUOTE_STYLE: Record<SqlDialect, { open: string; close: string }> = {
    postgresql: { open: '"', close: '"' },
    sqlite: { open: '"', close: '"' },
    mysql: { open: "`", close: "`" },
    mariadb: { open: "`", close: "`" },
    transactsql: { open: "[", close: "]" },
};

// Only quote names that need it, so regenerated DDL reads like something a person wrote by hand.
const SIMPLE_IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function quoteIfNeeded(name: string, dialect: SqlDialect): string {
    if (SIMPLE_IDENTIFIER.test(name)) return name;
    const { open, close } = QUOTE_STYLE[dialect];
    return `${open}${name}${close}`;
}

function columnLine(column: TableColumn, dialect: SqlDialect): string {
    const parts = [quoteIfNeeded(column.name, dialect), column.dataType];
    if (column.isPrimaryKey) parts.push("PRIMARY KEY");
    if (column.isNotNull && !column.isPrimaryKey) parts.push("NOT NULL");
    if (column.isUnique && !column.isPrimaryKey) parts.push("UNIQUE");
    return parts.join(" ");
}

/**
 * Re-emits a parsed schema as CREATE TABLE statements in the target dialect's quoting
 * style. Used both when the dialect dropdown changes (same schema, re-rendered SQL text)
 * and when tables/columns are added or dropped from the diagram (the diagram edits this
 * model, then this turns it back into the DDL text the editor panel shows).
 *
 * This only round-trips names, types (as originally captured), and constraints already
 * on the model — it doesn't translate dialect-specific type syntax (e.g. Postgres SERIAL
 * vs MySQL AUTO_INCREMENT), since that model doesn't carry enough information to do that
 * reliably.
 */
export function serializeTablesToDdl(tables: ParsedTable[], dialect: SqlDialect): string {
    const existingNames = new Set(tables.map((t) => t.name));

    return tables
        .map((table) => {
            const lines = table.columns.map((c) => `  ${columnLine(c, dialect)}`);

            for (const fk of table.foreignKeys) {
                if (!existingNames.has(fk.refTable) || fk.columns.length === 0) continue;
                const cols = fk.columns.map((c) => quoteIfNeeded(c, dialect)).join(", ");
                const refCols = fk.refColumns.map((c) => quoteIfNeeded(c, dialect)).join(", ");
                lines.push(`  FOREIGN KEY (${cols}) REFERENCES ${quoteIfNeeded(fk.refTable, dialect)}(${refCols})`);
            }

            const body = lines.length > 0 ? `\n${lines.join(",\n")}\n` : "";
            return `CREATE TABLE ${quoteIfNeeded(table.name, dialect)} (${body});`;
        })
        .join("\n\n");
}
