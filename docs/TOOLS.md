# Tools & Utilities Guide 🛠️

A detailed user and developer reference for every tool available in **Web Utils**.

---

## 1. Code & Database Visualizers

### 🐛 Code Visualizer (`/code-visualizer`)
Step through code line-by-line in a sandboxed runtime to understand how your program executes in memory (similar to Python Tutor).

- **Supported Languages**: JavaScript and Python.
- **Call Stack Visualizer**: Displays stack frames, active function calls, parent scopes, and local variables.
- **Heap Memory Graph**: Renders objects, arrays, dictionaries, and lists on a live graph with pointer reference arrows (`RefEdge`).
- **Standard Output**: Synchronized console output stream capturing `console.log` and `print` statements per step.
- **Debugger Controls**: First Step, Previous Step, Next Step, Last Step, Auto-Play with configurable speed slider, and an interactive scrubber bar.

### 🗄️ SQL Visualizer (`/sql-visualization`)
Transform raw database SQL queries and schema definitions into visual artifacts.

- **ER Diagram Generator**: Parses SQL `CREATE TABLE` statements into interactive entity-relationship cards displaying column types, primary keys, and foreign key relations.
- **Interactive Relation Editor**: Add or delete foreign key relationships directly on the diagram canvas.
- **Query Flow Pipeline**: Visualizes complex `SELECT` queries with `JOIN`, `WHERE`, `GROUP BY`, and `ORDER BY` clauses into step-by-step data transformation flowcharts.
- **Export**: Download generated diagrams as high-resolution PNG images.

### 💻 Code Editor (`/editor`)
Full-featured in-browser code editor powered by Monaco Editor.

- **Syntax Support**: JavaScript, TypeScript, HTML, CSS, JSON, Python, Markdown, SQL, and more.
- **Productivity**: Multiple cursors, minimap navigation, bracket pair colorization, and code folding.
- **Formatting**: Format document via `Shift + Alt + F` or the top toolbar.

### 🎬 Code Typing Video (`/code-video`)
Turn code snippets into animated typing recordings.

- **Customization**: Select programming languages, syntax highlighting themes, typing speed, and background styles.
- **Export Options**: Export as high-resolution MP4 video (up to 4K / 120 FPS) or take high-DPI PNG snapshots.

---

## 2. Creative & Media Tools

### 🖼️ Image Editor (`/image-editor`)
Comprehensive in-browser photo and image manipulator.

- **Crop**: Interactive draggable crop handles with freeform or fixed aspect ratio constraints.
- **Resize**: Pixel-level width and height scaling with optional aspect ratio preservation.
- **Transformations**: 90° clockwise/counter-clockwise rotations and horizontal/vertical flips.
- **Visual Adjustments**: Real-time sliders for Brightness, Contrast, Saturation, and Blur.
- **Filters**: Grayscale, Sepia, and Invert presets.
- **Export**: Save edited images as PNG or JPEG with a quality compression slider.

### 🎥 Video Editor (`/video-editor`)
Client-side video trimmer and filter processor.

- **Timeline Scrubber**: Drag dual in/out trim handles to select the exact clip to keep.
- **Live Video Preview**: Canvas-rendered playback preview applying active adjustments in real time.
- **Visual Filters**: Brightness, contrast, saturation, rotation, and flip transforms.
- **WebM Export**: Direct browser-based clip encoding via `MediaRecorder` without uploading large files.

### ✏️ Quick Draw (`/draw`)
A lightweight, high-performance canvas sketching tool.

- **Tools**: Freehand drawing brush, eraser, stroke color picker, and brush width slider.
- **Use Cases**: System architecture sketches, wireframes, flow diagrams, or quick notes.
- **Export**: Export sketches directly to PNG.

---

## 3. Document Formats & Previewers

### 👁️ Live Previewer (`/view`)
Unified live rendering workspace with multi-format tabs.

- **HTML & Bootstrap (`/view/html`)**: Sandboxed iframe preview with Bootstrap 5.3 CDN integration.
- **JSON (`/view/json`)**: Syntax-highlighted tree view, validation error markers, and beautification.
- **YAML (`/view/yaml`)**: Two-way validation and formatting for configuration files.
- **Markdown (`/view/markdown`)**: Real-time GitHub-flavored Markdown rendering with syntax-highlighted code blocks.
- **SVG (`/view/svg`)**: Live rendering of vector graphics side-by-side with raw XML markup.
- **CSV & XML (`/view/csv`, `/view/xml`)**: Formatted inspection and tabular layout.

---

## 4. Security, Time & Utilities

### 🔑 Password Generator & Checker (`/password`)
A complete password security workspace.

- **Generator**: Configurable length and character sets (uppercase, lowercase, numbers, symbols) utilizing `crypto.getRandomValues`.
- **Strength Analyzer**: Evaluates password entropy, structural weaknesses, and checks against breached databases using WebAssembly.

### 🛡️ Crypto & UUID Utilities (`/crypto`)
Cryptographic hashing and unique identifier generators.

- **UUID Generator**: RFC 4122 compliant UUID v4 batch generator.
- **Hashing**: Instant calculation of SHA-1, SHA-256, SHA-512, and MD5 checksums.
- **AES Encryption**: Client-side symmetric encryption and decryption with custom passphrases.

### ⏰ Epoch & Time Converter (`/time`)
Comprehensive timestamp and timezone utility.

- **Conversion**: Two-way translation between Unix timestamps (seconds & milliseconds) and human-readable UTC/local times.
- **Live Clock**: Precision real-time digital clock with timezone offsets and epoch counters.

### 📦 Dummy File Generator (`/dummy`)
Generate mock files for upload limit testing and stress tests.

- **Custom Sizes**: Generate files ranging from 1 KB up to multiple gigabytes directly in browser memory.
- **Format Options**: Export as `.txt`, `.bin`, `.pdf`, `.jpg`, `.mp4`, or custom extensions.
