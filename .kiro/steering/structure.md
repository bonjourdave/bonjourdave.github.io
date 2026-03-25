# Project Structure

## Organization Philosophy

Feature-layer separation: pages own routing, components own presentation, layouts own chrome. Data fetching lives exclusively in Astro frontmatter (pages or components that need it), never in separate data files or client scripts.

## Directory Patterns

### Pages
**Location**: `src/pages/`
**Purpose**: Astro pages — each file becomes a route. `index.astro` is the single entry point for this single-page portfolio.
**Example**: `src/pages/index.astro` — imports Bio, Gallery, and wraps them in the base layout.

### Components
**Location**: `src/components/`
**Purpose**: Reusable, self-contained Astro components. Each component owns its own markup and scoped styles (via Tailwind utilities).
**Example**: `ProjectCard.astro`, `Gallery.astro`, `Bio.astro`

### Layouts
**Location**: `src/layouts/`
**Purpose**: Page-level shell components — `<html>`, `<head>`, global meta, nav/footer if any.
**Example**: `BaseLayout.astro` wraps every page with the HTML skeleton.

### Styles
**Location**: `src/styles/`
**Purpose**: Global CSS entry point and any Tailwind config overrides that can't be expressed as utilities.
**Example**: `global.css` — imports Tailwind base layers.

### Static Assets
**Location**: `public/`
**Purpose**: Files served verbatim (favicon, OG image, fonts). Not processed by Vite.

## Naming Conventions

- **Component files**: PascalCase (e.g. `ProjectCard.astro`, `BaseLayout.astro`)
- **Page files**: kebab-case or `index.astro` (Astro convention)
- **Style files**: kebab-case (e.g. `global.css`)
- **TypeScript interfaces**: PascalCase, defined inline in the `.astro` frontmatter that uses them unless shared across multiple files

## Import Organization

```typescript
---
// 1. Framework/library imports
import type { GetStaticProps } from 'astro'

// 2. Layout
import BaseLayout from '../layouts/BaseLayout.astro'

// 3. Components
import Bio from '../components/Bio.astro'
import Gallery from '../components/Gallery.astro'
---
```

Prefer relative imports within `src/`. No path aliases are configured by default; add `@/` → `src/` in `tsconfig.json` if the tree grows deep enough to warrant it.

## Code Organization Principles

- One concern per component file — no "god components" that fetch data AND render complex UI.
- Data fetching in the topmost component that needs it; pass props down.
- Keep frontmatter logic minimal — extract helpers to `src/utils/` if they grow beyond ~20 lines.
- Specs live in `.kiro/specs/<spec-name>/`; steering lives in `.kiro/steering/`.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
