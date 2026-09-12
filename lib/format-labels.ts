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
