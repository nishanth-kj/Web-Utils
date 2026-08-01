import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Settings | Web Utils",
  description: "Customize your Web Utils experience. Adjust themes, preferences, and editor configurations.",
  keywords: ["preferences", "configuration", "web utils settings", "user preferences", "theme settings", "editor config", "customization"],
  openGraph: {
    title: "User Settings | Web Utils",
    description: "Customize your Web Utils experience. Adjust themes, preferences, and editor configurations.",
    url: "https://webutils.site/settings",
  },
  twitter: {
    title: "User Settings | Web Utils",
    description: "Customize your Web Utils experience.",
  },
  alternates: {
    canonical: "/settings",
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
    "name": "User Settings | Web Utils",
    "description": "Customize your Web Utils experience. Adjust themes, preferences, and editor configurations.",
    "url": "https://webutils.site/settings",
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
