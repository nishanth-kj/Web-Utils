import type { Metadata } from "next";
import { labelForFormat } from "@/lib/format-labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const label = labelForFormat(type);
  const description = `View, format, and preview ${label} content instantly in your browser with syntax highlighting and live rendering.`;

  return {
    title: `${label} Viewer`,
    description,
    keywords: [`${label} viewer`, `${label} formatter`, `${label} preview`, "online viewer", "syntax highlighting"],
    openGraph: {
      title: `${label} Viewer | Web Utils`,
      description,
      url: `https://webutils.site/view/${type}`,
    },
    alternates: {
      canonical: `/view/${type}`,
    },
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const label = labelForFormat(type);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${label} Viewer | Web Utils`,
    "description": `View, format, and preview ${label} content instantly in your browser with syntax highlighting and live rendering.`,
    "url": `https://webutils.site/view/${type}`,
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
