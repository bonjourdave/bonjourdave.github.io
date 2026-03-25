# Portfolio — Spec Driven Dev Environment

Personal portfolio landing page built with Astro + Tailwind, deployed to GitHub Pages at `username.github.io`.
Developed using Claude Code inside a VSCode devcontainer with spec-driven development (SDD).

---

## First-time setup checklist

Work through these steps **once**, in order. After this, opening the project in VSCode
is all you need.

---

### Step 1 — Host prerequisites

You need these on your Linux host machine (not inside the container):

```bash
# Docker — required to run the devcontainer
# Follow https://docs.docker.com/engine/install/ for your distro
docker --version   # verify

# VSCode — with the Dev Containers extension
# Extension ID: ms-vscode-remote.remote-containers
code --install-extension ms-vscode-remote.remote-containers
```

---

### Step 2 — Prepare your Claude credentials on the host

Claude Code uses OAuth (browser login) — no API key needed with a Pro subscription.
The credentials are stored on your host and bind-mounted into the container so you
**never have to log in again** after container rebuilds.

```bash
# Create the two auth locations Claude Code uses (if they don't already exist)
mkdir -p ~/.claude
touch ~/.claude.json
chmod 600 ~/.claude.json

# If you've already used Claude Code locally, these already exist — you're done.
# If not, you'll complete login inside the container in Step 6.
```

---

### Step 3 — Create your GitHub fine-grained PAT

Fine-grained PATs scope access to a single repo, so a leaked token can't touch anything else.

1. Go to **https://github.com/settings/tokens?type=beta** → "Generate new token"
2. Give it a name e.g. `portfolio-dev`
3. **Repository access** → "Only select repositories" → pick this repo
4. **Permissions** — set these, leave everything else at "No access":
   - Contents: **Read and write** (push/pull code)
   - Issues: **Read and write** (Claude Code can create issues from specs)
   - Pull requests: **Read and write** (Claude Code can open PRs)
   - Workflows: **Read and write** (CI deploy workflow)
   - Metadata: **Read** (auto-selected, required)
5. Click "Generate token" — the token starts with `github_pat_`

Add it to your host shell (put this in `~/.bashrc` or `~/.zshrc`):

```bash
export GITHUB_PAT=github_pat_your_token_here
export PUBLIC_GITHUB_USERNAME=your_github_username
```

Reload your shell: `source ~/.zshrc`

---

### Step 4 — Clone this repo and create your `.env`

```bash
git clone <your-repo-url>
cd <repo-name>

cp .env.example .env
# Edit .env and fill in GITHUB_PAT and PUBLIC_GITHUB_USERNAME
```

---

### Step 5 — Open in VSCode and start the devcontainer

```bash
code .
```

VSCode will detect `.devcontainer/devcontainer.json` and show a popup:
**"Reopen in Container"** — click it.

The first build takes 2–4 minutes. It will:
- Pull the Node 22 base image
- Install Claude Code via the Anthropic devcontainer feature
- Install the `gh` CLI
- Install all VSCode extensions
- Run `npx cc-sdd@latest --claude` to install the Kiro SDD slash commands

Subsequent opens are instant (container is cached).

---

### Step 6 — Authenticate Claude Code (first time only)

Inside the container terminal:

```bash
claude
# Follow the browser login prompt
# Sign in with your Claude.ai Pro account
# The browser will say "you're all set" — the CLI picks up the token
```

Your credentials are now saved to `~/.claude` on the **host** (via the bind mount),
so this step never repeats across rebuilds.

Verify everything is working:

```bash
# Check Claude Code version and auth status
claude --version
# Inside a Claude Code session, type:
/status        # shows auth method (should say "OAuth subscription")
/mcp           # shows MCP server status (GitHub should show ✓ Connected)
```

---

### Step 7 — Set git identity inside the container

No `.gitconfig` is mounted from the host — identity is set once per repo inside the container.
`--local` writes to `.git/config` which is part of the repo, so it persists across container
rebuilds without touching anything on the host.

```bash
git config --local user.name "Your Name"
git config --local user.email "you@example.com"
```

### Step 8 — Authenticate the gh CLI

```bash
gh auth login
# Choose: GitHub.com → HTTPS → paste your PAT when prompted
# Or: GitHub.com → SSH → follow the key setup flow
```

---

### Step 9 — Bootstrap the Astro project (first time only)

The repo already has files in it so the Astro create wizard will not work. Install manually instead:

```bash
npm init -y
npm install astro @tailwindcss/vite tailwindcss
```

The minimal config files (`astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`) are
created by Claude Code as the first task in the SDD workflow — not here.

---

### Step 10 — Start your first SDD session

Open Claude Code:

```bash
claude
```

Then run the steering setup (once per project):

```
/kiro:steering
```

This generates `.claude/steering/product.md`, `tech.md`, and `structure.md`.
Fill in the product context, then kick off your first feature spec:

```
/kiro:spec-init "GitHub portfolio landing page"
```

Follow the Requirements → Design → Tasks → Implementation cycle.
**Approve each phase doc before proceeding.**

---

## Daily workflow

```bash
# Open VSCode (container starts automatically if Docker is running)
code .

# Inside container terminal — start Claude Code
claude

# Astro dev server (separate terminal tab)
npm run dev   # → http://localhost:4321 on your host browser

# Note: the dev script must include --host (astro dev --host) in package.json.
# Without it the server binds to 127.0.0.1 inside the container only and the
# connection hangs — VSCode port forwarding requires 0.0.0.0 to reach it.
# If not yet in package.json, use: npm run dev -- --host
# (the -- separator tells npm to pass --host to astro, not to npm itself)
```

---

## Deployment setup (one time)

### Name your repo correctly

For the clean `username.github.io` URL with no subdirectory, your GitHub repo **must be named
exactly `<your-username>.github.io`**. Create it at https://github.com/new with that name.
This means no `base` path config is needed in `astro.config.mjs`.

### Enable GitHub Pages

In your repo: **Settings → Pages → Source → GitHub Actions**

That's it — no Cloudflare account, no extra services.

### GitHub Actions secrets

The deploy workflow needs these two secrets to build the site.
**Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `GITHUB_PAT` | Your fine-grained PAT (the `github_pat_` token) |
| `PUBLIC_GITHUB_USERNAME` | Your GitHub username |

On every push to `main`, the workflow builds the Astro site and deploys it.
Your live URL: **`https://<your-username>.github.io`**

---

## Troubleshooting

**Claude Code asks me to log in every rebuild**
→ Check that both `~/.claude` (directory) and `~/.claude.json` (file) exist on the host
  and are readable. The file is the onboarding flag — without it the wizard re-runs.

**GitHub MCP shows "not connected" in `/mcp`**
→ Verify `GITHUB_PAT` is set in your host shell and was set *before* opening VSCode.
  Run `echo $GITHUB_PAT` inside the container to confirm it's been injected.
  If empty, close VSCode, `export GITHUB_PAT=...` in your terminal, then reopen.

**Astro build fails with "GITHUB_PAT not set"**
→ Add the variable to your `.env` file (for local builds) and to the repo's
  Actions secrets (for CI builds): Settings → Secrets and variables → Actions.

**`postCreateCommand` cc-sdd install failed**
→ Run manually inside the container:
  `npx cc-sdd@latest --claude --lang en --yes`

**Port 4321 not forwarding**
→ VSCode should auto-forward it. If not: Command Palette →
  "Forward a Port" → 4321.
