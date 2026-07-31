import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Web IDE Workspace | Web Utils",
  description: "A complete online IDE workspace for web development. Write, test, and preview code directly in your browser.",
  keywords: ["online ide", "web ide", "javascript playground", "browser ide", "code sandbox"],
  alternates: { canonical: '/ide' },
};

export default function IdeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
