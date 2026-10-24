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

The AI calls need the environment variable `LOVABLE_API_KEY` (Lovable AI gateway, see `src/lib/ai.server.ts`). Replacing the gateway with our own model access is an architecture decision for sprint 0.

## Where things are

| Path                          | Content                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/routes/index.tsx`        | The single page: intake, then result                                                                 |
| `src/components/repair/`      | `Intake.tsx` (problem, photo, skill, inventory), `Result.tsx` (guide, offers, escalation, step help) |
| `src/lib/repair.schema.ts`    | Output schema, hazard pre-check `detectHazards`, output check `enforceSafety`                        |
| `src/lib/repair.functions.ts` | Server functions and the versioned prompt (`PROMPT_VERSION`)                                         |
| `src/lib/ai.server.ts`        | The only place that calls the AI gateway                                                             |
| `src/lib/offers.ts`           | Sample offers (no live retailer data)                                                                |
| `src/lib/profiles.ts`         | Skill level and inventory, stored in the browser only                                                |
| `src/test/`                   | Unit tests, including `safety.test.ts`                                                               |
| `src/components/ui/`          | Generated UI component library (shadcn/ui)                                                           |

What the prototype covers and what is still missing for the MVP: [Implementation plan, "Starting point"](../docs/Implementation_Plan_EN.md#starting-point-the-prototype).
