import type { ToolSeoContent } from "@/components/shared/tool-seo-section";

// Below-the-fold SEO/how-to content for each tool page, keyed by its canonical
// path. Kept separate from the page components so the copy can be reviewed
// and updated without touching the tool UI itself.
export const TOOL_SEO_CONTENT: Record<string, ToolSeoContent> = {
    "/view/json": {
        toolName: "JSON Formatter",
        pagePath: "/view/json",
        what: "The JSON Formatter beautifies, validates, and repairs JSON in your browser. Paste minified or broken JSON and it pretty-prints it with 2-space indentation, then lets you switch between a raw code editor, an interactive tree view, and — for arrays of objects — an editable spreadsheet-style table. Built-in auto-repair (via jsonrepair) fixes common mistakes like trailing commas, single quotes, and unquoted keys before falling back to strict parsing.",
        steps: [
            "Paste or type your JSON into the source panel on the left.",
            "Run the format action to pretty-print it with 2-space indentation.",
            "Switch to the tree view to explore nested objects, or the table view if your JSON is an array of objects.",
            "Toggle word wrap or font size from the settings menu if long lines are hard to read.",
            "Copy the formatted result or download it as a .json file.",
        ],
        errors: [
            {
                title: "Unexpected token in JSON",
                description: "Raised when a comma, quote, or bracket is missing. The formatter first tries to auto-repair common issues (trailing commas, single quotes, unquoted keys) before showing this — if it still fails, check the exact character position it points to.",
            },
            {
                title: "Unexpected end of JSON input",
                description: "The JSON was cut off — usually a missing closing } or ] at the end of the pasted text.",
            },
        ],
        faqs: [
            { question: "Does the JSON formatter upload my data anywhere?", answer: "No. Parsing, repairing, and formatting all happen in your browser with JavaScript — your JSON never leaves your device." },
            { question: "Can it fix broken JSON automatically?", answer: "Yes, for common mistakes like trailing commas, single-quoted strings, and unquoted keys. It falls back to strict parsing for anything more broken than that." },
            { question: "What's the difference between the tree view and the table view?", answer: "The tree view lets you expand and collapse nested objects and arrays. The table view only appears when your JSON is an array of objects, and shows each field as an editable column." },
            { question: "Can I format multiple JSON documents at once?", answer: "Yes — paste several JSON documents back to back and the formatter parses and pretty-prints each one separately." },
            { question: "How is this different from other online JSON formatters?", answer: "It runs entirely client-side with no upload step, includes an editable tree/table view instead of plain text, and auto-repairs many syntax mistakes instead of only reporting them." },
        ],
        relatedHrefs: ["/view/yaml", "/view/xml", "/editor", "/dummy"],
    },

    "/view/yaml": {
        toolName: "YAML Formatter",
        pagePath: "/view/yaml",
        what: "The YAML Formatter parses and re-indents YAML in your browser using js-yaml, the same parser many Node.js tools rely on. It re-serializes your document with consistent indentation, catching structural mistakes that are easy to miss by eye since YAML relies on whitespace instead of brackets.",
        steps: [
            "Paste your YAML into the source panel.",
            "Run the format action to re-indent and normalize it.",
            "Read the syntax-highlighted output in the code viewer.",
            "Fix any reported indentation or structure errors and re-format.",
            "Copy the result or download it as a .yaml file.",
        ],
        errors: [
            { title: "Bad indentation of a mapping entry", description: "YAML is whitespace-sensitive; a key indented with a different number of spaces than its siblings breaks the block. Mixing tabs and spaces is a common cause." },
            { title: "End of the stream or a document separator is expected", description: "Usually means a value wasn't quoted where it needed to be — colons or dashes inside plain strings can be misread as YAML syntax." },
        ],
        faqs: [
            { question: "Why does my YAML fail to parse but the same data works as JSON?", answer: "YAML uses indentation instead of braces, so a single stray space or a mixed tab/space indent changes the structure. Try the JSON Formatter if you just need to validate the data itself." },
            { question: "Does it support multiple documents in one file (--- separators)?", answer: "Yes — js-yaml, the parser behind this tool, supports document separators as well as anchors and aliases." },
            { question: "Can I convert YAML to JSON here?", answer: "Not directly on this page — format your YAML here, then paste the resulting structure into the JSON Formatter or Code Editor to convert it." },
            { question: "Is my YAML sent anywhere for validation?", answer: "No, parsing happens entirely in your browser via the js-yaml library." },
        ],
        relatedHrefs: ["/view/json", "/view/xml", "/editor"],
    },

    "/view/xml": {
        toolName: "XML Formatter",
        pagePath: "/view/xml",
        what: "The XML Formatter cleans up minified or inconsistently indented XML and displays the result in a syntax-highlighted code viewer. It works for generic XML documents, configuration files, and feeds.",
        steps: [
            "Paste your XML into the source panel.",
            "Run the format action to re-indent nested elements.",
            "Review the highlighted output for unclosed or mismatched tags.",
            "Copy the formatted XML or download it as a .xml file.",
            "For Android layout files specifically, use the Android XML viewer instead for attribute-aware highlighting.",
        ],
        errors: [
            { title: "Unclosed tag", description: "Every opening tag needs a matching closing tag (or a self-closing / at the end); the formatter fails on the first mismatch it finds." },
            { title: "Text content does not match the XML structure", description: "Usually a stray < or & character that needs to be escaped (&lt; / &amp;) inside element text." },
        ],
        faqs: [
            { question: "Does this validate my XML against a schema (XSD/DTD)?", answer: "No — it checks that tags are well-formed and re-indents the document, but doesn't validate against an external schema." },
            { question: "What's the difference between this and the Android XML viewer?", answer: "The Android XML viewer adds attribute-aware highlighting for Android layout/resource files; this one is a general-purpose XML formatter for any document." },
            { question: "Can I format SVG files here?", answer: "SVG is valid XML, but use the dedicated SVG Viewer instead — it also renders the graphic, not just the markup." },
            { question: "Is my XML uploaded anywhere?", answer: "No, formatting runs entirely in your browser." },
        ],
        relatedHrefs: ["/view/android-xml", "/view/svg", "/view/html"],
    },

    "/view/html": {
        toolName: "HTML Live Preview",
        pagePath: "/view/html",
        what: "The HTML Live Preview renders your markup in a sandboxed iframe as you type, with one-click toggles for Bootstrap 5.3 and the Tailwind CDN so you can prototype against either framework without a build step. JavaScript inside your HTML runs too, so interactive snippets behave like they would in a real page.",
        steps: [
            "Paste or write your HTML in the source panel.",
            "Toggle \"BS\" for Bootstrap 5 or \"TW\" for Tailwind if your markup depends on either framework's classes.",
            "Watch the preview pane update as you type.",
            "Use \"Full Page\" to open the rendered result in its own browser tab.",
            "Download the HTML file or copy it to your clipboard when you're done.",
        ],
        errors: [
            { title: "Styles from Bootstrap/Tailwind aren't applying", description: "Make sure the matching toggle (BS or TW) is switched on — without it, only your own inline styles and <style> tags are used." },
            { title: "My script tag doesn't run as expected", description: "The preview loads your HTML into a fresh iframe document, so scripts that expect elements from the parent page won't have access to them." },
        ],
        faqs: [
            { question: "Is the preview sandboxed?", answer: "Yes, your HTML renders inside an isolated iframe document rather than the main page." },
            { question: "Can I preview Bootstrap and Tailwind together?", answer: "Yes, both toggles can be enabled at once, though the two frameworks' default styles may conflict as they would on any real page." },
            { question: "Does it support live reload for external files?", answer: "No — this is a single-document previewer; it doesn't fetch or watch external HTML/CSS/JS files." },
            { question: "Is my HTML sent to a server to render?", answer: "No, everything renders locally in your browser via an iframe." },
        ],
        relatedHrefs: ["/view/xml", "/view/svg", "/editor"],
    },

    "/view/svg": {
        toolName: "SVG Viewer",
        pagePath: "/view/svg",
        what: "The SVG Viewer renders your SVG markup directly in the browser, alongside a syntax-highlighted view of the underlying code, so you can check paths, viewBox sizing, and colors before dropping the graphic into a project.",
        steps: [
            "Paste your SVG markup, including the outer <svg> tag, into the source panel.",
            "The preview pane renders it immediately — there's no separate \"run\" step.",
            "Adjust attributes like viewBox, width, or fill and watch the preview update.",
            "Copy the SVG markup or download it as a .svg file.",
        ],
        errors: [
            { title: "Nothing renders in the preview", description: "The root element must be a valid <svg> tag with a viewBox or explicit width/height; a missing or malformed root tag leaves the preview blank rather than showing an error." },
            { title: "The graphic looks cropped or the wrong size", description: "Check the viewBox values — SVG scales to fit its container based on viewBox, not the raw width/height attributes." },
        ],
        faqs: [
            { question: "Can I edit the SVG and see changes live?", answer: "Yes, the preview updates as you type in the source panel." },
            { question: "Does it optimize or minify my SVG?", answer: "No, this is a viewer, not an optimizer — use the source editor to clean up unnecessary attributes manually." },
            { question: "Can I convert SVG to PNG here?", answer: "Not on this page — download the SVG and convert it with an image tool if you need a raster format." },
        ],
        relatedHrefs: ["/view/xml", "/view/html", "/draw"],
    },

    "/view/csv": {
        toolName: "CSV Viewer",
        pagePath: "/view/csv",
        what: "The CSV Viewer turns comma-separated text into an editable spreadsheet-style table, using the first row as column headers. Edit cells directly in the table and the underlying CSV text updates automatically.",
        steps: [
            "Paste your CSV data into the source panel, with the header row first.",
            "Switch to the table view to see it as a spreadsheet.",
            "Click any cell to edit its value directly.",
            "Copy the CSV text or download it as a .csv file when you're done.",
        ],
        errors: [
            { title: "Columns look misaligned", description: "Rows are split on plain commas, so a value that itself contains a comma will shift every column after it. Remove or re-escape commas inside individual fields." },
            { title: "First row is treated as data instead of headers", description: "The table always uses row 1 as column names; if your file doesn't have a header row, add one before pasting." },
        ],
        faqs: [
            { question: "Does it handle quoted fields with commas inside them?", answer: "It splits on commas directly, so fields containing commas should be checked carefully afterward — quote-aware parsing isn't guaranteed for every edge case." },
            { question: "Can I edit cells and export the changes?", answer: "Yes, editing a cell in the table updates the CSV text immediately, which you can then copy or download." },
            { question: "What delimiter does it expect?", answer: "Comma-separated values; semicolon- or tab-separated files will need to be converted first." },
            { question: "Is my CSV uploaded anywhere?", answer: "No, parsing and editing happen entirely in your browser." },
        ],
        relatedHrefs: ["/view/json", "/dummy", "/editor"],
    },

    "/view/markdown": {
        toolName: "Markdown Preview",
        pagePath: "/view/markdown",
        what: "The Markdown Preview renders GitHub-flavored Markdown — including tables, task lists, and strikethrough — as you type, using the same remark-gfm rules many README renderers use.",
        steps: [
            "Write or paste your Markdown into the source panel.",
            "Watch the formatted preview update on the right.",
            "Use GFM syntax like tables, - [ ] task lists, and ~~strikethrough~~ as needed.",
            "Copy the raw Markdown or download it as a .md file.",
        ],
        errors: [
            { title: "My embedded HTML isn't showing up", description: "Raw HTML tags inside Markdown are shown as plain text rather than rendered, since the previewer doesn't execute embedded HTML for safety." },
            { title: "My table isn't rendering as a table", description: "GFM tables need a header row followed by a separator row of dashes (|---|---|); without it, the pipes are treated as plain text." },
        ],
        faqs: [
            { question: "Does it support GitHub-flavored Markdown (tables, checkboxes)?", answer: "Yes, via remark-gfm — tables, task lists, and strikethrough all render." },
            { question: "Can I preview a README.md exactly as GitHub would show it?", answer: "Very closely, since it uses the same GFM extensions, though GitHub's own CSS and emoji handling can differ slightly." },
            { question: "Will inline HTML in my Markdown render?", answer: "No, HTML tags are shown as literal text rather than executed." },
            { question: "Is my Markdown sent to a server to render?", answer: "No, rendering happens locally with react-markdown." },
        ],
        relatedHrefs: ["/view/html", "/editor", "/docs"],
    },

    "/view/android-xml": {
        toolName: "Android XML Viewer",
        pagePath: "/view/android-xml",
        what: "The Android XML Viewer adds attribute-aware syntax highlighting for Android layout and resource files — the XML that defines Views, dimensions, and styles in native Android projects.",
        steps: [
            "Paste your layout or resource XML (e.g. activity_main.xml) into the source panel.",
            "Review the highlighted attributes and structure in the viewer.",
            "Fix any unclosed tags or malformed attribute values.",
            "Copy the XML or download it.",
        ],
        errors: [
            { title: "Unclosed tag", description: "Every View or resource element needs a matching close (or self-closing /) — the same rule as any XML document." },
            { title: "Namespace prefix not recognized", description: "Attributes like android:layout_width rely on the xmlns:android declaration on the root element; make sure it's present if you're pasting a fragment." },
        ],
        faqs: [
            { question: "Is this different from the generic XML formatter?", answer: "Yes, it highlights Android-specific attributes and structure; use the plain XML Formatter for other kinds of XML." },
            { question: "Can I preview the actual layout visually?", answer: "No, this shows the XML source with highlighting, not a rendered Android UI." },
            { question: "Does it validate against Android's attribute schema?", answer: "No, it checks that the XML itself is well-formed, not that every attribute value is valid for its View type." },
        ],
        relatedHrefs: ["/view/xml", "/view/json", "/editor"],
    },

    "/view/react": {
        toolName: "React (JSX) Viewer",
        pagePath: "/view/react",
        what: "The React (JSX/TSX) viewer gives you syntax-highlighted, formatted code for React components — useful for cleaning up minified or oddly-indented JSX before pasting it into a project. It formats and highlights code; it does not execute or render the component live.",
        steps: [
            "Paste your JSX or TSX code into the source panel.",
            "Run the format action to apply Prettier's formatting rules.",
            "Read the syntax-highlighted result in the code viewer.",
            "Copy the formatted code or download it as a file.",
        ],
        errors: [
            { title: "Format action does nothing or throws a parse error", description: "The formatter expects valid JSX/TSX syntax; an unclosed tag or mismatched bracket stops it from formatting the file." },
        ],
        faqs: [
            { question: "Does this render my component live?", answer: "No — it formats and highlights the code only. Use a sandbox like CodeSandbox or your own dev server to render components." },
            { question: "Does it support TypeScript syntax (TSX)?", answer: "Yes, formatting uses Prettier's Babel-TS parser, which understands both JSX and TypeScript." },
            { question: "Is my code uploaded anywhere?", answer: "No, formatting happens locally using Prettier compiled to run in the browser." },
        ],
        relatedHrefs: ["/editor", "/view/json", "/view/html"],
    },

    "/time": {
        toolName: "Epoch Converter",
        pagePath: "/time",
        what: "The Epoch Converter turns Unix timestamps (seconds or milliseconds) into human-readable dates and back, with a searchable timezone picker and a 12/24-hour display toggle — built for debugging logs, JWTs, and API responses that use epoch time.",
        steps: [
            "Type a Unix timestamp, or a date string, into the input field.",
            "The converter detects whether you entered seconds or milliseconds and shows the parsed date instantly.",
            "Search for and select a timezone from the picker to see the same instant in a different region.",
            "Switch between 12-hour and 24-hour display using the clock format toggle.",
            "Use the +/- second controls to nudge the timestamp, or the date picker to jump to a specific day.",
        ],
        errors: [
            { title: "Invalid date format", description: "Shown when the input isn't a recognizable timestamp or date string; double-check for stray characters or an incomplete number." },
            { title: "Timezone not found", description: "Search using the city or region name (e.g. America/New_York) rather than an abbreviation like EST, since abbreviations are ambiguous across regions." },
        ],
        faqs: [
            { question: "Does it know whether I typed seconds or milliseconds?", answer: "Yes, it inspects the length/magnitude of the number you enter and parses it as seconds or milliseconds accordingly." },
            { question: "Can I convert a date to epoch time instead of the other way around?", answer: "Yes, the same input field accepts a human-readable date and shows its epoch value." },
            { question: "Does it support timezones other than UTC?", answer: "Yes, use the timezone picker to see the same moment displayed in any IANA timezone." },
            { question: "Is 'epoch time' the same as 'Unix time'?", answer: "Yes, both refer to the number of seconds (or milliseconds) since 00:00:00 UTC on January 1, 1970." },
            { question: "Is my timestamp sent anywhere?", answer: "No, all conversion happens locally in JavaScript using your browser's Date and Intl APIs." },
        ],
        relatedHrefs: ["/crypto", "/dummy", "/editor"],
    },

    "/crypto": {
        toolName: "UUID Generator",
        pagePath: "/crypto",
        what: "The UUID Generator creates version-4 (random) UUIDs — 128-bit identifiers formatted as 36-character strings — using your browser's built-in crypto.randomUUID() for cryptographically strong randomness, with a fallback for older browsers.",
        steps: [
            "Choose how many UUIDs to generate at once (1, 5, 10, 20, or 50).",
            "Click \"Generate New\" to create a fresh batch.",
            "Click the copy icon next to any UUID to copy it to your clipboard.",
            "Generate again whenever you need more — nothing is saved between visits.",
        ],
        errors: [
            { title: "UUIDs look different from what my database expects", description: "v4 UUIDs use the standard 8-4-4-4-12 hyphenated format; if your system expects a different UUID version (v1, v5) or no hyphens, you'll need to reformat or use a different generator." },
        ],
        faqs: [
            { question: "What UUID version does this generate?", answer: "Version 4 (random), the most common choice for generating unique IDs without coordination between systems." },
            { question: "Are these UUIDs cryptographically secure?", answer: "Yes, they're generated with crypto.randomUUID() where available, which uses the browser's secure random number generator." },
            { question: "Can two generated UUIDs collide?", answer: "Practically no — v4 UUIDs have 122 random bits, making collisions astronomically unlikely even at huge scale." },
            { question: "Are the UUIDs sent anywhere or logged?", answer: "No, generation happens entirely in your browser; nothing is transmitted or stored on our servers." },
        ],
        relatedHrefs: ["/password", "/time", "/dummy"],
    },

    "/password": {
        toolName: "Password Tool",
        pagePath: "/password",
        what: "The Password Tool has two parts: a generator that creates strong random passwords with configurable length and character sets, and a hash cracker that checks a password against a database of the top 1 million leaked passwords — entirely offline, using WebAssembly.",
        steps: [
            "Open the Generator tab to create a new password, adjusting length and character options as needed.",
            "Review the strength assessment shown alongside the generated password.",
            "Switch to the Hash Cracker tab to test a password against the leaked-password database.",
            "Wait for the WebAssembly engine and database to finish loading (shown by the \"Initializing\" indicator) before running a check.",
            "Copy the result you need.",
        ],
        errors: [
            { title: "\"Initializing engine and loading databases...\" never finishes", description: "This step downloads a WebAssembly module and a roughly 1M-entry password list; a slow connection or blocked request can leave it stuck. Try refreshing the page." },
            { title: "Password not found in database", description: "This means the password wasn't in the top 1 million most common leaked passwords, not that it's necessarily strong — always check the strength meter as well." },
        ],
        faqs: [
            { question: "Does the hash cracker send my password to a server?", answer: "No, the comparison runs locally in your browser via WebAssembly against a downloaded password list — nothing you type is transmitted." },
            { question: "How is password strength calculated?", answer: "It's based on length and character variety (uppercase, lowercase, numbers, symbols), shown alongside each generated password." },
            { question: "What does it mean if my password isn't found in the cracker?", answer: "It means it isn't one of the million most commonly leaked passwords, which is a good sign, but strength still depends on length and randomness." },
            { question: "Can I generate a password without symbols?", answer: "Yes, character set options (letters, numbers, symbols) are configurable in the Generator tab." },
        ],
        relatedHrefs: ["/crypto", "/time"],
    },

    "/dummy": {
        toolName: "Dummy File Generator",
        pagePath: "/dummy",
        what: "The Dummy File Generator creates placeholder files of an exact size and extension entirely in your browser — useful for testing upload limits, storage handling, or slow-network behavior without needing a real file lying around.",
        steps: [
            "Enter a file name and extension (e.g. test-file.bin).",
            "Set the target size and choose its unit — KB, MB, or GB.",
            "Click generate and watch the progress indicator.",
            "Cancel generation at any time if you change your mind.",
            "Save the generated file once it's ready.",
        ],
        errors: [
            { title: "Generation is slow or the tab feels unresponsive for large sizes", description: "Very large files (multiple GB) are built and held in browser memory before saving, so size is limited by your device's available RAM." },
            { title: "The downloaded file won't open in the target application", description: "The contents are placeholder bytes, not a valid file of that format — use it to test size and handling, not to open as real media." },
        ],
        faqs: [
            { question: "What's actually inside the generated file?", answer: "Placeholder byte content sized to exactly match your target size — it isn't a valid image, video, or document internally, just the right number of bytes." },
            { question: "Is there a maximum file size?", answer: "It's limited by your browser's available memory rather than a fixed cap — very large sizes (multiple GB) may be slow or fail on lower-memory devices." },
            { question: "Is the file uploaded anywhere during generation?", answer: "No, it's generated and saved locally; nothing is sent to a server." },
            { question: "Why would I need a fake file like this?", answer: "Common uses are testing upload size limits, verifying progress bars, or checking how an app handles large attachments without using real data." },
        ],
        relatedHrefs: ["/view/json", "/editor", "/crypto"],
    },

    "/editor": {
        toolName: "Code Editor",
        pagePath: "/editor",
        what: "The Code Editor is a Monaco-based editor — the same engine behind VS Code — with syntax highlighting for JSON, YAML, HTML, CSS, JavaScript, TypeScript, SQL, Python, and more, plus one-click formatting and local auto-save so you don't lose work on refresh.",
        steps: [
            "Pick a language from the format selector.",
            "Write or paste your code into the editor.",
            "Run the format action to apply language-appropriate formatting rules.",
            "Adjust font size, tab size, or word wrap from the settings menu.",
            "Download your file or copy its contents when you're done.",
        ],
        errors: [
            { title: "Formatting does nothing", description: "The format action only runs for languages with a configured formatter (JSON, YAML, SQL, and Prettier-supported languages); some languages are highlighted but not auto-formatted." },
            { title: "My work disappeared after closing the tab", description: "Content auto-saves to your browser's local storage, which is cleared if you clear site data or use a private/incognito window." },
        ],
        faqs: [
            { question: "Which languages does the editor support?", answer: "Syntax highlighting covers JSON, YAML, HTML, CSS, JavaScript, TypeScript, SQL, Python, Go, Rust, C++, Java, and more; auto-formatting is available for the most common ones." },
            { question: "Is my code saved anywhere besides my browser?", answer: "No, auto-save uses local storage on your device — nothing is uploaded." },
            { question: "Can I use this for large files?", answer: "Monaco handles reasonably large files well, but very large files (tens of thousands of lines) may feel slower in the browser." },
        ],
        relatedHrefs: ["/view/json", "/draw", "/sql-visualization", "/code-video"],
    },

    "/draw": {
        toolName: "Quick Draw",
        pagePath: "/draw",
        what: "Quick Draw is a canvas-based sketching tool for quick diagrams, flowcharts, and whiteboards, rendered in a hand-drawn sketch style with shapes, connectors, and text you can style, move, and export as an image.",
        steps: [
            "Pick a tool (shape, connector, or text) from the toolbar.",
            "Draw on the canvas and connect shapes with edges.",
            "Adjust color and style from the style panel.",
            "Zoom and pan using the zoom controls to work on larger diagrams.",
            "Export your diagram as a PNG image when you're done.",
        ],
        errors: [
            { title: "Exported image looks cropped", description: "The export captures the current canvas viewport; zoom out or fit-to-view before exporting if elements are cut off." },
        ],
        faqs: [
            { question: "Is this the same as Excalidraw?", answer: "No — it's a custom canvas built with React Flow, styled with a hand-drawn look, not an Excalidraw embed." },
            { question: "Can I export my diagram?", answer: "Yes, as a PNG image." },
            { question: "Is my diagram saved anywhere?", answer: "Diagrams live in the canvas for your current session; export to PNG to keep a copy." },
        ],
        relatedHrefs: ["/editor", "/sql-visualization", "/code-video"],
    },

    "/sql-visualization": {
        toolName: "SQL Visualizer",
        pagePath: "/sql-visualization",
        what: "The SQL Visualizer turns CREATE TABLE statements into an ER diagram showing tables, columns, and foreign-key relationships, and turns SELECT queries into a readable step-by-step execution pipeline — useful for understanding schemas and queries you didn't write.",
        steps: [
            "Paste one or more CREATE TABLE statements into the ER tab to generate a relationship diagram.",
            "Switch to the Query tab and paste a SELECT statement to see its execution steps laid out visually.",
            "Use the Format tab to clean up and re-indent SQL you paste in.",
            "Pan and zoom the generated diagram to explore larger schemas.",
        ],
        errors: [
            { title: "No relationships shown between tables", description: "Foreign keys need to be declared explicitly (e.g. REFERENCES other_table(id)) in the CREATE TABLE statement for the parser to draw a connection." },
            { title: "Query fails to visualize", description: "The parser expects standard SQL syntax; database-specific extensions or syntax errors can prevent it from building the pipeline." },
        ],
        faqs: [
            { question: "What SQL dialect does it expect?", answer: "Standard SQL is best supported; some database-specific syntax may not parse correctly." },
            { question: "Does it run my SQL against a real database?", answer: "No, it only parses the SQL text to build a diagram — nothing is executed against any database." },
            { question: "Can I visualize a query without also defining its tables?", answer: "Yes, the Query tab visualizes SELECT statements independently of the ER diagram." },
        ],
        relatedHrefs: ["/editor", "/draw", "/code-video"],
    },

    "/code-video": {
        toolName: "Code Typing Video Generator",
        pagePath: "/code-video",
        what: "The Code Typing Video Generator turns a pasted code snippet into a typing-animation clip — a syntax-highlighted, macOS-style code window that types itself out with a realistic human rhythm. Pick a syntax theme, background, typing speed, resolution, and frame rate, scrub through the animation with playback controls, then export it as an MP4 (up to 4K at 120fps) or grab a PNG of the finished code block. Rendering happens with WebCodecs and canvas directly in your browser, so the code never leaves your machine.",
        steps: [
            "Paste your code into the source editor on the left and pick its language.",
            "Choose a syntax theme, background, window style, and typing speed from the settings panel.",
            "Pick an export resolution (up to 4K, landscape or vertical) and frame rate (up to 120fps).",
            "Use the play/pause button and scrubber under the preview to check the animation before exporting.",
            "Click Export Video to render and download an MP4 (or WebM, on browsers without WebCodecs), or Download PNG to save the fully-typed code block as an image.",
        ],
        errors: [
            { title: "Export video is grayed out", description: "It's disabled until the video font finishes loading — this only takes a moment on first load." },
            { title: "Export failed at 4K/120fps", description: "Some browsers can't hardware-encode that exact resolution/frame-rate combination. Try a lower frame rate (60fps) or resolution (1080p), or use an up-to-date Chrome/Edge build." },
            { title: "Video exported as WebM instead of MP4", description: "Your browser doesn't support the WebCodecs video encoder used for fast MP4 export, so it fell back to a real-time WebM recording — the output is still a valid, playable video." },
        ],
        faqs: [
            { question: "Does my code get uploaded anywhere to render the video?", answer: "No. Tokenizing, animating, and encoding all happen locally in your browser using Canvas and the WebCodecs API — nothing is sent to a server." },
            { question: "What's the maximum resolution and frame rate?", answer: "Up to 4K (3840×2160, or 2160×3840 vertical) at up to 120fps, limited by what your browser's video encoder supports at that combination." },
            { question: "Can I export a still image instead of a video?", answer: "Yes — Download PNG renders the fully-typed code block, auto-sized to fit every line, as a shareable image." },
            { question: "Which languages are supported for syntax highlighting?", answer: "JavaScript, TypeScript (including JSX/TSX), Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, JSON, YAML, Bash, HTML, CSS, and Markdown." },
            { question: "Why does the typing look human instead of a robotic constant speed?", answer: "Each character's delay is randomized within a range around your chosen typing speed, with pauses after newlines and faster spacing on whitespace, so the animation reads like a real person typing." },
        ],
        relatedHrefs: ["/editor", "/draw", "/sql-visualization"],
    },
};
