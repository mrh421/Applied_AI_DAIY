# Changelog of mrh421/Applied_AI_DAIY

## v2026.1.0 — 2026-11-07

### What the app does

- A case starts from a text, up to four photos or dictation, is questioned in at most two rounds and ends in an outcome with work packages. Every package is labelled: do it yourself, do the preparation yourself, professional only or not recommended.
- Dangerous cases (gas, carbon monoxide, fire, overheating electrics, work on fixed installations) are checked in code before the AI is called, and the AI's draft is checked again before anyone sees it. Such a case ends in an escalation with the actions that fit the hazard, not in instructions.
- A mixed project is split into packages: the part the person does themselves gets a guide, the professional part is named with its reason. A rejected AI draft is asked for once more with the failures named.
- The work is done step by step with a check-off per step; a question about a step passes the same safety pipeline.
- Materials are matched against the person's own stock first, then against sample products, each with a certainty label; every option shows its total cost.
- Legal notices (check locally, rented property, warranty or funding, chimney sweep, permit-free is not rule-free) are shown where they apply.
- Profile, inventory and history stay on the device; consent comes before any storage; no page of the app takes a payment.
- Every screen is accessible (keyboard, 320 px, 200 percent zoom); the look follows the Lovable design.

Known limitations:
- TST-093: Not done: no outside tester tried it before the release. Not a failure of the app.
- TST-094: Not done: no outside tester tried it before the release. Not a failure of the app.
- TST-095: Not done: no outside tester tried it before the release. Not a failure of the app.
- TST-096: Not done: no outside tester tried it before the release. Not a failure of the app.

## v2026.1.0 (2026-11-06)

The first release of the repair and DIY assistant, built in twelve sprints (daiy/01 to daiy/12).

### What the app does

- A case starts from a text, up to four photos or dictation, is questioned in at most two rounds and ends in an outcome with work packages. Every package is labelled: do it yourself, do the preparation yourself, professional only or not recommended.
- Dangerous cases (gas, carbon monoxide, fire, overheating electrics, work on fixed installations) are checked in code before the AI is called, and the AI's draft is checked again before anyone sees it. Such a case ends in an escalation with the actions that fit the hazard, not in instructions.
- A mixed project is split into packages: the part the person does themselves gets a guide, the professional part is named with its reason. A rejected AI draft is asked for once more with the failures named.
- The work is done step by step with a check-off per step; a question about a step passes the same safety pipeline.
- Materials are matched against the person's own stock first, then against sample products, each with a certainty label; every option shows its total cost.
- Legal notices (check locally, rented property, warranty or funding, chimney sweep, permit-free is not rule-free) are shown where they apply.
- Profile, inventory and history stay on the device; consent comes before any storage; no page of the app takes a payment.
- Every screen is accessible (keyboard, 320 px, 200 percent zoom); the look follows the Lovable design.

### How it was checked

- Unit, component and system tests declare the requirements they guard; the test records are kept on the branch test-results.
- The AI's behaviour is measured with an evaluation, not trusted: on 2026-11-05 all 9 normal cases passed, 1 of 21 answers was rejected (limit 5 of 21), and no run gave an unsafe answer.

### Known limitations

- Unclear requests: the app judges after one or two questions where it should keep asking (1 of 7 evaluation cases as expected). It errs towards caution, not towards danger.
- Mixed projects: the whole project still escalates in some cases (wallbox, attic floor with a light); labelled packages appear in 3 of 5 evaluation cases.
- No test yet for the requirements on offers and second-hand listings, account sync, 3D model links and data export; this changelog makes no claim about them.
- The evaluation cases are drafts with one or two runs each: first findings, not proof.
