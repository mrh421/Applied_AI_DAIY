---
nightly: 02:00
command: node prototype/scripts/agent-m-tests.mjs
setup: npm install -g bun && cd prototype && bun install --frozen-lockfile && node node_modules/@playwright/test/cli.js install --with-deps chromium
---
## Levels

| Row | every commit | pull request | nightly | release candidate | on demand | runs on |
|---|---|---|---|---|---|---|
| unit | — | — | ✓ | ✓ | ✓ | — |
| component | — | — | ✓ | ✓ | ✓ | — |
| system | — | — | ✓ | ✓ | ✓ | — |
| paid | — | — | ✓ | ✓ | ✓ | — |
| release | — | — | — | ✓ | ✓ | — |
| user | — | — | — | ✓ | ✓ | — |
