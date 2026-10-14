import type { Metadata } from "next";

const DESCRIPTION = "Write UML class, sequence, activity, state and use case diagrams as text and see them render live. Export SVG or PNG. Free, runs in your browser.";

export const metadata: Metadata = {
  title: "UML Diagram Editor",
  description: DESCRIPTION,
  keywords: ["uml diagram editor", "uml diagram online", "class diagram generator", "sequence diagram generator", "use case diagram", "state diagram", "activity diagram", "mermaid editor", "text to uml"],
  openGraph: {
    title: "UML Diagram Editor | Web Utils",
    description: DESCRIPTION,
    url: "https://webutils.site/uml",
  },
  alternates: { canonical: "/uml" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "UML Diagram Editor | Web Utils",
    "description": DESCRIPTION,
    "url": "https://webutils.site/uml",
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
