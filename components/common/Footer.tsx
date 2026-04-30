import React from 'react';
import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-md py-3 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 px-4 md:px-6 text-sm text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()} Web Utils</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-indigo-500 transition-colors">Documentation</Link>
          <Link href="/" className="hover:text-indigo-500 transition-colors">Privacy</Link>
          <a href="https://github.com/nishanth-kj/Web-Utils" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            <Github className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}