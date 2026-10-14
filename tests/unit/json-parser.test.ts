import { describe, expect, it } from "vitest";
import { formatMultipleJson, parseMultipleJson } from "@/lib/json-parser";

describe("parseMultipleJson", () => {
    it("parses a single document", () => {
        expect(parseMultipleJson('{"a":1,"b":[true,null]}')).toEqual([{ a: 1, b: [true, null] }]);
    });

    it("returns an empty list for blank input", () => {
        expect(parseMultipleJson("   \n ")).toEqual([]);
    });

    it("splits documents pasted back to back", () => {
        expect(parseMultipleJson('{"a":1}\n{"b":2}\n[3]')).toEqual([{ a: 1 }, { b: 2 }, [3]]);
    });

    it("does not split on braces inside strings", () => {
        expect(parseMultipleJson('{"text":"} {"}\n{"n":1}')).toEqual([{ text: "} {" }, { n: 1 }]);
    });

    it("repairs common mistakes", () => {
        expect(parseMultipleJson("{'a': 1, b: 2,}\n{\"c\": 3}")).toEqual([{ a: 1, b: 2 }, { c: 3 }]);
    });
});

describe("formatMultipleJson", () => {
    it("pretty-prints with two-space indentation", () => {
        expect(formatMultipleJson('{"a":{"b":1}}')).toBe('{\n  "a": {\n    "b": 1\n  }\n}');
    });

    it("separates multiple documents with a blank line", () => {
        expect(formatMultipleJson('{"a":1}{"b":2}')).toBe('{\n  "a": 1\n}\n\n{\n  "b": 2\n}');
    });
});
