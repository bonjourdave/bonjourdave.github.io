# bonjourdave.github.io

Personal portfolio site — bio, project gallery, and collaborations — built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to GitHub Pages. Developed using Spec-Driven Development (SDD) with Claude Code.

**Live site:** [bonjourdave.github.io](https://bonjourdave.github.io)

---

## Stack

| | |
|---|---|
| Framework | Astro 6 (static output, zero client JS) |
| Styling | Tailwind CSS v4 |
| Data | GitHub GraphQL API (build-time fetch) |
| Deployment | GitHub Pages via GitHub Actions |
| Dev environment | VSCode devcontainer + Claude Code |

## Local development

```bash
cp .env.example .env   # fill in GH_PAT and PUBLIC_GITHUB_USERNAME
npm install
npm run dev            # → http://localhost:4321
```

## Deployment

Pushes to `main` trigger the GitHub Actions workflow which builds the Astro site and deploys to GitHub Pages automatically. The workflow requires `GH_PAT` and `PUBLIC_GITHUB_USERNAME` set as repository secrets.

## Docs

- [docs/SETUP.md](docs/SETUP.md) — full first-time setup guide (devcontainer, PAT, gh CLI, SDD workflow)
