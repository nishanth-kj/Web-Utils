import { UuidPage } from "@/components/crypto/uuid-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID Generator | Web Utils",
  description: "Generate secure UUIDs (v4) instantly. Free online developer tool for cryptographic identifiers.",
  keywords: ["uuid generator", "guid generator", "crypto tools", "random string", "developer tools"],
  alternates: { canonical: '/crypto' },
};

export default function Page() {
    return <UuidPage />;
}
