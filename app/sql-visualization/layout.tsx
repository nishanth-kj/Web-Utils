import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL Visualizer",
  description: "Turn CREATE TABLE statements into ER diagrams and SELECT queries into readable execution pipelines, plus SQL formatting.",
  keywords: ["sql visualization", "sql visualizer", "er diagram generator", "database schema diagram", "sql query visualizer", "sql formatter", "foreign key diagram", "database design tool"],
  openGraph: {
    title: "SQL Visualizer | Web Utils",
    description: "Turn CREATE TABLE statements into ER diagrams and SELECT queries into readable execution pipelines.",
    url: "https://webutils.site/sql-visualization",
  },
  alternates: { canonical: "/sql-visualization" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SQL Visualizer | Web Utils",
    "description": "Turn CREATE TABLE statements into ER diagrams and SELECT queries into readable execution pipelines, plus SQL formatting.",
    "url": "https://webutils.site/sql-visualization",
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
