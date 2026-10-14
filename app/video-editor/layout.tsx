import type { Metadata } from "next";

const DESCRIPTION = "Trim a video and adjust brightness, contrast, saturation, rotation, and flip — then export the clip as WebM. Runs entirely in your browser, nothing is uploaded.";

export const metadata: Metadata = {
  title: "Video Editor",
  description: DESCRIPTION,
  keywords: ["video editor", "trim video online", "video cropper", "video filter online", "rotate video online", "flip video online", "webm export", "browser video editor", "free video trimmer"],
  openGraph: {
    title: "Video Editor | Web Utils",
    description: DESCRIPTION,
    url: "https://webutils.site/video-editor",
  },
  alternates: { canonical: "/video-editor" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Video Editor | Web Utils",
    "description": DESCRIPTION,
    "url": "https://webutils.site/video-editor",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Trim video clips by dragging in/out points",
      "Adjust brightness, contrast, and saturation",
      "Rotate in 90° steps and flip horizontally or vertically",
      "Grayscale, sepia, and invert filters",
      "Export the trimmed clip as WebM",
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
