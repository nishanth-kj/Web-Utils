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

/**
 * Adds a foreign key from one column to another — used when the user drags a connection
 * between two column handles on the diagram. `fromTable`/`fromColumn` is the referencing
 * side (gets the FOREIGN KEY constraint); `toTable`/`toColumn` is what it references,
 * matching the existing source-table-references-target-table convention the parsed
 * diagram already draws its arrows with.
 */
export function withNewForeignKey(tables: ParsedTable[], fromTable: string, fromColumn: string, toTable: string, toColumn: string): ParsedTable[] {
    if (fromTable === toTable && fromColumn === toColumn) return tables;

    return tables.map((t) => {
        if (t.name !== fromTable) return t;
        const alreadyExists = t.foreignKeys.some(
            (fk) => fk.refTable === toTable && fk.columns.includes(fromColumn) && fk.refColumns.includes(toColumn),
        );
        if (alreadyExists) return t;

        return {
            ...t,
            columns: t.columns.map((c) => (c.name === fromColumn ? { ...c, isForeignKey: true } : c)),
            foreignKeys: [...t.foreignKeys, { columns: [fromColumn], refTable: toTable, refColumns: [toColumn] }],
        };
    });
}

/** Removes one foreign key relationship — used when a dragged connection/edge is deleted from the diagram. */
export function withoutForeignKey(tables: ParsedTable[], fromTable: string, fromColumn: string, toTable: string, toColumn: string): ParsedTable[] {
    return tables.map((t) => {
        if (t.name !== fromTable) return t;
        const foreignKeys = t.foreignKeys
            .map((fk) => {
                if (fk.refTable !== toTable) return fk;
                const idx = fk.columns.indexOf(fromColumn);
                if (idx === -1 || fk.refColumns[idx] !== toColumn) return fk;
                return { ...fk, columns: fk.columns.filter((_, i) => i !== idx), refColumns: fk.refColumns.filter((_, i) => i !== idx) };
            })
            .filter((fk) => fk.columns.length > 0);

        const stillForeignKey = new Set(foreignKeys.flatMap((fk) => fk.columns));
        return {
            ...t,
            foreignKeys,
            columns: t.columns.map((c) => (c.name === fromColumn && !stillForeignKey.has(c.name) ? { ...c, isForeignKey: false } : c)),
        };
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
