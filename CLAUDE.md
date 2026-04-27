# CLAUDE.md — Project Constitution

This file is the source of truth for Claude Code across all sessions.
Read this at the start of every session. Update it when architectural decisions are made.

---

## Project

**What we're building:** A personal portfolio landing page — brief background/bio section plus a
gallery of GitHub projects with short descriptions and links to the actual repos.

**Primary audience:** Anyone landing on the site from a GitHub profile, CV, or link share.

**Stack:**

- Framework: Astro (static output, zero JS by default)
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` Vite plugin (not the deprecated `@astrojs/tailwind` integration)
- Data source: GitHub REST API (fetched at build time via `GH_PAT`)
- Deployment: GitHub Pages at `username.github.io` (auto-deploys on push to `main`)

**Repo layout:**

```
src/
  pages/       — Astro pages (index.astro is the single-page entry point)
  components/  — Reusable Astro components (ProjectCard, Gallery, Bio, etc.)
  layouts/     — Base layout(s)
  styles/      — Global CSS / Tailwind config overrides
public/        — Static assets (images, favicon)
.devcontainer/ — Dev environment config (do not modify unless environment changes)
.claude/       — Claude Code config, slash commands, steering docs, specs
.github/
  workflows/
    deploy.yml — GitHub Pages deploy workflow
```

---

## Development approach: Spec-Driven Development (SDD)

We follow the Kiro-style SDD workflow via cc-sdd. **Do not write implementation code before
a spec is approved.**

### Workflow phases (in order)

1. **Steering** — run `/kiro:steering` once per project to generate steering docs
2. **Spec init** — run `/kiro:spec-init "<feature>"` to describe what to build
3. **Requirements** — run `/kiro:spec-requirements <spec-name>` to generate requirements doc
4. **Design** — run `/kiro:spec-design <spec-name>` to generate technical design doc
5. **Tasks** — run `/kiro:spec-tasks <spec-name>` to break design into atomic tasks
6. **Implementation** — run `/kiro:spec-impl <spec-name>`

All spec files land in `.claude/specs/<spec-name>/`. Review and edit each phase
document before proceeding to the next. The spec is the contract — running the next
phase command signals approval of the current one.

### Branching and commits

Always implement on a feature branch, never directly on `main`:

```bash
git checkout -b feat/<spec-name>
# implement, commit per task
git checkout main
git merge feat/<spec-name>
git push  # triggers GitHub Pages deploy
```

**Commit after every completed task** — before moving to the next task, commit using
the repo's commit template (never use `git commit -m` as it bypasses the template):

```bash
git commit
```

The editor will open with the template pre-filled. Use this exact format:

```
task: <task-name>

- <what changed and why, one bullet per logical subtask>
- <keep each bullet concise — one line>

Co-authored-by: Claude <claude@anthropic.com>
```

No prose paragraphs in the body — bullet points only. Leave a blank line between the
subject and the bullets, and another blank line before the trailer. Every commit must
include the co-author trailer. If the build is broken, fix it before committing.
Do not batch multiple tasks into one commit.

### Ground rules for Claude Code

- **Plan first.** Use `Shift+Tab` (Plan Mode) before any non-trivial implementation.
- **Commit after every task.** Use `git commit` (not `-m`) to preserve the co-author template. No exceptions.
- **Never break the build.** Run `npm run build` to verify before committing.
- **Subagents for parallel tasks only.** Only spawn subagents for tasks with no dependency
  on each other. Sequential tasks must run in order. Check the spec-tasks doc for dependencies
  before deciding.
- **Ask before deleting.** Destructive operations require explicit user confirmation.
- **Keep CLAUDE.md current.** When a decision changes the architecture, update this file.

---

## Coding conventions

- TypeScript strict mode — all `.astro` files use frontmatter TypeScript
- Tailwind utility classes only — no custom CSS unless Tailwind can't do it
- No client-side JS unless explicitly needed (Astro islands pattern if required)
- Fetch GitHub data in Astro frontmatter at build time — not in the browser
- Environment variables prefixed `PUBLIC_` if needed in the browser; never expose the PAT

---

## Environment variables

| Variable                 | Where set                            | Purpose                                                                              |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `GH_PAT`                 | Host shell / `.env` / Actions secret | Fine-grained PAT (this repo only): GitHub API access for MCP + build-time repo fetch |
| `PUBLIC_GITHUB_USERNAME` | `.env`                               | Your GitHub username (used in Astro data fetching)                                   |

`.env` is gitignored. See `.env.example` for the template.

---

## MCP servers available

- **github** — Full repo access (issues, PRs, branches, contents). Use this for:
  creating issues from spec tasks, opening PRs, inspecting repo state.
  Verify connection with `/mcp` inside Claude Code.
- **gh CLI** is installed and authenticated. Use `gh auth setup-git` for git
  credentials. Do not configure manual credential helpers with GH_PAT.

---

## Deployment

GitHub Pages auto-deploys on push to `main` via the `withastro/action` workflow.
Build command: `npm run build`. Output directory: `dist`.

Repo must be named `<username>.github.io` for the clean root URL.
GitHub Pages source must be set to "GitHub Actions" in repo Settings → Pages.

`GH_PAT` and `PUBLIC_GITHUB_USERNAME` must be set as Actions secrets in the repo
(Settings → Secrets and variables → Actions) for the build to succeed.

---

## Steering documents

Detailed context lives in `.claude/steering/`:

- `product.md` — what the product is and who it's for (fill this in early)
- `tech.md` — technology decisions and constraints
- `structure.md` — file/folder conventions and component inventory

Generate these with `/kiro:steering` on first session.
