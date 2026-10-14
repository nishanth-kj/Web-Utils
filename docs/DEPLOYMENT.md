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
1. `next build`: Invokes Next.js with Turbopack, performing TypeScript verification, bundling, tree-shaking, CSS minification, and static route pre-rendering (`/`, `/view`, `/code-visualizer`, `/sql-visualization`, `/image-editor`, etc.) into `out/`.
2. `node scripts/submit-indexnow.js`: On Vercel **production** builds only (`VERCEL_ENV=production`), submits the URLs in `out/sitemap.xml` to IndexNow (Bing, Yandex, Seznam). Local and preview builds skip it. It never fails the build.

### IndexNow key

Search engines verify submissions by fetching `https://webutils.site/<key>.txt`, so the key must be the same on every deploy. The key file is committed as `public/04a5ce9d20f4475e920fdc8b6a471ca5.txt` and the script picks it up automatically. Setting `INDEXNOW_KEY` overrides it (the script then writes the matching file into `out/`).

---

## 🌐 Hosting on Vercel

Web Utils is pre-configured for zero-configuration deployment on **Vercel**:

1. **Connect Repository**: Import the `nishanth-kj/Web-Utils` repository in the Vercel dashboard.
2. **Framework Preset**: Select **Next.js**.
3. **Node.js Version**: Select Node.js **22.x** (Node 20 is end-of-life; CI runs on 22).
4. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `out` (the app uses `output: 'export'`)
   - Install Command: `npm install`
5. **Environment Variables**:
   - `INDEXNOW_KEY`: (Optional) Overrides the committed IndexNow key. Leave unset to use `public/<key>.txt`.

### Security headers

`vercel.json` adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` / `frame-ancestors 'self'` (prevents clickjacking) and a `Permissions-Policy` that disables camera, microphone and geolocation. HTML and SVG previews are isolated in the browser (opaque-origin sandboxed iframes and `<img>` rendering), so they don't depend on these headers.

### Ads and consent

- AdSense and Google Tag Manager load only after a visitor accepts the cookie banner (`components/common/ConsentGate.tsx`). Visitors can change their choice from **Cookie settings** in the footer.
- Explicit ad placements use `components/ads/AdSlot.tsx` (labelled, reserved height). It is currently placed below the tool list on the homepage, never next to tool controls. Pass a different `slot` to use a dedicated AdSense unit for a placement.
- For visitors in the EEA, UK and Switzerland, Google requires a Google-certified consent management platform (CMP) for personalized ads. The simplest option is AdSense's own **Privacy & messaging → European regulations** message; if you enable it, review whether the custom banner should still show in those regions.

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

# 3. Optional: smoke-test every sitemap URL on desktop and mobile
npm run test:e2e
```
By default, the server will be accessible at [http://localhost:3000](http://localhost:3000).
