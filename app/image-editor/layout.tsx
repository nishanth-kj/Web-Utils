import type { Metadata } from "next";

const DESCRIPTION = "Crop, resize, rotate, and color-adjust an image, then export it as PNG or JPEG. Runs entirely in your browser, nothing is uploaded.";

export const metadata: Metadata = {
  title: "Image Editor",
  description: DESCRIPTION,
  keywords: ["image editor", "crop image online", "resize image online", "rotate image online", "image filter online", "photo editor online", "jpeg png converter", "browser image editor", "free image cropper"],
  openGraph: {
    title: "Image Editor | Web Utils",
    description: DESCRIPTION,
    url: "https://webutils.site/image-editor",
  },
  alternates: { canonical: "/image-editor" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Image Editor | Web Utils",
    "description": DESCRIPTION,
    "url": "https://webutils.site/image-editor",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Freeform crop with draggable handles",
      "Resize with optional aspect-ratio lock",
      "Rotate in 90° steps and flip horizontally or vertically",
      "Brightness, contrast, saturation, and blur adjustments",
      "Grayscale, sepia, and invert filters",
      "Export as PNG or JPEG with adjustable quality",
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
