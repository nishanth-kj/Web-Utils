import type { Metadata } from "next";

const DESCRIPTION = "Turn any code snippet into a typing-animation video. Pick a theme, speed, and resolution, then export as 4K/120fps MP4 or a PNG — all in your browser.";

export const metadata: Metadata = {
  title: "Code Typing Video Generator",
  description: DESCRIPTION,
  keywords: ["code video generator", "coding typing animation", "code snippet video", "programming video maker", "code to video", "carbon alternative", "4k code video", "code screenshot", "code to mp4"],
  openGraph: {
    title: "Code Typing Video Generator | Web Utils",
    description: DESCRIPTION,
    url: "https://webutils.site/code-video",
  },
  alternates: { canonical: "/code-video" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Code Typing Video Generator | Web Utils",
    "description": DESCRIPTION,
    "url": "https://webutils.site/code-video",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Typing-animation video export up to 4K at 120fps (MP4)",
      "PNG export of the fully-typed code block",
      "Syntax highlighting for 20+ languages",
      "Adjustable typing speed, syntax theme, and background",
      "Runs entirely client-side — no upload"
    ]
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
