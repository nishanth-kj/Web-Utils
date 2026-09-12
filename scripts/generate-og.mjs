import { createElement as h } from "react";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/dist/compiled/@vercel/og/index.node.js");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = join(root, "scripts/.og-fonts");
const geistRegularPath = join(fontDir, "geist-400.ttf");
const geistSemiboldPath = join(fontDir, "geist-600.ttf");

const COLORS = {
    background: "#ffffff",
    foreground: "#171717",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
    border: "#e5e5e5",
    chipBg: "#fafafa",
};

const TOOLS = [
    "Code Editor",
    "Live Previewer",
    "Epoch Converter",
    "Password",
    "UUID",
    "Quick Draw",
];

function box(style, children = "") {
    return h("div", { style }, children);
}

function text(style, content) {
    return h("div", { style }, content);
}

function commandMark() {
    const corner = {
        width: 9,
        height: 9,
        borderRadius: 2.5,
        backgroundColor: COLORS.foreground,
    };
    const row = {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
    };
    return box(
        {
            width: 22,
            height: 22,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        },
        [
            box(row, [box(corner), box(corner)]),
            box(row, [box(corner), box(corner)]),
        ]
    );
}

async function ensureFont(path, url) {
    try {
        await access(path);
        return readFile(path);
    } catch {
        await mkdir(fontDir, { recursive: true });
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download font ${url}: ${response.status}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        await writeFile(path, buffer);
        return buffer;
    }
}

async function main() {
    const geistRegular = await ensureFont(
        geistRegularPath,
        "https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@5.2.5/latin-400-normal.ttf"
    );
    const geistSemibold = await ensureFont(
        geistSemiboldPath,
        "https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@5.2.5/latin-600-normal.ttf"
    );

    const element = box(
        {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: COLORS.background,
            backgroundImage:
                "linear-gradient(180deg, #f5f5f5 0%, #ffffff 42%, #ffffff 100%)",
            padding: "72px 80px",
            fontFamily: "Geist",
            color: COLORS.foreground,
        },
        [
            box(
                {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                },
                [
                    box({ display: "flex", alignItems: "center" }, [
                        box(
                            {
                                width: 56,
                                height: 56,
                                borderRadius: 12,
                                border: `1px solid ${COLORS.border}`,
                                backgroundColor: COLORS.background,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 16,
                            },
                            commandMark()
                        ),
                        text(
                            {
                                fontSize: 28,
                                fontWeight: 600,
                                letterSpacing: "-0.03em",
                            },
                            "Web Utils"
                        ),
                    ]),
                    text(
                        {
                            fontSize: 24,
                            color: COLORS.mutedForeground,
                            letterSpacing: "-0.01em",
                        },
                        "webutils.site"
                    ),
                ]
            ),
            box({ display: "flex", flexDirection: "column", width: "100%" }, [
                box({ display: "flex", flexDirection: "column" }, [
                    text(
                        {
                            fontSize: 64,
                            fontWeight: 600,
                            letterSpacing: "-0.045em",
                            lineHeight: 1.15,
                        },
                        "Developer tools that"
                    ),
                    text(
                        {
                            fontSize: 64,
                            fontWeight: 600,
                            letterSpacing: "-0.045em",
                            lineHeight: 1.15,
                            marginBottom: 20,
                        },
                        "stay in your browser."
                    ),
                ]),
                text(
                    {
                        fontSize: 28,
                        color: COLORS.mutedForeground,
                        lineHeight: 1.4,
                        letterSpacing: "-0.02em",
                    },
                    "Format, convert, preview, and generate. No account. Nothing uploaded."
                ),
            ]),
            box(
                {
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    width: "100%",
                },
                TOOLS.map((name, index) =>
                    box(
                        {
                            display: "flex",
                            alignItems: "center",
                            border: `1px solid ${COLORS.border}`,
                            backgroundColor: COLORS.chipBg,
                            borderRadius: 999,
                            padding: "10px 18px",
                            marginRight: 12,
                            marginTop: index > 4 ? 12 : 0,
                        },
                        text(
                            {
                                fontSize: 20,
                                color: COLORS.foreground,
                                letterSpacing: "-0.01em",
                            },
                            name
                        )
                    )
                )
            ),
        ]
    );

    const response = new ImageResponse(element, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: "Geist",
                data: geistRegular,
                weight: 400,
                style: "normal",
            },
            {
                name: "Geist",
                data: geistSemibold,
                weight: 600,
                style: "normal",
            },
        ],
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const pngPath = join(root, "app/opengraph-image.png");
    const altPath = join(root, "app/opengraph-image.alt.txt");
    await writeFile(pngPath, buffer);
    await writeFile(
        altPath,
        "Web Utils — Developer tools that stay in your browser.\n"
    );
    console.log(`Wrote ${pngPath} (${buffer.length} bytes)`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
