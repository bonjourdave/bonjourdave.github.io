# Minimal Node.js base — Claude Code and Astro toolchain only.
# Language-specific deps (Python, etc.) get added here only if the project needs them.
FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Persist shell history across container rebuilds
RUN mkdir -p /commandhistory \
    && touch /commandhistory/.bash_history \
    && touch /commandhistory/.zsh_history \
    && chown -R node /commandhistory \
    && echo 'export HISTFILE=/commandhistory/.zsh_history' >> /home/node/.zshrc

# Pre-create Claude config dirs so bind mounts land with correct ownership
RUN mkdir -p /home/node/.claude \
    && chown -R node:node /home/node/.claude

# Nothing else — Claude Code and gh CLI are installed via devcontainer features below.
