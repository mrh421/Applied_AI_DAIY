---
id: ARC-011
title: The assessment never sees the skill profile
refines: ARC-001
forced_by:
  - SAFETY-CONTENT-PROFILE-INDEPENDENT
  - SKILL-DOES-NOT-UNLOCK
  - INPUT-USES-PROFILE
  - INPUT-USES-INVENTORY
  - DETAIL-FOLLOWS-PROFILE
  - BASICS-EXPANDABLE
  - DEFAULT-BEGINNER
  - STEP-RE-EXPLAIN
  - RESPONSE-TIME
  - UC-001
  - UC-003
  - UC-004
  - UC-010
  - UC-013
---
# ARC-011 The assessment never sees the skill profile

## Context

Three groups of requirements pull against each other:

- The safety content of an answer must be identical for every skill profile, and a high skill level must never change a `professional only` or `not recommended` label (SAFETY-CONTENT-PROFILE-INDEPENDENT, SKILL-DOES-NOT-UNLOCK).
- The case must be interpreted in the context of the profile, the detail of the instructions must follow it, and collapsed basics must stay expandable (INPUT-USES-PROFILE, DETAIL-FOLLOWS-PROFILE, BASICS-EXPANDABLE, and UC-001, where the AI interprets the input in the context of the stored profile).
- Without a profile the answer must equal that for a beginner (DEFAULT-BEGINNER).

If a single AI call received the profile, the model could change warnings or labels with the level, and no deterministic check could prove the opposite without a second run.

## Decision

The AI work of a case is split in two tasks:

1. **Assessment.** It receives the description, the photo, the answers, the round and the inventory snapshot, **but not the profile**. It produces the summary, the questions, the risk, the packages with labels and reasons, the guides with their steps, the warnings, the materials, the tools and the notice kinds. Enforcement then adds the fixed safety steps. Everything safety-relevant comes from here, so it is identical for every profile by construction.
2. **Explanation.** For the DIY packages of the chosen option, it receives the core text of each step and the skill level of the package's area, taken from `levelFor`, which returns beginner when no level is set. It produces one `basics` text per step. Its output schema allows nothing but `{n, basics}` per requested step. The output check rejects anything else and applies the prohibited-path patterns to the basics.

The User interface shows the basics expanded for `beginner`, and collapsed but expandable for `some-experience` and `experienced`. The same explanation task, called for one step with `simpler: true`, serves STEP-RE-EXPLAIN.

The interpretation of the input in the context of the stored profile, which UC-001 asks of the AI, is met by the case as interpreted: the profile-blind assessment together with the explanation the AI writes at the profile's level. The inventory reaches the AI in the assessment, where it informs the options (INPUT-USES-INVENTORY) and cannot change safety.

**Principles:** probabilistic above deterministic, a guarantee by construction instead of by instruction; DRY, one explanation task for two functions.

## Alternatives

- **One call with the profile.** Rejected: SAFETY-CONTENT-PROFILE-INDEPENDENT and SKILL-DOES-NOT-UNLOCK would rest on the model's obedience. They could only be checked by comparing two runs.
- **One profile-blind call that always writes beginner basics, with the profile used only to collapse them.** Simpler, but the AI would then never interpret the case in the context of the profile, against the interpretation UC-001 asks for and against INPUT-USES-PROFILE.
- **Two full assessments, beginner and actual level, compared by code.** Rejected: twice the cost and latency, and a free-text comparison of warnings is fragile.

## Consequences

- An answered case needs a second, smaller AI call. The steps are shown at once, and the basics appear when the explanation arrives. The RESPONSE-TIME target applies to the assessment, which carries the answer.
- If the explanation fails, the steps are shown without basics and a notice says that explanations are not available. No safety content is lost.
- A user without a profile gets exactly the requests of an explicit beginner, so DEFAULT-BEGINNER holds by construction.
