/**
 * node-sql-parser surfaces raw PEG.js syntax errors verbatim (e.g. `Expected
 * "FOREIGN KEY", "PRIMARY KEY" ... but "C" found`), which reads as noise to
 * anyone not familiar with the grammar. The most common trigger is simply an
 * unfinished statement — someone is still typing — so that case gets a plain-
 * English message; everything else keeps the parser's detail but leads with a
 * sentence a non-parser-author can act on.
 */
export function toFriendlyParseError(message: string): string {
    if (/end of input found/i.test(message)) {
        return "This SQL looks incomplete — check for a missing closing ), quote, or ; at the end.";
    }
    // The parser hits this mid-identifier whenever the "identifier" it was reading turns out to be a
    // reserved keyword (ORDER, GROUP, TABLE, LIMIT, CASE, SELECT, ...) or contains a space — both read,
    // from the raw PEG error, as if a plain space simply isn't allowed. It's really a naming/quoting issue.
    if (/but "(?:\\n|\\t| )" found/i.test(message)) {
        return "This SQL uses a reserved keyword (e.g. ORDER, GROUP, TABLE, LIMIT, CASE, SELECT) as an unquoted column or table name, or has a space inside an unquoted name. Wrap it in quotes — \"order\" (PostgreSQL/SQLite), `order` (MySQL/MariaDB), [order] (SQL Server) — or rename it.";
    }
    if (/^Expected .* but .* found/i.test(message)) {
        return `There's a syntax error in this SQL. (${message})`;
    }
    return message;
}
