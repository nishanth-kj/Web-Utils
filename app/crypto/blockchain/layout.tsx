import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockchain Utilities | Web Utils",
  description: "Web3 and blockchain developer utilities. Convert addresses, check formats, and interact with blockchain protocols safely.",
  keywords: ["blockchain", "web3", "crypto tools", "developer blockchain", "wallet utilities", "address converter", "smart contract tools", "crypto dev"],
  openGraph: {
    title: "Blockchain Utilities | Web Utils",
    description: "Web3 and blockchain developer utilities.",
    url: "https://webutils.site/crypto/blockchain",
  },
  alternates: { canonical: "/crypto/blockchain" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Blockchain Utilities | Web Utils",
    "description": "Web3 and blockchain developer utilities. Convert addresses, check formats, and interact with blockchain protocols safely.",
    "url": "https://webutils.site/crypto/blockchain",
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
  );
}
