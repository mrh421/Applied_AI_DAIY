# Requirements: FOLLOW-UP-QUESTIONS, SKILL-DOES-NOT-UNLOCK, SAMPLE-PRODUCT-DATA, PROFILE-ON-DEVICE, RISK-CHECK-FIRST, HAZARD-SAFETY-MEASURES, PRECHECK-COVERS-FOLLOW-UP-ANSWERS, STEP-QUESTION-HAZARD-CHECK, NO-GUIDE-AT-HIGH-RISK, PRECHECK-ENGLISH, PRECHECK-GERMAN, PRECHECK-SPARES-PROJECT-PACKAGES, OUT-OF-SCOPE-RISK-HIGH, EMERGENCY-RISK-CRITICAL, EMERGENCY-ACTIONS-FIRST, SECOND-HAND-LISTED-FIRST

**The change.** Changed FOLLOW-UP-QUESTIONS; changed SKILL-DOES-NOT-UNLOCK; changed SAMPLE-PRODUCT-DATA; changed PROFILE-ON-DEVICE; changed RISK-CHECK-FIRST; changed HAZARD-SAFETY-MEASURES; added PRECHECK-COVERS-FOLLOW-UP-ANSWERS; added STEP-QUESTION-HAZARD-CHECK; added NO-GUIDE-AT-HIGH-RISK; added PRECHECK-ENGLISH; added PRECHECK-GERMAN; added PRECHECK-SPARES-PROJECT-PACKAGES; added OUT-OF-SCOPE-RISK-HIGH; added EMERGENCY-RISK-CRITICAL; added EMERGENCY-ACTIONS-FIRST; added SECOND-HAND-LISTED-FIRST; the rest of the section is as the person wrote it.

**Why.** Orignal Intent missed.

**Impact list.**
- FOLLOW-UP-QUESTIONS: changed; nothing names it.
- SKILL-DOES-NOT-UNLOCK: changed; nothing names it.
- SAMPLE-PRODUCT-DATA: changed; nothing names it.
- PROFILE-ON-DEVICE: changed; nothing names it.
- RISK-CHECK-FIRST: changed; nothing names it.
- HAZARD-SAFETY-MEASURES: changed; nothing names it.
- PRECHECK-COVERS-FOLLOW-UP-ANSWERS: added; nothing names it.
- STEP-QUESTION-HAZARD-CHECK: added; nothing names it.
- NO-GUIDE-AT-HIGH-RISK: added; nothing names it.
- PRECHECK-ENGLISH: added; nothing names it.
- PRECHECK-GERMAN: added; nothing names it.
- PRECHECK-SPARES-PROJECT-PACKAGES: added; nothing names it.
- OUT-OF-SCOPE-RISK-HIGH: added; nothing names it.
- EMERGENCY-RISK-CRITICAL: added; nothing names it.
- EMERGENCY-ACTIONS-FIRST: added; nothing names it.
- SECOND-HAND-LISTED-FIRST: added; nothing names it.

**Origin.** Source SRC-daiy-prototype, passages: Safety is enforced in code (`detectHazards` before AI, `enforceSafety` after) in `src/lib/repair.schema.ts`; hazardEscalation(`${data.problem} ${data.answers.map((a) => a.a).join(" ")}`); if (data.question && detectHazards(data.question).length) { return { ok: true, escalate: true, ... } }; AI output must never bypass hazard escalation. / Never use "guide" when risk is high or critical.; English and German patterns for gas, scorched or overheating sockets, water leaks in walls, distribution boards, structural work and refrigerant circuits.; Installation work that can be one package of a larger project (new socket, ceiling light, wallbox) is deliberately left to the AI, so FR-14 can still label the DIY packages of that project.; Immediate actions now fit the hazard. Before, a CO alarm got electrician advice ("switch off power at the fuse box").; Out-of-scope work that is not an emergency (distribution board, wall removal, refrigerant) is escalated as risk `high`, emergencies as `critical`.; Escalation for the pre-check, with actions that fit the detected hazards (emergencies first).; Ask follow-ups at most twice; after that, give a guide with clearly listed assumptions if safe.; Product offers are sample data in `src/lib/offers.ts` until real retailer integrations exist. Why: MVP scope.; Sample offers for demonstration — not live prices. Second-hand items are listed first.; User profiles (skill level + tool inventory) live in `src/lib/profiles.ts`, stored in localStorage only; The safety outcome and the FR-14 labels must be identical in both runs (SAF-07)..

**Provenance.** Agent M 8614a36ebcb5bc712cda9af5ce7bd46688150c91, commit 8614a36ebcb5bc712cda9af5ce7bd46688150c91; participant claude-bridge; model claude-sonnet-5-5; 2026-10-26; correction rounds: 2.
