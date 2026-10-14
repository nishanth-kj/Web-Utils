# System Architecture 🏛️

This document outlines the architectural patterns, runtime execution models, and technology decisions behind **Web Utils**.

---

## 🎯 Architecture Philosophy

Traditional web utility sites often rely on server-side processing, introducing network latency, security risks, and potential data leakage. Web Utils operates on a strictly **client-first paradigm**:

```
[ User Browser ]
  ├── Static Assets & JS Chunks (Next.js 16 / Turbopack)
  ├── Sandboxed Execution Engine
  │     ├── Pyodide (Python in WebAssembly)
  │     ├── JS-Interpreter (Sandboxed AST interpreter)
  │     └── sql-wasm (SQLite WASM)
  ├── Rendering & Graphics Subsystem
  │     ├── React Flow (@xyflow/react for ER diagrams & Call Stack)
  │     ├── HTML5 Canvas 2D Context (Image, Video & Draw)
  │     └── MediaRecorder API (WebM/MP4 exports)
  └── Cryptography Engine (Native Web Crypto API)
```

No code, database schemas, uploaded images, or credentials ever leave the client machine.

---

## 🧩 Technology Stack Breakdown

### 1. Framework & Application Layer
- **Next.js 16 (App Router)**: Utilizing React Server Components for static shells, layout metadata, and JSON-LD structured data, while scoping interactivity to `"use client"` feature boundaries.
- **Turbopack**: Fast local development compilation and optimized static site generation (`output: "export"` capable).
- **TypeScript**: Strict type enforcement across all tool registries, AST data structures, and canvas pipeline options.

### 2. UI & Interaction Layer
- **Tailwind CSS**: Utility-first responsive styling with custom CSS variables for theme switching.
- **Radix UI Primitives**: Accessible dialogs, dropdowns, sliders, tabs, tooltips, and popovers.
- **Lucide Icons**: Standardized, lightweight iconography.
- **Next Themes**: Zero-flash dark and light theme switching stored in `localStorage`.
- **Sonner**: Toast notification system.

### 3. Editor & Execution Runtimes
- **Monaco Editor (`@monaco-editor/react`)**: The editor behind Visual Studio Code, loaded dynamically to minimize initial bundle size. Provides syntax highlighting, bracket matching, and formatting shortcuts.
- **Pyodide**: Full CPython runtime compiled to WebAssembly. Executes Python code in-browser and leverages `sys.settrace` to record step-by-step frame transitions and heap object states.
- **JS-Interpreter**: Isolated JavaScript interpreter written in JavaScript. Walks code AST nodes step-by-step to capture scope changes and variable states without `eval()` security risks.
- **React Flow (`@xyflow/react`)**: Node-based graph canvas used for dynamic ER diagram visualization and heap memory pointers.

### 4. Media Processing Layer
- **HTML5 Canvas 2D**: Performs pixel-level manipulation, image filters (brightness, contrast, saturation, grayscale), freeform crops, and rotations.
- **MediaRecorder API**: Captures canvas animation streams to encode in-browser WebM and MP4 video recordings.

---

## 🗂️ Project Directory Structure

```
Web-Utils/
├── app/                        # Next.js App Router routes & metadata
│   ├── code-visualizer/        # /code-visualizer route
│   ├── sql-visualization/      # /sql-visualization route
│   ├── code-video/             # /code-video route
│   ├── image-editor/           # /image-editor route
│   ├── video-editor/           # /video-editor route
│   ├── view/                   # /view route & format subpaths
│   ├── editor/                 # /editor route
│   ├── draw/                   # /draw canvas route
│   ├── crypto/                 # /crypto cryptographic tools
│   ├── password/               # /password strength & generator
│   ├── time/                   # /time epoch converter
│   ├── dummy/                  # /dummy mock file generator
│   ├── layout.tsx              # Root HTML shell & Speculation rules
│   └── sitemap.ts              # Automated dynamic XML sitemap
├── components/                 # Feature-scoped & shared UI components
│   ├── code-visualizer/        # Stack frame nodes, heap nodes, canvas
│   ├── sql-visualization/      # ER diagram view, query flow, schema tabs
│   ├── image-editor/           # Crop overlays, filters, canvas ops
│   ├── video-editor/           # Trimming scrubber, canvas exporter
│   ├── shared/                 # ToolPageShell, resizable panes
│   └── ui/                     # Radix & Tailwind UI primitives
├── lib/                        # Core algorithmic libraries & constants
│   ├── code-visualizer/        # JS/Python tracers and layout engines
│   ├── constants/              # Tool registry (tools.ts) & navigation
│   └── formats.ts              # Supported document format definitions
├── docs/                       # Comprehensive documentation
├── public/                     # Static assets, wasm files, ads.txt
└── scripts/                    # Build-time scripts (IndexNow, OG generation)
```

---

## 🚀 Performance Optimizations

1. **Dynamic Code Splitting**: Heavy dependencies such as Monaco Editor, Pyodide WASM, and Prettier formatters are loaded on-demand only when their respective tool is accessed.
2. **Speculation Rules API**: The root layout configures native browser prerendering and prefetching for instant page transitions.
3. **Canvas Offscreen Operations**: Image transformations and video trimming operate on in-memory `HTMLCanvasElement` buffers before flushing to the DOM.
