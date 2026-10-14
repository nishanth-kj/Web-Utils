import type { Metadata } from "next";
import { labelForFormat, seoForFormat } from "@/lib/format-labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const label = labelForFormat(type);
  const { title, description } = seoForFormat(type);

  return {
    title,
    description,
    keywords: [`${label} viewer`, `${label} formatter`, `${label} preview`, "online viewer", "syntax highlighting"],
    openGraph: {
      title: `${title} | Web Utils`,
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
  const { title, description } = seoForFormat(type);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${title} | Web Utils`,
    "description": description,
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
