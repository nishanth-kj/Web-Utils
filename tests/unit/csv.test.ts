import { describe, expect, it } from "vitest";
import { csvToRecords, parseCsv, recordsToCsv, stringifyCsv } from "@/lib/csv";

describe("parseCsv", () => {
    it("parses simple rows", () => {
        expect(parseCsv("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
    });

    it("keeps commas, escaped quotes and line breaks inside quoted fields", () => {
        expect(parseCsv('name,quote\n"Smith, John","He said ""hi""\nthen left"')).toEqual([
            ["name", "quote"],
            ["Smith, John", 'He said "hi"\nthen left'],
        ]);
    });

    it("handles CRLF line endings and a trailing newline", () => {
        expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([["a", "b"], ["1", "2"]]);
    });

    it("keeps empty fields", () => {
        expect(parseCsv("a,,c\n,,")).toEqual([["a", "", "c"], ["", "", ""]]);
    });

    it("supports other delimiters", () => {
        expect(parseCsv("a;b\n1;2", ";")).toEqual([["a", "b"], ["1", "2"]]);
    });

    it("rejects an unterminated quote", () => {
        expect(() => parseCsv('a\n"oops')).toThrow(/Unterminated/);
    });
});

describe("stringifyCsv", () => {
    it("quotes only the fields that need it", () => {
        expect(stringifyCsv([["plain", "with,comma", 'with "quote"', "two\nlines"]])).toBe(
            'plain,"with,comma","with ""quote""","two\nlines"'
        );
    });

    it("round-trips tricky input", () => {
        const input = 'id,note\n1,"a, b"\n2,"say ""x"""\n3,"multi\nline"';
        expect(stringifyCsv(parseCsv(input))).toBe(input);
    });
});

describe("csvToRecords / recordsToCsv", () => {
    it("maps rows to header-keyed records and back", () => {
        const csv = 'name,city\n"Doe, Jane",Paris\nBob,';
        const records = csvToRecords(csv);
        expect(records).toEqual([
            { name: "Doe, Jane", city: "Paris" },
            { name: "Bob", city: "" },
        ]);
        expect(recordsToCsv(records)).toBe(csv);
    });

    it("gives blank and duplicate headers unique names", () => {
        expect(Object.keys(csvToRecords("id,,id\n1,2,3")[0])).toEqual(["id", "column_2", "id_2"]);
    });

    it("returns no records for empty input", () => {
        expect(csvToRecords("  ")).toEqual([]);
        expect(recordsToCsv([])).toBe("");
    });
});
