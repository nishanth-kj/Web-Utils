import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagram & Drawing Tool | Web Utils",
  description: "Create flowcharts, architecture diagrams, and whiteboards instantly in your browser.",
  keywords: ["drawing tool", "whiteboarding", "diagramming", "developer diagrams", "flowcharts", "architecture diagrams", "system design", "sketch"],
  openGraph: {
    title: "Diagram & Drawing Tool | Web Utils",
    description: "Create flowcharts, architecture diagrams, and whiteboards instantly in your browser.",
    url: "https://webutils.site/draw",
  },
  alternates: { canonical: "/draw" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Diagram & Drawing Tool | Web Utils",
    "description": "Create flowcharts, architecture diagrams, and whiteboards instantly in your browser.",
    "url": "https://webutils.site/draw",
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
