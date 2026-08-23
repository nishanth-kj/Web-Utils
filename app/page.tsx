import type { Metadata } from 'next';
import ToolsListingPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Web Utils | Universal Code Previewer & Developer Tools',
  description: 'A professional, fast, and comprehensive suite of developer tools for editing, previewing, formatting, and converting HTML, JSON, YAML, SQL, and Markdown.',
  alternates: {
    canonical: '/',
  },
};

export default function Page() {
  return <ToolsListingPageClient />;
}
