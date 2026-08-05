import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { JsonLdSchema } from '@/components/seo/Schema';

export type BreadcrumbItem = {
  name: string;
  url: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaData = {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://webutils.site${item.url}`
    }))
  };

  return (
    <>
      <JsonLdSchema type="BreadcrumbList" data={schemaData} />
      
      <nav aria-label="Breadcrumb" className="mb-6 flex">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="flex items-center hover:text-foreground transition-colors">
              <Home className="size-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.url} className="flex items-center space-x-2">
                <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link 
                    href={item.url} 
                    className="hover:text-foreground transition-colors truncate max-w-[150px]"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
