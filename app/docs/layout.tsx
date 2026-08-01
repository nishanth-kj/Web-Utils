import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API & System Docs | Web Utils",
  description: "Technical API documentation and system architecture references for the Web Utils ecosystem.",
  keywords: ["api docs", "system documentation", "library references", "technical specs", "architecture docs", "developer api"],
  openGraph: {
    title: "API & System Docs | Web Utils",
    description: "Technical API documentation and system architecture references.",
    url: "https://webutils.site/docs",
  },
  alternates: { canonical: "/docs" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "API & System Docs | Web Utils",
    "description": "Technical API documentation and system architecture references for the Web Utils ecosystem.",
    "url": "https://webutils.site/docs",
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
