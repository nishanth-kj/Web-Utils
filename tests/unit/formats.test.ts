import { describe, expect, it } from "vitest";
import { ALL_FORMATS, getLanguage, PREVIEWABLE_FORMATS } from "@/lib/formats";
import { labelForFormat } from "@/lib/format-labels";

describe("getLanguage", () => {
    it.each([
        ["react", "tsx"],
        ["svg", "xml"],
        ["android-xml", "xml"],
        ["golang", "go"],
        ["JSON", "json"],
        ["markdown", "markdown"],
    ])("maps %s to the %s editor language", (format, language) => {
        expect(getLanguage(format)).toBe(language);
    });
});

describe("formats", () => {
    it("lists every previewable format among all formats", () => {
        for (const format of PREVIEWABLE_FORMATS) {
            expect(ALL_FORMATS).toContain(format);
        }
    });

    it("has a human label for every previewable format", () => {
        for (const format of PREVIEWABLE_FORMATS) {
            expect(labelForFormat(format)).not.toBe(format);
        }
    });
});
