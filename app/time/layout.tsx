import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time & Epoch Utilities | Web Utils",
  description: "Convert Unix epochs, manage timestamps, and calculate time zones instantly for debugging.",
  keywords: ["epoch converter", "unix timestamp", "time zones", "developer time tools", "date formatter", "timestamp calculator", "UTC conversion", "time utilities"],
  openGraph: {
    title: "Time & Epoch Utilities | Web Utils",
    description: "Convert Unix epochs, manage timestamps, and calculate time zones.",
    url: "https://webutils.site/time",
  },
  alternates: { canonical: "/time" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Time & Epoch Utilities | Web Utils",
    "description": "Convert Unix epochs, manage timestamps, and calculate time zones instantly for debugging.",
    "url": "https://webutils.site/time",
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
