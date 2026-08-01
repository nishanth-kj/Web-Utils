import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data & File Viewer | Web Utils",
  description: "View, analyze, and format complex data structures and specific file formats beautifully in the browser.",
  keywords: ["viewer", "file viewer", "code viewer", "data visualizer", "json viewer", "yaml viewer", "hex viewer", "data inspector"],
  openGraph: {
    title: "Data & File Viewer | Web Utils",
    description: "View, analyze, and format complex data structures.",
    url: "https://webutils.site/view",
  },
  alternates: { canonical: "/view" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Data & File Viewer | Web Utils",
    "description": "View, analyze, and format complex data structures and specific file formats beautifully in the browser.",
    "url": "https://webutils.site/view",
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
