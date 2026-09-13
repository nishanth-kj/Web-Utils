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
    if (/^Expected .* but .* found/i.test(message)) {
        return `There's a syntax error in this SQL. (${message})`;
    }
    return message;
}
