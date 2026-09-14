import type { Metadata } from "next";

const DESCRIPTION = "Step through JavaScript or Python line by line and watch variables, the call stack, and heap objects update live — a Python-Tutor-style execution visualizer that runs entirely in your browser.";

export const metadata: Metadata = {
  title: "Code Visualizer — Step-by-Step Code Debugger",
  description: DESCRIPTION,
  keywords: ["code visualizer", "code execution visualizer", "step through code", "python tutor alternative", "javascript debugger online", "python debugger online", "visualize code execution", "call stack visualizer", "variable tracer"],
  openGraph: {
    title: "Code Visualizer — Step-by-Step Code Debugger | Web Utils",
    description: DESCRIPTION,
    url: "https://webutils.site/code-visualizer",
  },
  alternates: { canonical: "/code-visualizer" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Code Visualizer | Web Utils",
    "description": DESCRIPTION,
    "url": "https://webutils.site/code-visualizer",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Step-by-step execution for JavaScript and Python",
      "Live call stack and variable frames",
      "Visual heap diagram with reference arrows, Python-Tutor style",
      "Play/pause/step/scrub playback controls",
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
