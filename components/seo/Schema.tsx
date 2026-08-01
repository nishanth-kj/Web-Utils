import React from 'react';

type SchemaProps = {
  type: "WebPage" | "SoftwareApplication" | "BreadcrumbList" | "HowTo";
  data: Record<string, any>;
};

export function JsonLdSchema({ type, data }: SchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
