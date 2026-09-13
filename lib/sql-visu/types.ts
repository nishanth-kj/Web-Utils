export type SqlDialect = "postgresql" | "mysql" | "mariadb" | "sqlite" | "transactsql";

export const DIALECTS: { value: SqlDialect; label: string }[] = [
    { value: "postgresql", label: "PostgreSQL" },
    { value: "mysql", label: "MySQL" },
    { value: "mariadb", label: "MariaDB" },
    { value: "sqlite", label: "SQLite" },
    { value: "transactsql", label: "SQL Server" },
];

export interface TableColumn {
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    isNotNull: boolean;
    isUnique: boolean;
}

export interface ForeignKeyRef {
    columns: string[];
    refTable: string;
    refColumns: string[];
}

export interface ParsedTable {
    name: string;
    columns: TableColumn[];
    foreignKeys: ForeignKeyRef[];
}

export type QueryStageKind =
    | "source"
    | "cte"
    | "subquery"
    | "join"
    | "filter"
    | "groupby"
    | "having"
    | "select"
    | "orderby"
    | "limit";

export interface QueryStage {
    id: string;
    kind: QueryStageKind;
    title: string;
    lines: string[];
    /** ids of stages this one reads its input from */
    inputs: string[];
}

export interface QueryFlow {
    stages: QueryStage[];
}
