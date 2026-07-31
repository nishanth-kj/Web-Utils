import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Online Code Editor & Formatter | Web Utils",
  description: "Format, validate, and preview JSON, YAML, HTML, and React code in a powerful Monaco-based online editor.",
  keywords: ["online code editor", "json formatter", "yaml validator", "html preview", "monaco editor"],
  alternates: { canonical: '/editor' },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
