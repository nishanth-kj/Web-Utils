import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online IDE & Sandbox | Web Utils",
  description: "A fully-featured online Integrated Development Environment (IDE). Write, run, and test your code securely in the browser.",
  keywords: ["online IDE", "code runner", "developer environment", "browser sandbox", "web IDE", "javascript runner", "typescript compiler", "sandbox editor"],
  openGraph: {
    title: "Online IDE & Sandbox | Web Utils",
    description: "A fully-featured online Integrated Development Environment (IDE). Write, run, and test your code securely in the browser.",
    url: "https://webutils.site/ide",
  },
  twitter: {
    title: "Online IDE & Sandbox | Web Utils",
    description: "A fully-featured online Integrated Development Environment (IDE).",
  },
  alternates: {
    canonical: "/ide",
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
    "name": "Online IDE & Sandbox | Web Utils",
    "description": "A fully-featured online Integrated Development Environment (IDE). Write, run, and test your code securely in the browser.",
    "url": "https://webutils.site/ide",
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
