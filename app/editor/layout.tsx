import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Editor & Formatter | Web Utils",
  description: "Advanced browser-based code editor, JSON formatter, YAML parser, and HTML previewer. Edit code quickly with syntax highlighting.",
  keywords: ["code editor", "JSON formatter", "YAML parser", "HTML preview", "browser IDE", "syntax highlighter", "online coding", "developer sandbox", "code formatter"],
  openGraph: {
    title: "Code Editor & Formatter | Web Utils",
    description: "Advanced browser-based code editor, JSON formatter, YAML parser, and HTML previewer. Edit code quickly with syntax highlighting.",
    url: "https://webutils.site/editor",
  },
  twitter: {
    title: "Code Editor & Formatter | Web Utils",
    description: "Advanced browser-based code editor, JSON formatter, YAML parser, and HTML previewer.",
  },
  alternates: {
    canonical: "/editor",
  }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Code Editor & Formatter | Web Utils",
    "description": "Advanced browser-based code editor, JSON formatter, YAML parser, and HTML previewer. Edit code quickly with syntax highlighting.",
    "url": "https://webutils.site/editor",
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
