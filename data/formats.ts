export const DEFAULT_CONTENT = {
  html: `<!-- Bootstrap & Tailwind Example -->
<div class="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden md:max-w-2xl m-8 p-10 border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-2xl">
  <div class="md:flex">
    <div class="flex flex-col gap-6">
      <div class="flex items-center gap-2">
        <div class="size-3 rounded-full bg-indigo-500 animate-pulse"></div>
        <span class="uppercase tracking-widest text-xs text-indigo-500 font-bold">Web Utils Pro</span>
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        High Performance <span class="text-indigo-600">HTML Preview</span>
      </h1>
      <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Experience live, 1:1 rendering of your code. Full support for utility-first CSS, modern component layouts, and interactive elements.
      </p>
      <div class="flex gap-4">
        <button class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          Deploy Now
        </button>
        <button class="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95">
          Learn More
        </button>
      </div>
    </div>
  </div>
</div>`,
  json: `{
  "tool": "Web Utils Pro",
  "status": "ready",
  "capabilities": {
    "syntax_highlighting": true,
    "formatting": "automatic",
    "supported_formats": [
      "JSON",
      "YAML", 
      "XML", 
      "CSV", 
      "Markdown"
    ]
  },
  "metrics": {
    "speed": "instant",
    "reliability": 0.999,
    "latency": "14ms"
  },
  "author": "Nishanth KJ"
}`,
  yaml: `project: Web Utils Pro
version: 1.2.0
settings:
  theme: premium-dark
  autosave: true
  features:
    preview: enabled
    formatting: smart
    validation: active
  notifications:
    email: true
    slack: false
endpoints:
  - https://api.webviewer.pro/v1
  - https://api.webviewer.pro/v2`,
  react: `import React, { useState } from 'react';
import { Layout, Zap, Box } from 'lucide-react';

export default function PremiumComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-10 bg-gradient-to-br from-zinc-900 to-black text-white rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-400/30">
            <Zap className="text-indigo-400 size-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">React Viewer</h1>
        </div>
        <p className="text-zinc-400 mb-8 leading-relaxed max-w-md">
          Paste your JSX or TSX code here to see professional syntax highlighting and component structure analysis in real-time.
        </p>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-8 py-3 bg-indigo-600 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all font-bold shadow-lg shadow-indigo-500/30"
        >
          Interactions: {count}
        </button>
      </div>
    </div>
  );
}`,
  markdown: `# 📊 Web Utils Pro - Markdown
## Smart Documentation System
This is a **High-Fidelity** Markdown preview engine designed for developers.

### Supported Features:
- **GFM Tables** support with premium styling
- Code blocks with intelligent syntax highlighting
- Interactive checklists for project management
- [x] Premium Professional Design
- [x] Fast Real-time Rendering
- [ ] Legacy UI Support

---

> "The most efficient way to preview and document your code is with Web Utils Pro's integrated markdown engine."`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<Project name="Web Utils Pro">
  <Module id="viewer-core">
    <Component type="Editor" version="2.0.4" />
    <Component type="Renderer" engine="Next.js 15" />
    <Configuration>
      <Setting key="high-fidelity" value="true" />
      <Setting key="sandbox" value="enabled" />
      <Setting key="theme" value="system-aware" />
    </Configuration>
  </Module>
  <Metadata>
    <Author>Nishanth KJ</Author>
    <License>MIT</License>
  </Metadata>
</Project>`,
  svg: `<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(79,70,229);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(147,51,234);stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="400" height="200" rx="24" fill="url(#grad1)" filter="url(#shadow)" />
  <circle cx="200" cy="100" r="60" fill="white" fill-opacity="0.1" stroke="white" stroke-width="1.5" />
  <text x="200" y="115" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="white" style="letter-spacing: 2px;">SVG PREVIEW</text>
  <path d="M140 160 Q 200 120 260 160" stroke="white" stroke-width="3" fill="transparent" stroke-linecap="round" opacity="0.6" />
</svg>`,
  csv: `ItemID,Product Name,Category,Price,Status,Growth
WV-001,Web Utils Pro,Developer Tool,99.00,Active,+12.5%
WV-002,API Connector,Infrastructure,249.00,Active,+8.2%
WV-003,Cloud CLI,DevOps,49.00,Beta,+25.0%
WV-004,Design Suite,Creative,129.00,Active,+4.1%
WV-005,Analytics Node,Analytics,199.00,Active,+18.7%`
};
