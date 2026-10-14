<div align="center">

# Web Utils 🛠️

**A modern, high-performance, privacy-first developer utility suite running 100% in your browser.**

Instantly visualize code execution, design ER diagrams, edit media, format data, and convert files — with zero server uploads and zero configuration.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/Live_Site-webutils.site-emerald?style=flat-square&logo=google-chrome)](https://webutils.site)

[**Explore Live Demo**](https://webutils.site) • [**Documentation**](docs/README.md) • [**Report a Bug**](https://github.com/nishanth-kj/Web-Utils/issues) • [**Request a Feature**](https://github.com/nishanth-kj/Web-Utils/issues)

</div>

---

## 🌟 Highlights

- **🔒 100% Client-Side & Private** — All parsing, rendering, video recording, and media processing run locally in your browser. Nothing is ever uploaded to a remote server.
- **⚡ Next.js 16 & Turbopack** — Powered by the latest Next.js App Router with Turbopack for ultra-fast page transitions and pre-rendered static routes.
- **🧠 WebAssembly & In-Browser Runtimes** — Client-side Python execution tracing via Pyodide (WASM), sandboxed JavaScript AST execution, and WebAssembly-powered password security audits.
- **🎨 Sleek, Responsive Interface** — Carefully crafted with Tailwind CSS and Radix UI primitives, featuring full dark/light theme support.
- **🚀 Zero Setup** — Open [webutils.site](https://webutils.site) and start creating immediately.

---

## 🧰 The Tool Suite

### 💻 Code & Database Visualizers

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Code Visualizer** | [`/code-visualizer`](https://webutils.site/code-visualizer) | Step-by-step code debugger for **JavaScript** and **Python**. Highlights active lines, Call Stack frames, local variables, and interactive Heap Memory reference graphs. |
| **SQL Visualizer** | [`/sql-visualization`](https://webutils.site/sql-visualization) | Convert `CREATE TABLE` statements into interactive ER diagrams with foreign key relations, and render `SELECT` queries into visual execution pipelines. |
| **Code Editor** | [`/editor`](https://webutils.site/editor) | Professional Monaco-based code editor with multi-language syntax highlighting, formatting, and auto-save. |
| **Code Typing Video** | [`/code-video`](https://webutils.site/code-video) | Generate animated typing recordings from code snippets with custom syntax themes and export as high-fps MP4 videos or PNG snapshots. |

### 🎨 Creative & Media Tools

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Image Editor** | [`/image-editor`](https://webutils.site/image-editor) | In-browser image editing with freeform crop, aspect-ratio lock, resize, 90° rotation, flip, color adjustments (brightness, contrast, saturation, blur), and PNG/JPEG export. |
| **Video Editor** | [`/video-editor`](https://webutils.site/video-editor) | Browser-based video trimmer with interactive playhead scrubbing, visual filters, rotations, flips, and client-side WebM export. |
| **Quick Draw** | [`/draw`](https://webutils.site/draw) | Smooth freehand sketching canvas for rapid architectural diagrams, wireframes, and quick ideas. |

### 📄 Document Formats & Previewers

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Live Previewer** | [`/view`](https://webutils.site/view) | Unified viewer and editor supporting live preview and beautification for HTML5, Bootstrap 5.3, Markdown, JSON, YAML, XML, CSV, and SVG. |

### 🔐 Security, Time & Utilities

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Password Generator & Checker** | [`/password`](https://webutils.site/password) | Generate cryptographically secure passwords and check their strength against known breached datasets using WebAssembly. |
| **Crypto & UUID Generator** | [`/crypto`](https://webutils.site/crypto) | Generate UUID v4 identifiers, compute SHA/MD5 hashes, and perform AES text encryption/decryption. |
| **Epoch Converter** | [`/time`](https://webutils.site/time) | Convert between Unix timestamps and human-readable dates with timezone calculations and live time display. |
| **Dummy File Generator** | [`/dummy`](https://webutils.site/dummy) | Generate mock placeholder files of any size (KB, MB, GB) or extension for testing file upload limits and pipelines. |

---

## 🛠️ Tech Stack

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Tracing & Runtimes**: [Pyodide](https://pyodide.org/) (Python in WASM), [JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter), [@babel/standalone](https://babeljs.io/)
- **Diagrams & Graphs**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **State & Notifications**: [Zustand](https://zustand-demo.pmnd.rs/), [Sonner](https://sonner.emilkowal.ski/)
- **Theming**: [Next Themes](https://github.com/pacocoursey/next-themes)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nishanth-kj/Web-Utils.git
   cd Web-Utils
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the static export into `out/` (and pings IndexNow on Vercel production builds only) |
| `npm run start` | Serves the static export in `out/` locally |
| `npm run lint` | Runs ESLint to check for code quality and style issues |
| `npm run typecheck` | Type-checks the project with `tsc` |
| `npm test` | Runs the Vitest unit tests in `tests/unit` |
| `npm run test:e2e` | Runs Playwright smoke tests against `out/` (build first; run `npx playwright install chromium` once) |

### Repository notes

- `wasm/` is the Rust crate behind the password tools; its compiled output in `wasm/pkg/` is committed so the site builds without a Rust toolchain.

---

## 🤝 Contributing

Contributions are always welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for full details. Whether it's adding a new developer utility, improving documentation, or fixing a bug:

1. **Fork** the repository.
2. **Create a branch** for your feature or fix (`git checkout -b feature/amazing-tool` or `git checkout -b issues/<number>`).
3. **Commit** your changes following conventional commit syntax (`git commit -m "feat: add awesome new tool"`).
4. **Push** to your branch (`git push origin feature/amazing-tool`).
5. **Open a Pull Request** describing your changes.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
