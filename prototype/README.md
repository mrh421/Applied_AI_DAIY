# D.AI.Y · Prototype

Clickable prototype of the D.AI.Y repair assistant: describe a problem (text or photo), answer follow-up questions, get a checked repair guide with materials, sample offers and safety escalation.

It was generated with [Lovable](https://lovable.dev) in the repository `vegas1337/d.ai.y` and imported here on 2026-10-24. **From now on it is developed only in this repository**, through the process in [`docs/Implementation_Plan_EN.md`](../docs/Implementation_Plan_EN.md). The Lovable project and `vegas1337/d.ai.y` are frozen and no longer edited.

## Run it locally

Needs [Bun](https://bun.sh) (the lockfile is `bun.lock`) or Node.js with npm.

```sh
cd prototype
bun install        # or: npm install
bun run dev        # or: npm run dev
bun run test       # unit tests (vitest)
```

The AI calls need the environment variables `AI_PROVIDER_API_KEY` and `AI_MODEL`, and optionally `AI_TIMEOUT_MS` and `AI_BASE_URL` (see `src/ai-gateway/`).

## Where things are

| Path                         | Content                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/app-shell/`             | Routes (`routes/`), router, server and start entries, layout with navigation and back, styles  |
| `src/case-screens/`          | Case input, questions, outcome, work step by step                                              |
| `src/materials-screens/`     | Materials, offers, budget, deduction                                                           |
| `src/data-screens/`          | Profile, inventory, history                                                                    |
| `src/ui-kit/`                | The accessible building blocks of every screen                                                 |
| `src/case-pipeline/`, `ai-*` | The server functions of the AI steps, the gateway and the tasks                                |
| `src/catalogue/`, `data/`    | Sample products, offers and 3D models (no live retailer data), the link check in `link-check/` |
| `src/*/`                     | One folder per module of `docs/architecture/`; a module is used through its `index.ts` only    |
| `src/test/`                  | Tests across modules                                                                           |

The screens keep all user data in the browser (localStorage, IndexedDB), so the pages render in the browser; the server sends the document shell and runs the server functions.

What the prototype covers and what is still missing for the MVP: [Implementation plan, "Starting point"](../docs/Implementation_Plan_EN.md#starting-point-the-prototype).
