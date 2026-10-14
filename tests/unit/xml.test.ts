import { describe, expect, it } from "vitest";
import { formatXml } from "@/lib/xml";

describe("formatXml", () => {
    it("indents nested elements and keeps text-only elements on one line", () => {
        expect(formatXml('<?xml version="1.0"?><root><item id="1"><name>A</name></item><empty/></root>')).toBe(
            ['<?xml version="1.0"?>', "<root>", '  <item id="1">', "    <name>A</name>", "  </item>", "  <empty/>", "</root>"].join("\n")
        );
    });

    it("does not split on > inside attribute values", () => {
        expect(formatXml('<a title="x > y"><b/></a>')).toBe('<a title="x > y">\n  <b/>\n</a>');
    });

    it("preserves comments and CDATA", () => {
        expect(formatXml("<a><!-- note --><![CDATA[<raw>]]></a>")).toBe("<a>\n  <!-- note -->\n  <![CDATA[<raw>]]>\n</a>");
    });

    it("keeps empty element pairs together", () => {
        expect(formatXml("<a><b></b></a>")).toBe("<a>\n  <b></b>\n</a>");
    });

    it("re-indents already formatted input without drifting", () => {
        const once = formatXml("<svg><g><path d='M0 0'/></g></svg>");
        expect(formatXml(once)).toBe(once);
    });
});
