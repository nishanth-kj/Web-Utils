import { getSqlParser } from "./get-parser";
import type { QueryFlow, QueryStage, SqlDialect } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;

function truncate(text: string, max = 70): string {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function fromLabel(entry: AnyNode): string {
    const table = entry.table ?? "(subquery)";
    return entry.as ? `${table} AS ${entry.as}` : table;
}

function hasDistinct(ast: AnyNode): boolean {
    if (!ast.distinct) return false;
    if (typeof ast.distinct === "object") return Boolean(ast.distinct.type);
    return true;
}

/**
 * Turns a single SELECT statement's AST into a linear pipeline: every FROM
 * entry and JOIN merges left-to-right into one thread, then WHERE / GROUP BY /
 * HAVING / SELECT / ORDER BY / LIMIT each attach as the next stage in order —
 * mirroring the order SQL logically evaluates a query in, not the order it's written in.
 */
export async function parseSelectToFlow(sql: string, dialect: SqlDialect): Promise<QueryFlow> {
    const trimmed = sql.trim();
    if (!trimmed) return { stages: [] };

    const parser = await getSqlParser(dialect);
    const raw = parser.astify(trimmed, { database: dialect });
    const statements: AnyNode[] = Array.isArray(raw) ? raw : [raw];
    const ast = statements[0];

    if (!ast || ast.type !== "select") {
        throw new Error("Paste a single SELECT statement to visualize its query flow.");
    }
    if (ast._next || statements.length > 1) {
        throw new Error("UNION queries and multiple statements aren't supported yet — try one SELECT.");
    }

    const stages: QueryStage[] = [];
    let counter = 0;
    const nextId = (prefix: string) => `${prefix}-${counter++}`;

    const exprToSql = (expr: AnyNode): string => {
        if (expr == null) return "";
        try {
            return parser.exprToSQL(expr, { database: dialect });
        } catch {
            return "…";
        }
    };
    const safeSqlify = (innerAst: AnyNode): string => {
        try {
            return parser.sqlify(innerAst, { database: dialect });
        } catch {
            return "(unable to render)";
        }
    };

    const cteStageIdByName = new Map<string, string>();
    if (ast.with) {
        for (const cte of ast.with as AnyNode[]) {
            const name: string = cte.name?.value ?? String(cte.name);
            const id = nextId("cte");
            cteStageIdByName.set(name, id);
            stages.push({
                id,
                kind: "cte",
                title: `CTE: ${name}`,
                lines: [truncate(safeSqlify(cte.stmt.ast))],
                inputs: [],
            });
        }
    }

    const fromList: AnyNode[] = Array.isArray(ast.from) ? ast.from : ast.from ? [ast.from] : [];
    let previousId: string | null = null;

    fromList.forEach((entry, index) => {
        let stageId: string;

        if (entry.expr?.ast) {
            stageId = nextId("subquery");
            stages.push({
                id: stageId,
                kind: "subquery",
                title: entry.as ? `Subquery AS ${entry.as}` : "Subquery",
                lines: [truncate(safeSqlify(entry.expr.ast))],
                inputs: [],
            });
        } else if (entry.table && cteStageIdByName.has(entry.table)) {
            stageId = cteStageIdByName.get(entry.table)!;
        } else {
            stageId = nextId("source");
            stages.push({ id: stageId, kind: "source", title: fromLabel(entry), lines: [], inputs: [] });
        }

        if (index === 0) {
            previousId = stageId;
            return;
        }

        const joinId = nextId("join");
        const joinType = entry.join ?? "JOIN";
        const detail = entry.on
            ? `ON ${exprToSql(entry.on)}`
            : entry.using
              ? `USING (${entry.using.join(", ")})`
              : "(cross join)";
        stages.push({
            id: joinId,
            kind: "join",
            title: joinType,
            lines: [detail],
            inputs: previousId ? [previousId, stageId] : [stageId],
        });
        previousId = joinId;
    });

    if (ast.where) {
        const id = nextId("filter");
        stages.push({ id, kind: "filter", title: "WHERE", lines: [exprToSql(ast.where)], inputs: previousId ? [previousId] : [] });
        previousId = id;
    }

    const groupByColumns: AnyNode[] = ast.groupby?.columns ?? (Array.isArray(ast.groupby) ? ast.groupby : []);
    if (groupByColumns.length > 0) {
        const id = nextId("groupby");
        stages.push({
            id,
            kind: "groupby",
            title: "GROUP BY",
            lines: groupByColumns.map(exprToSql),
            inputs: previousId ? [previousId] : [],
        });
        previousId = id;
    }

    if (ast.having) {
        const havingList: AnyNode[] = Array.isArray(ast.having) ? ast.having : [ast.having];
        const id = nextId("having");
        stages.push({
            id,
            kind: "having",
            title: "HAVING",
            lines: havingList.map(exprToSql),
            inputs: previousId ? [previousId] : [],
        });
        previousId = id;
    }

    const selectId = nextId("select");
    const selectLines: string[] =
        ast.columns === "*"
            ? ["*"]
            : (ast.columns ?? []).map((col: AnyNode) => {
                  const exprText = exprToSql(col.expr ?? col);
                  const alias = typeof col.as === "string" ? col.as : col.as?.value;
                  return alias ? `${exprText} AS ${alias}` : exprText;
              });
    stages.push({
        id: selectId,
        kind: "select",
        title: hasDistinct(ast) ? "SELECT DISTINCT" : "SELECT",
        lines: selectLines.length > 0 ? selectLines : ["*"],
        inputs: previousId ? [previousId] : [],
    });
    previousId = selectId;

    if (ast.orderby && ast.orderby.length > 0) {
        const id = nextId("orderby");
        stages.push({
            id,
            kind: "orderby",
            title: "ORDER BY",
            lines: (ast.orderby as AnyNode[]).map((o) => `${exprToSql(o.expr)} ${o.type ?? ""}`.trim()),
            inputs: [previousId!],
        });
        previousId = id;
    }

    if (ast.limit?.value?.length > 0) {
        const id = nextId("limit");
        const values: string[] = ast.limit.value.map((v: AnyNode) => String(v.value));
        const text = values.length > 1 ? `${values[0]} OFFSET ${values[1]}` : values[0];
        stages.push({ id, kind: "limit", title: "LIMIT", lines: [text], inputs: [previousId!] });
        previousId = id;
    }

    return { stages };
}
