# Technology Stack

## Architecture

Static site generation (SSG) — all data fetched at build time, output is pure HTML/CSS with zero client-side JavaScript unless an Astro island explicitly requires it. Deploy artifact is a `dist/` directory pushed to GitHub Pages.

## Core Technologies

- **Language**: TypeScript (strict mode) in Astro frontmatter
- **Framework**: Astro 6 — component islands, file-based routing, static output
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` Vite plugin (not the deprecated `@astrojs/tailwind` integration)
- **Runtime**: Node.js 22 (matches CI)

## Key Libraries

- `@tailwindcss/vite` — Tailwind v4 integration; configured as a Vite plugin in `astro.config.*`
- GitHub REST API — data source for the project gallery (fetched in Astro frontmatter, not the browser)

## Development Standards

### Type Safety
TypeScript strict mode everywhere. All Astro frontmatter blocks use TypeScript. No `any`.

### Styling
Tailwind utility classes only. No hand-written CSS unless Tailwind genuinely cannot express it.

### Client-side JS
Default is zero JS. If interactivity is needed, use an Astro island (`client:load`, `client:visible`, etc.) and justify the addition explicitly.

### Environment Variables
- Server-only secrets (e.g. `GH_PAT`) are never exposed to the browser.
- Variables prefixed `PUBLIC_` are safe for browser use; all others are build-time only.

## Development Environment

### Required Tools
- Node.js 22, npm (lockfile-based installs via `npm ci`)
- VSCode devcontainer (`.devcontainer/`) — use this for a reproducible environment

### Common Commands
```bash
# Dev:   npm run dev
# Build: npm run build
# Preview: npm run preview
```

## Key Technical Decisions

- **Astro over Next.js/Remix**: No need for SSR; static output is simpler and fits GitHub Pages perfectly.
- **Tailwind v4 via Vite plugin**: The `@astrojs/tailwind` integration is deprecated; `@tailwindcss/vite` is the correct approach for Astro 6.
- **Build-time GitHub API fetch**: Keeps the PAT server-side, avoids CORS issues, and means no API rate limits at runtime.
- **`npm ci` in CI**: Lockfile-exact installs; `ignore-scripts=true` in `.npmrc` prevents postinstall surprises.
- **Security audit in CI**: `npm audit --audit-level=high --omit=dev` gates every deploy.

---
_Document standards and patterns, not every dependency_
