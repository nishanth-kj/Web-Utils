import type { Parser } from "node-sql-parser";
import type { SqlDialect } from "./types";

// Each dialect ships as its own ~250KB bundle instead of one parser that embeds
// every grammar, so a visitor only pays for the dialect they picked, loaded on
// demand the same way the app already lazy-loads Prettier and sql-formatter.
export async function getSqlParser(dialect: SqlDialect): Promise<Parser> {
    switch (dialect) {
        case "postgresql": {
            const { Parser: PgParser } = await import("node-sql-parser/build/postgresql");
            return new PgParser();
        }
        case "mysql": {
            const { Parser: MysqlParser } = await import("node-sql-parser/build/mysql");
            return new MysqlParser();
        }
        case "mariadb": {
            const { Parser: MariadbParser } = await import("node-sql-parser/build/mariadb");
            return new MariadbParser();
        }
        case "sqlite": {
            const { Parser: SqliteParser } = await import("node-sql-parser/build/sqlite");
            return new SqliteParser();
        }
        case "transactsql": {
            const { Parser: TsqlParser } = await import("node-sql-parser/build/transactsql");
            return new TsqlParser();
        }
    }
}
