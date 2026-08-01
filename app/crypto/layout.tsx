import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cryptography Tools | Web Utils",
  description: "Secure, client-side cryptography tools. Hash generators, base64 encoding/decoding, MD5, SHA-256, and encryption utilities.",
  keywords: ["cryptography", "hashing", "encryption", "base64", "MD5", "SHA-256", "hash generator", "text encoding", "secure hashes", "developer security"],
  openGraph: {
    title: "Cryptography Tools | Web Utils",
    description: "Secure, client-side cryptography tools.",
    url: "https://webutils.site/crypto",
  },
  alternates: { canonical: "/crypto" }
};

export default function Layout({ children }: { children: React.ReactNode }) { 
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Cryptography Tools | Web Utils",
    "description": "Secure, client-side cryptography tools. Hash generators, base64 encoding/decoding, MD5, SHA-256, and encryption utilities.",
    "url": "https://webutils.site/crypto",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  ); }
