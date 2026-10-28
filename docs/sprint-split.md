# Sprint split of the backlog

How the backlog items ITM-201 to ITM-260 are cut into sprints for team daiy. It replaces the sprint numbers of the first drafting run, which followed the nine day-sprints of the [Implementation Plan](Implementation_Plan_EN.md) and did not respect `builds_on`. Agent M does not read this file: the sprints are set at **Plan sprint** on the dashboard, and the `## Priority` section of each item names its sprint here.

## Why a new cut

- An item's job starts when the items it builds on are merged, so the depth of `builds_on` (about 14 levels) sets the number of waves, not the plan's days.
- The model allows 4 items in progress (scrum-wip), and a sprint ends when its items are done, not on a date.
- Modules that two items change at once (for example `MOD-safety-enforcement` in ITM-201 and ITM-220) go one after the other.

## Sprints

| Sprint | Items | Goal |
|---|---|---|
| 1 | 205, 207, 208, 212 | Runs on our own AI access, Lovable removed |
| 2 | 215, 216, 209, 201 | Hazard pre-check in English and German; escalation names actions and the professional |
| 3 | 219, 220, 221, 230 | The pipeline checks before and after the AI; the dangerous case escalates |
| 4 | 217, 249, 210, 218 | Case domain subsystem works; device storage only on consent |
| 5 | 223, 224, 225, 253, 239 | Profile, inventory and history on the device; the privacy screen |
| 6 | 222, 231, 232, 250 | Step questions and legal notices; matching against own stock; AI access subsystem |
| 7 | 226, 234, 235, 236, 251 | A case runs as a session, step by step; every option shows its cost |
| 8 | 238, 241, 242, 243, 244 | The screens of a case |
| 9 or later | the other 21 items | After the cut decision below |

Sprint 9 or later holds: 202, 203, 204, 206, 211, 213, 214, 227, 228, 229, 233, 237, 240, 245, 246, 247, 248, 252, 254, 255 and the system items 256 to 260.

## Decisions before sprint 9

Must items build on Should and Could items, so the cut by priority needs edits to `builds_on`:

- **Accounts (FR-08):** ITM-248 builds on 240 and 233, and ITM-256 on 254. Without accounts, drop 214, 229, 233, 237, 240 and 254 and remove them from the `builds_on` of 248 and 256.
- **3D models (Could):** ITM-252 builds on 228. Without them, drop 211, 228 and 247 and remove 228 from 252.
- **Old review items:** ITM-204 follows ITM-221; ITM-202 and ITM-206 wait for the accounts decision.
- **Release:** ITM-260 assumes the EU Node host.

## Measure first

The cost per item is not known. After sprint 1, note the usage points and the time per item here, and set the cut from that.
