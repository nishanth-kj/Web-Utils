# Contributing to Web Utils 🤝

Thank you for your interest in contributing to **Web Utils**! We welcome bug fixes, documentation improvements, new developer utilities, and performance enhancements.

---

## 📋 Code of Conduct

Please help maintain a welcoming, respectful, and inclusive community for all contributors.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: Version 20.x or higher
- **Package Manager**: `npm` (recommended), `pnpm`, or `yarn`
- **Git**: Installed and configured

### 2. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Web-Utils.git
cd Web-Utils

# Add upstream remote
git remote add upstream https://github.com/nishanth-kj/Web-Utils.git
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application with hot reloading.

---

## 🌿 Branching Strategy

To keep repository history clean and traceable:
- If working on a GitHub issue, name your branch: `issues/<number>` (e.g. `issues/44`)
- For new features without an issue: `feature/<feature-name>`
- For bug fixes: `fix/<bug-name>`
- For documentation updates: `docs/<topic>`

Always create your working branch from the latest `main`:
```bash
git checkout main
git pull upstream main
git checkout -b issues/123
```

---

## 📐 Coding Standards & Guidelines

### Architecture & Folder Placement
- **Routes**: Add pages under `app/<route-name>/page.tsx` and `app/<route-name>/layout.tsx`.
- **Feature Components**: Place reusable components under `components/<feature-name>/` (e.g., `components/image-editor/`).
- **Shared Components**: Shared UI elements go in `components/shared/` or `components/ui/`.
- **Pure Functions & Algorithmic Logic**: Place utilities in `lib/<feature-name>/`.
- **Tool Registry**: When adding a new utility, register it in `lib/constants/tools.ts`, `app/sitemap.ts`, and `app/layout.tsx`.

### Code Style
- **TypeScript**: Strive for explicit typing; avoid `any`.
- **Client Components**: Mark interactive client-only components with `"use client"` at the very top.
- **Client-Side Privacy**: Never transmit user inputs or uploaded files across the network. All processing must execute locally in the browser.

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` Adds a new user-facing feature or tool (e.g. `feat(video-editor): add trimming support`)
- `fix:` Fixes a bug (e.g. `fix(preview): resolve SVG canvas scaling bug`)
- `docs:` Documentation-only changes (e.g. `docs: update setup instructions in README`)
- `refactor:` Code improvements that do not alter behavior
- `perf:` Performance optimizations
- `style:` Formatting or UI styling adjustments

---

## 🧪 Verification Before Committing

Before creating a commit or opening a Pull Request, ensure your changes pass all checks:

```bash
# 1. Run ESLint
npm run lint

# 2. Verify Next.js production build and type checking
npm run build
```

---

## 🚀 Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push -u origin issues/123
   ```
2. Open a Pull Request targeting `main`.
3. In your PR description, describe the changes made and reference any relevant issue:
   ```markdown
   ## Description
   Brief summary of changes.

   Fixes #123
   ```
4. PRs are reviewed and merged using **Squash and Merge** to maintain a clean git history.
