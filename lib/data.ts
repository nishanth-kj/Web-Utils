export const DEFAULT_CONTENT = {
    html: `<!-- Bootstrap Example -->
<div class="card shadow-lg border-0">
  <div class="card-body p-5">
    <h2 class="card-title text-primary mb-4">Hello World</h2>
    <p class="card-text text-muted">This is a live preview with Bootstrap 5 & Tailwind.</p>
    <button class="btn btn-primary rounded-pill px-4">Click Me</button>
    <button class="bg-indigo-600 text-white px-4 py-2 rounded-full ml-2 hover:bg-indigo-700 transition">Tailwind Button</button>
  </div>
</div>`,
    json: `{
  "name": "Web Viewer",
  "version": "1.0.0",
  "features": [
    "Live Preview",
    "Multi-format Support",
    "Syntax Highlighting"
  ],
  "settings": {
    "theme": "dark",
    "fontSize": 14
  }
}`,
    yaml: `name: Web Viewer
version: 1.0.0
features:
  - Live Preview
  - Multi-format Support
  - Syntax Highlighting
settings:
  theme: dark
  fontSize: 14`,
    react: `import React from 'react';

export default function App() {
  return (
    <div className="p-4 bg-indigo-50 rounded-lg">
      <h1 className="text-2xl font-bold text-indigo-900">Hello React</h1>
      <p className="text-indigo-700">Start editing to see some magic happen!</p>
    </div>
  );
}`,
    markdown: `# Hello Markdown

This is a **live preview** of standard Markdown.

- List item 1
- List item 2

## Code Block
\`\`\`js
console.log("Hello World");
\`\`\`
`,
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>User</to>
  <from>Web Viewer</from>
  <heading>Reminder</heading>
  <body>Don't forget to check the preview!</body>
</note>`,
    svg: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>`,
    csv: `id,name,role,status
1,John Doe,Developer,Active
2,Jane Smith,Designer,Active
3,Bob Johnson,Manager,Inactive`
};
