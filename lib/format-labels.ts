// Human-readable labels for each previewable format, shared between the
// per-format metadata (generateMetadata) and the visible/sr-only page heading
// so the two never drift apart.
const FORMAT_LABELS: Record<string, string> = {
  html: "HTML",
  json: "JSON",
  yaml: "YAML",
  react: "React (JSX)",
  markdown: "Markdown",
  xml: "XML",
  svg: "SVG",
  csv: "CSV",
  "android-xml": "Android XML",
};

export function labelForFormat(type: string): string {
  return FORMAT_LABELS[type] ?? type;
}

// Titles follow what people search for ("JSON formatter", "CSV editor")
// rather than the generic "<Format> Viewer"; used for <title> and the h1.
const FORMAT_PAGE_SEO: Record<string, { title: string; description: string }> = {
  html: {
    title: "HTML Viewer & Live Preview",
    description: "Preview HTML as you type, with one-click Bootstrap 5 and Tailwind CSS, then open the result full page. Free online HTML viewer that runs in your browser.",
  },
  json: {
    title: "JSON Formatter & Validator",
    description: "Format, validate and repair JSON online, then explore it as a collapsible tree or an editable table. Free, fast, and private: your JSON never leaves the browser.",
  },
  yaml: {
    title: "YAML Formatter & Validator",
    description: "Validate and re-indent YAML online with syntax highlighting. Free YAML formatter that runs entirely in your browser, so nothing is uploaded.",
  },
  react: {
    title: "React JSX Viewer & Formatter",
    description: "View and format React JSX/TSX components with syntax highlighting. Free online formatter that runs entirely in your browser.",
  },
  markdown: {
    title: "Markdown Previewer",
    description: "Write Markdown and see a live GitHub-flavored preview with tables, task lists and fenced code blocks. Free and runs entirely in your browser.",
  },
  xml: {
    title: "XML Formatter & Viewer",
    description: "Pretty-print XML and inspect it with syntax highlighting. Free online XML formatter and viewer that runs entirely in your browser.",
  },
  svg: {
    title: "SVG Viewer & Editor",
    description: "Paste SVG code and preview the graphic instantly next to the highlighted markup, then download it. Free SVG viewer that runs in your browser.",
  },
  csv: {
    title: "CSV Viewer & Editor",
    description: "Open CSV files as a sortable, editable table, then copy or download the result. Free online CSV viewer and editor that runs in your browser.",
  },
  "android-xml": {
    title: "Android XML Layout Viewer",
    description: "Preview Android XML layout files with attribute-aware highlighting. Free online Android layout viewer that runs entirely in your browser.",
  },
};

export function seoForFormat(type: string): { title: string; description: string } {
  const label = labelForFormat(type);
  return FORMAT_PAGE_SEO[type] ?? {
    title: `${label} Viewer`,
    description: `View, format, and preview ${label} content instantly in your browser with syntax highlighting and live rendering.`,
  };
}
