import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Data Generator | Web Utils",
  description: "Generate realistic mock data, JSON payloads, and dummy information for testing and API development.",
  keywords: ["mock data", "dummy data generator", "JSON generator", "fake API data", "test data", "database seeding", "lorem ipsum", "random data"],
  openGraph: {
    title: "Mock Data Generator | Web Utils",
    description: "Generate realistic mock data, JSON payloads, and dummy information.",
    url: "https://webutils.site/dummy",
  },
  alternates: { canonical: "/dummy" }
};

export default function Layout({ children }: { children: React.ReactNode }) { 
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Mock Data Generator | Web Utils",
    "description": "Generate realistic mock data, JSON payloads, and dummy information for testing and API development.",
    "url": "https://webutils.site/dummy",
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
