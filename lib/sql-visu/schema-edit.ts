import type { ParsedTable, TableColumn } from "./types";

function uniqueName(base: string, taken: Set<string>): string {
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}_${i}`)) i++;
    return `${base}_${i}`;
}

/** Appends a new table with one starter column — used by the ER diagram's "Add Table" button. */
export function withNewTable(tables: ParsedTable[]): ParsedTable[] {
    const name = uniqueName("new_table", new Set(tables.map((t) => t.name)));
    const table: ParsedTable = {
        name,
        columns: [{ name: "id", dataType: "INT", isPrimaryKey: true, isForeignKey: false, isNotNull: true, isUnique: false }],
        foreignKeys: [],
    };
    return [...tables, table];
}

/** Removes a table and strips any foreign keys elsewhere that pointed at it. */
export function withoutTable(tables: ParsedTable[], tableName: string): ParsedTable[] {
    return tables
        .filter((t) => t.name !== tableName)
        .map((t) => ({ ...t, foreignKeys: t.foreignKeys.filter((fk) => fk.refTable !== tableName) }));
}

/** Appends a new column to one table — used by each table node's "Add Column" row. */
export function withNewColumn(tables: ParsedTable[], tableName: string): ParsedTable[] {
    return tables.map((t) => {
        if (t.name !== tableName) return t;
        const name = uniqueName("new_column", new Set(t.columns.map((c) => c.name)));
        const column: TableColumn = { name, dataType: "VARCHAR(255)", isPrimaryKey: false, isForeignKey: false, isNotNull: false, isUnique: false };
        return { ...t, columns: [...t.columns, column] };
    });
}

/** Removes a column from a table and repairs any foreign key that referenced it. */
export function withoutColumn(tables: ParsedTable[], tableName: string, columnName: string): ParsedTable[] {
    return tables.map((t) => {
        if (t.name !== tableName) return t;
        return {
            ...t,
            columns: t.columns.filter((c) => c.name !== columnName),
            foreignKeys: t.foreignKeys
                .map((fk) => {
                    const idx = fk.columns.indexOf(columnName);
                    if (idx === -1) return fk;
                    return {
                        ...fk,
                        columns: fk.columns.filter((c) => c !== columnName),
                        refColumns: fk.refColumns.filter((_, i) => i !== idx),
                    };
                })
                .filter((fk) => fk.columns.length > 0),
        };
    });
}
