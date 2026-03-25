# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary
- **Feature**: `github-portfolio-landing-page`
- **Discovery Scope**: New Feature (greenfield — no `src/` directory exists yet)
- **Key Findings**:
  - Tailwind v4 dark mode is media-based by default (`prefers-color-scheme`) — no extra CSS config or JS needed; `dark:` variants work out of the box.
  - GitHub REST API `/users/{username}` returns `avatar_url`, `name`, and `bio` in a single call; repos endpoint returns `social_preview_image_url` for the OG card image.
  - All Astro frontmatter runs at build time; `fetch()` and `import.meta.env` are natively available, making a central `github.ts` utility module the cleanest data-fetching boundary.

---

## Research Log

### Tailwind v4 + Astro 6 integration
- **Context**: Confirm correct Vite plugin wiring and dark mode behavior before locking the design.
- **Sources Consulted**: tailwindcss.com/docs, Astro blog, community guides
- **Findings**:
  - Tailwind v4 is configured as a Vite plugin: `vite: { plugins: [tailwindcss()] }` inside `astro.config.mjs`.
  - The `darkMode` config key from v3 no longer exists in v4. Dark mode is always media-based by default.
  - Class-based toggle requires `@custom-variant dark (&:where(.dark, .dark *))` in CSS plus runtime JS — unnecessary here since requirements specify OS preference only.
- **Implications**: No Tailwind config file is required; global.css only needs `@import "tailwindcss"`. Dark mode requirement (6.4–6.5) is satisfied with zero extra configuration.

### GitHub REST API — user profile and repos
- **Context**: Confirm exact endpoint URLs, field availability, and authentication headers.
- **Sources Consulted**: docs.github.com/en/rest, GitHub API explorer
- **Findings**:
  - `GET /users/{username}` → returns `login`, `name`, `bio`, `avatar_url`, `html_url`, `blog`.
  - `GET /users/{username}/repos?sort=updated&per_page=100` → returns array with `name`, `description`, `language`, `html_url`, `fork`, `stargazers_count`, `social_preview_image_url`.
  - `social_preview_image_url` is present in the repos response but is `null` when no custom OG image has been set in the repo's GitHub settings. Falls back to a generated githubassets.com image URL is not automatically provided in the API.
  - Authentication header: `Authorization: Bearer <PAT>` (fine-grained PAT). `token <PAT>` is also accepted but deprecated.
  - Rate limit: 5,000 req/hour authenticated vs 60 req/hour unauthenticated.
- **Implications**: Repo cards must handle `null` for `description`, `language`, and `social_preview_image_url`. The gallery should filter out forks by default to keep the portfolio focused.

### Astro build-time data fetching
- **Context**: Understand the correct pattern for frontmatter fetch + env var access.
- **Sources Consulted**: docs.astro.build/en/guides/data-fetching, environment-variables docs
- **Findings**:
  - `fetch()` is globally available in Astro frontmatter (runs on the Node.js build process, not the browser).
  - Environment variables accessed via `import.meta.env.VARIABLE_NAME`. Non-`PUBLIC_` variables are stripped from the browser bundle.
  - Top-level `await` is supported in `.astro` frontmatter.
- **Implications**: A `src/utils/github.ts` module centralizes fetch logic and can be called with `await` from `index.astro`. No client-side fetch code needed.

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Inline frontmatter fetches | Fetch GitHub data directly inside `index.astro` | Simple, fewer files | Mixing data and presentation; harder to test | Acceptable for very small sites; doesn't scale |
| Central utility module (`github.ts`) | Typed fetch functions in `src/utils/`; called from `index.astro` | Separation of concerns, typed, testable | Slight extra file | Selected approach |
| External data file (`src/data/`)  | Pre-fetched JSON committed to repo | Zero API calls at build | Requires manual refresh; defeats "live data" goal | Rejected |

**Selected**: Central utility module. Matches steering principle "extract helpers to `src/utils/` if they grow beyond ~20 lines" and keeps `index.astro` frontmatter clean.

---

## Design Decisions

### Decision: Dark Mode Strategy
- **Context**: Requirements 6.4–6.5 mandate OS-preference-based dark mode without a manual toggle.
- **Alternatives Considered**:
  1. Class-based toggle (`dark` class on `<html>`) with localStorage JS — manual toggle, requires client JS.
  2. Media-based via Tailwind v4 default — automatic, zero JS.
- **Selected Approach**: Media-based (Tailwind v4 default). `dark:` variants automatically respond to `prefers-color-scheme: dark`.
- **Rationale**: Requirements explicitly do not require a manual toggle; zero JS is a core project constraint.
- **Trade-offs**: No user override beyond OS settings. Acceptable per requirements scope.
- **Follow-up**: If a toggle is added in a future spec, add `@custom-variant dark` CSS + a JS island.

### Decision: Repo Filtering
- **Context**: Requirements say "featured repositories" without defining a filter mechanism.
- **Alternatives Considered**:
  1. All public repos (no filter).
  2. Non-fork public repos sorted by last-updated (reasonable default).
  3. Topic/tag-filtered (e.g., `portfolio` topic) — requires GitHub topic API.
- **Selected Approach**: Fetch all public repos, filter out forks (`fork === false`), sort by `updated_at` descending, cap at a configurable limit (default 12).
- **Rationale**: Simple, no extra API calls, shows the owner's original work. The cap keeps the gallery scannable.
- **Trade-offs**: No manual curation. Owner can control gallery by archiving or changing repo visibility on GitHub.
- **Follow-up**: A future spec could add GitHub Topics filtering.

### Decision: Profile Data Source
- **Context**: Bio section needs name, summary, and profile picture (requirements 1.1–1.3).
- **Alternatives Considered**:
  1. Static content hardcoded in `Bio.astro`.
  2. GitHub API `/users/{username}` — name, bio, avatar_url, blog.
- **Selected Approach**: GitHub API. Same API call pattern as repos; keeps content automatically synced with the owner's GitHub profile.
- **Rationale**: Aligns with "no CMS to maintain" value proposition.
- **Trade-offs**: Bio is limited to GitHub's 255-character bio field. If richer content is needed, a future spec can add a static content layer.

### Decision: Social Preview Image
- **Context**: Requirement 2.3 — display thumbnail if available.
- **Alternatives Considered**:
  1. `social_preview_image_url` from repos API response.
  2. Construct URL from known githubassets.com pattern.
  3. Scrape OG tags from each repo's GitHub HTML page (expensive, fragile).
- **Selected Approach**: Use `social_preview_image_url` from REST API; fall back to no image (hide thumbnail slot) if `null`.
- **Rationale**: REST API is the authoritative source; zero extra HTTP requests.
- **Trade-offs**: Cards without a custom preview image will be text-only. Acceptable — not all repos have preview images.

---

## Risks & Mitigations
- **GitHub API unavailable at build time** — build fails with descriptive error (requirement 3.4 mandates this); CI will surface the failure.
- **`social_preview_image_url` always null** — UI degrades gracefully to text-only card; layout must not break.
- **Large repo count** — `per_page=100` is the GitHub API max; if owner has >100 public repos the client-side cap (12) still applies but the fetch retrieves up to 100.
- **Tailwind v4 `dark:` variant not compiling** — ensure `@import "tailwindcss"` is in `global.css` and the Vite plugin is wired correctly in `astro.config.mjs`.

## References
- [Tailwind CSS v4 installation with Astro](https://tailwindcss.com/docs/installation/framework-guides/astro)
- [Tailwind CSS v4 dark mode](https://tailwindcss.com/docs/dark-mode)
- [GitHub REST API — Users](https://docs.github.com/en/rest/users/users)
- [GitHub REST API — Repositories](https://docs.github.com/en/rest/repos/repos)
- [Astro data fetching](https://docs.astro.build/en/guides/data-fetching/)
- [Astro environment variables](https://docs.astro.build/en/guides/environment-variables/)
