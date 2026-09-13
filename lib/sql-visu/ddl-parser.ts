import { getSqlParser } from "./get-parser";
import type { ParsedTable, SqlDialect, TableColumn } from "./types";

// node-sql-parser's published .d.ts lags its actual runtime AST shape (e.g. it
// documents `primary?: "key" | "primary key"` but 5.x actually emits
// `primary_key: "primary key"`), so the raw AST is walked loosely here and
// only the fields this module actually reads are trusted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;

interface TableBuilder {
    table: ParsedTable;
    columnByName: Map<string, TableColumn>;
}

function getIdentifierName(node: AnyNode): string {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (typeof node.column === "string") return node.column;
    if (node.column?.expr?.value != null) return String(node.column.expr.value);
    if (node.expr?.value != null) return String(node.expr.value);
    if (node.table != null) return String(node.table);
    if (node.value != null) return String(node.value);
    return "";
}

function formatDataType(def: AnyNode): string {
    if (!def) return "unknown";
    const dataType = String(def.dataType ?? "unknown").toUpperCase();
    const params: number[] = [];
    if (typeof def.length === "number") params.push(def.length);
    if (typeof def.scale === "number") params.push(def.scale);
    return params.length > 0 ? `${dataType}(${params.join(", ")})` : dataType;
}

function tableNameOf(node: AnyNode): string {
    if (!node) return "";
    if (Array.isArray(node)) return tableNameOf(node[0]);
    return String(node.table ?? "");
}

/** Adds a column from a `resource: "column"` definition — used by both CREATE TABLE and ALTER TABLE ADD COLUMN. */
function applyColumnDefinition(builder: TableBuilder, def: AnyNode): void {
    const column: TableColumn = {
        name: getIdentifierName(def.column),
        dataType: formatDataType(def.definition),
        isPrimaryKey: Boolean(def.primary_key ?? def.primary),
        isForeignKey: Boolean(def.reference_definition),
        isNotNull: def.nullable?.type === "not null",
        isUnique: Boolean(def.unique),
    };
    builder.table.columns.push(column);
    builder.columnByName.set(column.name, column);

    if (def.reference_definition) {
        builder.table.foreignKeys.push({
            columns: [column.name],
            refTable: tableNameOf(def.reference_definition.table),
            refColumns: (def.reference_definition.definition ?? []).map(getIdentifierName),
        });
    }
}

/** Adds a PK/FK/UNIQUE constraint from a `resource: "constraint"` definition — used by both CREATE TABLE and ALTER TABLE ADD CONSTRAINT. */
function applyConstraintDefinition(builder: TableBuilder, def: AnyNode): void {
    const constraintType = String(def.constraint_type ?? "").toUpperCase();

    if (constraintType === "FOREIGN KEY") {
        const localColumns: string[] = (def.definition ?? []).map(getIdentifierName);
        builder.table.foreignKeys.push({
            columns: localColumns,
            refTable: tableNameOf(def.reference_definition?.table),
            refColumns: (def.reference_definition?.definition ?? []).map(getIdentifierName),
        });
        for (const colName of localColumns) {
            const col = builder.columnByName.get(colName);
            if (col) col.isForeignKey = true;
        }
    } else if (constraintType === "PRIMARY KEY") {
        for (const colRef of def.definition ?? []) {
            const col = builder.columnByName.get(getIdentifierName(colRef));
            if (col) col.isPrimaryKey = true;
        }
    } else if (constraintType.startsWith("UNIQUE")) {
        for (const colRef of def.definition ?? []) {
            const col = builder.columnByName.get(getIdentifierName(colRef));
            if (col) col.isUnique = true;
        }
    }
}

/**
 * Parses `CREATE TABLE` statements into a table/column/FK model for ER visualization,
 * then applies any `ALTER TABLE ... ADD COLUMN` / `ADD CONSTRAINT` / `ADD FOREIGN KEY`
 * statements on top — schema dumps commonly define tables first and add foreign keys
 * (or extra columns) via separate ALTER statements afterward.
 */
export async function parseDdlToTables(sql: string, dialect: SqlDialect): Promise<ParsedTable[]> {
    const trimmed = sql.trim();
    if (!trimmed) return [];

    const parser = await getSqlParser(dialect);
    const raw = parser.astify(trimmed, { database: dialect });
    const statements: AnyNode[] = Array.isArray(raw) ? raw : [raw];

    const createStatements = statements.filter((s) => s?.type === "create" && s?.keyword === "table");
    if (createStatements.length === 0) {
        throw new Error("No CREATE TABLE statements found. Paste one or more table definitions.");
    }

    const buildersByName = new Map<string, TableBuilder>();

    for (const stmt of createStatements) {
        const name = tableNameOf(stmt.table);
        const builder: TableBuilder = {
            table: { name, columns: [], foreignKeys: [] },
            columnByName: new Map(),
        };

        const definitions: AnyNode[] = stmt.create_definitions ?? [];
        for (const def of definitions) {
            if (def.resource === "column") applyColumnDefinition(builder, def);
        }
        for (const def of definitions) {
            if (def.resource === "constraint") applyConstraintDefinition(builder, def);
        }

        buildersByName.set(name, builder);
    }

    const alterStatements = statements.filter((s) => s?.type === "alter" && s?.keyword === "table");
    for (const stmt of alterStatements) {
        const builder = buildersByName.get(tableNameOf(stmt.table));
        if (!builder) continue; // ALTERs a table we never saw a CREATE for — nothing to attach it to

        for (const action of stmt.expr ?? []) {
            if (action.action !== "add") continue;
            if (action.resource === "column") applyColumnDefinition(builder, action);
            else if (action.resource === "constraint") applyConstraintDefinition(builder, action.create_definitions ?? action);
        }
    }

    return Array.from(buildersByName.values()).map((b) => b.table);
}
