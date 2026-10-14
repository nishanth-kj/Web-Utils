# Deployment & Build Guide 🚀

This document details the build pipeline, static site generation, SEO tooling, and hosting deployment process for **Web Utils**.

---

## 🏗️ Production Build Pipeline

Web Utils is designed to compile into an optimized production build that can be hosted on any modern static hosting provider or CDN edge network.

### Build Command

```bash
npm run build
```

Under the hood, `npm run build` runs two sequential tasks:
1. `next build`: Invokes Next.js with Turbopack, performing TypeScript verification, bundling, tree-shaking, CSS minification, and static route pre-rendering (`/`, `/view`, `/code-visualizer`, `/sql-visualization`, `/image-editor`, etc.).
2. `node scripts/submit-indexnow.js`: Detects generated routes from `app/sitemap.ts`, constructs an IndexNow API submission payload, and notifies participating search engines (Bing, Yandex, Seznam) of newly published URLs.

---

## 🌐 Hosting on Vercel

Web Utils is pre-configured for zero-configuration deployment on **Vercel**:

1. **Connect Repository**: Import the `nishanth-kj/Web-Utils` repository in the Vercel dashboard.
2. **Framework Preset**: Select **Next.js**.
3. **Node.js Version**: Ensure Node.js **20.x** is selected in Project Settings.
4. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next` (or `out` if fully static)
   - Install Command: `npm install`
5. **Environment Variables**:
   - `INDEXNOW_KEY`: (Optional) Custom API key for the IndexNow ping service. Defaults to the generated key if not specified.

---

## 🔍 SEO & Metadata Architecture

### 1. Dynamic Sitemap (`app/sitemap.ts`)

- Automatically enumerates all tool routes, document format viewer routes, and documentation pages.
- Sets appropriate `changeFrequency` (`weekly` for high-traffic tools, `monthly` for informational pages) and priority weights.

### 2. Speculation Rules & Fast Navigation

- Integrated in `app/layout.tsx` using the native browser Speculation Rules API.
- Automatically prerenders and prefetches adjacent tool pages on mouse hover or viewport idle, providing instant transitions.

### 3. OpenGraph & JSON-LD

- Every major tool route includes a custom `layout.tsx` providing OpenGraph cards and `SoftwareApplication` JSON-LD structured data for rich search engine indexing.

---

## 🧪 Testing Production Builds Locally

To inspect the optimized production output locally before deployment:

```bash
# 1. Compile the build
npm run build

# 2. Serve the build locally
npm run start
```
By default, the server will be accessible at [http://localhost:3000](http://localhost:3000).
