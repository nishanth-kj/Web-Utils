import { describe, expect, it } from "vitest";
import { generateQrMatrix, qrMatrixToSvg } from "@/lib/qr-code";

describe("QR code generator", () => {
    it("creates a valid-sized matrix for a short URL", () => {
        const matrix = generateQrMatrix("https://example.com");
        expect(matrix).toHaveLength(21);
        expect(matrix.every((row) => row.length === 21)).toBe(true);
    });

    it("creates larger versions for longer content", () => {
        const matrix = generateQrMatrix("A".repeat(40));
        expect(matrix).toHaveLength(29);
    });

    it("rejects empty and oversized input", () => {
        expect(() => generateQrMatrix("")).toThrow(/Enter some text/);
        expect(() => generateQrMatrix("A".repeat(110))).toThrow(/106 UTF-8 bytes/);
    });

    it("exports an SVG with a quiet zone", () => {
        const svg = qrMatrixToSvg(generateQrMatrix("hello"));
        expect(svg).toContain('<svg');
        expect(svg).toContain('viewBox="0 0 29 29"');
        expect(svg).toContain('fill="#000000"');
    });
});
