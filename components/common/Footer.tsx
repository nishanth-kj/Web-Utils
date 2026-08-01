import React from 'react';
import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-md py-3 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 px-4 md:px-6 text-sm text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <span>&copy; {new Date().getFullYear() > 2026 ? `2026 - ${new Date().getFullYear()}` : '2026'} Web Utils</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link href="/docs" className="hover:text-indigo-500 transition-colors">Docs</Link>
          <Link href="/faq" className="hover:text-indigo-500 transition-colors">FAQ</Link>
          <Link href="/about" className="hover:text-indigo-500 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-indigo-500 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-indigo-500 transition-colors">Terms</Link>
          <a href="https://github.com/nishanth-kj/Web-Utils" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors ml-2">
            <Github className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}