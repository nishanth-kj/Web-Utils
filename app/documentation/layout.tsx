import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Web Utils",
  description: "Comprehensive documentation and guides for Web Utils tools.",
  keywords: ["documentation","manuals","guides","developer docs","API reference","help center","user manual","instructions"],
  openGraph: {
    title: "Documentation | Web Utils",
    description: "Comprehensive documentation and guides for Web Utils tools.",
    url: "https://webutils.site/documentation",
  },
  twitter: {
    title: "Documentation | Web Utils",
    description: "Comprehensive documentation and guides for Web Utils tools.",
  },
  alternates: {
    canonical: "/documentation",
  }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Documentation | Web Utils",
    "description": "Comprehensive documentation and guides for Web Utils tools.",
    "url": "https://webutils.site/documentation",
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
