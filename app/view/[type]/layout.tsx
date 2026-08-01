import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dynamic Format Viewer | Web Utils",
  description: "Specialized viewer for specific file formats and data structures with syntax highlighting and tree views.",
  keywords: ["dynamic viewer", "specialized file viewer", "format parser", "data inspector", "syntax tree", "structured data viewer"],
  openGraph: {
    title: "Dynamic Format Viewer | Web Utils",
    description: "Specialized viewer for specific file formats and data structures.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Dynamic Format Viewer | Web Utils",
    "description": "Specialized viewer for specific file formats and data structures with syntax highlighting and tree views.",
    "url": "https://webutils.site/view/type",
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
