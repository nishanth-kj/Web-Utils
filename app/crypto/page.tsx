import { UuidPage } from "@/components/crypto/uuid-page";
import type { Metadata } from "next";
import { ToolPageShell } from "@/components/shared/tool-page-shell";
import { ToolSeoSection } from "@/components/shared/tool-seo-section";
import { TOOL_SEO_CONTENT } from "@/data/tool-seo-content";

export const metadata: Metadata = {
  title: "UUID Generator",
  description: "Generate secure UUIDs (v4) instantly. Free online developer tool for cryptographic identifiers.",
  keywords: ["uuid generator", "guid generator", "crypto tools", "random string", "developer tools"],
  alternates: { canonical: '/crypto' },
};

export default function Page() {
    return (
        <ToolPageShell toolSlot={<UuidPage />}>
            <ToolSeoSection {...TOOL_SEO_CONTENT["/crypto"]} />
        </ToolPageShell>
    );
}
