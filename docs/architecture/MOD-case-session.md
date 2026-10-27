---
id: MOD-case-session
title: State of the open case
folder: prototype/src/case-session/
realises:
  - FREE-TEXT-INPUT
  - OPTIONAL-PHOTO
  - SETUP-NEVER-BLOCKS
  - INPUT-USES-INVENTORY
  - INPUT-USES-PROFILE
  - DEFAULT-BEGINNER
  - DETAIL-FOLLOWS-PROFILE
  - FOLLOW-UP-QUESTIONS
  - REDUNDANT-ENTRY
  - STEP-CHECK-OFF
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - PROJECT-HISTORY
  - GO-BACK
  - BUDGET-RESPECTED
  - DEDUCT-CONSUMED
  - UNDERSTANDABLE-ERROR-NOTICE
follows:
  - ARC-004
  - ARC-011
  - ARC-015
uses:
  - MOD-case-pipeline.assessCase
  - MOD-case-pipeline.explainSteps
  - MOD-case-pipeline.answerStepQuestion
  - MOD-history.CaseRecord
  - MOD-history.getCase
  - MOD-history.saveCase
  - MOD-history.savePhoto
  - MOD-history.getPhoto
  - MOD-profile.levelFor
  - MOD-hazard-precheck.precheck
  - MOD-case-model.SAFETY_RULES_VERSION
  - MOD-inventory.deduct
  - MOD-inventory.snapshot
  - MOD-case-model.CaseOutcome
  - MOD-case-model.Answer
  - MOD-case-model.FollowUpQuestion
  - MOD-case-model.ExplainOutcome
  - MOD-case-model.StepAnswerOutcome
  - MOD-case-model.Money
  - MOD-case-model.Quantity
provides:
  - CaseSession
  - useCaseSession
  - prefillQuestions
---
# MOD-case-session State of the open case

## Responsibility

It belongs to Case guidance (ARC-004). It keeps the state of one case on the client. It builds the case's requests, applies their outcomes and saves the case as a case record after every change.

## Parts

- `index.ts`: the interface.
- `session.ts`: the hook.
- `photo.ts`: downscaling with canvas to at most 1600 pixels as JPEG (ARC-015).
- `prefill.ts`: filling answers in by fact topic.
- `*.test.ts`: unit tests. The round advances, and there is no third round; prefill by topic; a check-off survives a reload; the explanation request carries the level, with beginner when no level is set; the case request carries no profile; an offline failure gives a notice.

## Data

The open `CaseRecord`, held in memory and saved through MOD-history. The photo is held in memory.

## Interfaces

- `CaseSession` — `{ record: CaseRecord; photo: Blob | null; pending: 'assess' | 'explain' | 'question' | null; staleRules: boolean }`.
- `useCaseSession(caseId?: string)` — returns `{ session: CaseSession | null; start(input: { description: string; photo?: File }): Promise<CaseOutcome>; answer(answers: Answer[]): Promise<CaseOutcome>; chooseOption(optionId: string): Promise<void>; reExplain(packageId: string, n: number): Promise<ExplainOutcome>; askStep(packageId: string, n: number, question: string): Promise<StepAnswerOutcome>; checkStep(packageId: string, n: number, done: boolean): void; setNotes(notes: string): void; setBudget(budget: Money | null): void; reassess(): Promise<CaseOutcome>; setChosenOffer(itemId: string, offerId: string | null): void; complete(used: { name: string; quantity: Quantity; inventoryItemId?: string }[]): { ok: true } | { ok: false; reason: 'storage-full' } }`.
  - **Open store.** The open sessions are kept in a module-level store keyed by case id, not in the state of a component. A session, with its photo, therefore survives a change of route, and a screen that mounts later reads it (GO-BACK).
  - **Older safety rules.** When a record is opened (or arrives by sync) and its `rulesVersion` differs from `SAFETY_RULES_VERSION`, `staleRules` is set and `precheck` runs on the stored description and answers. A hit replaces `outcome` by the escalation. Without a hit the screen shows a notice that the plan was made under older safety rules, before the execution screen, and offers `reassess()`, which sends the case through `assessCase` again and stores the new `rulesVersion` (ARC-002: a changed rule reaches ongoing cases).
  - **Complete.** `complete(used)` does the three things of the completion together: it deducts the used quantities from the inventory, stores `materialsUsed` and sets the status to `completed`. If the storage fails in between, it undoes the deduction and reports `storage-full`, so inventory and record never disagree (UC-015).
  - `start` and `answer` send the description, the photo, every answer so far, the round and `snapshot()` of the inventory; `answer` advances the round from the last questions outcome; questions are returned prefilled by topic (REDUNDANT-ENTRY); a `not sure` answer is kept and the question is not repeated.
  - `chooseOption` requests the explanations of the option's DIY packages; it and `reExplain` send the skill level `levelFor(pkg.area)` with the steps. `reExplain` sets `simpler: true` and `onlyStep: n`.
  - With the user's consent, the photo is saved with `savePhoto` of MOD-history.
- `prefillQuestions(questions: FollowUpQuestion[], answers: Answer[]): FollowUpQuestion[]` — sets `prefill` of every question whose topic an earlier answer covers.

**Errors a caller handles:** a rejected server call, for example offline, resolves as a notice outcome `offline` or `technical-error` and does not throw. A `StorageFullError` from the store is rethrown to the screen, which shows a status message.

## Files

It reads and writes no file directly; the case record goes through MOD-history.

## Uses

- `MOD-case-pipeline.assessCase`, `MOD-case-pipeline.explainSteps` and `MOD-case-pipeline.answerStepQuestion` — the server functions it calls.
- `MOD-history.CaseRecord`, `MOD-history.getCase`, `MOD-history.saveCase`, `MOD-history.savePhoto` and `MOD-history.getPhoto` — loading and saving the case record and its photo.
- `MOD-profile.levelFor` — the level sent with explanations.
- `MOD-hazard-precheck.precheck` and `MOD-case-model.SAFETY_RULES_VERSION` — the re-check of a stored case under newer safety rules.
- `MOD-inventory.deduct` — the deduction on completion.
- `MOD-inventory.snapshot` — the inventory sent with the case.
- `MOD-case-model.CaseOutcome`, `MOD-case-model.Answer`, `MOD-case-model.FollowUpQuestion`, `MOD-case-model.ExplainOutcome`, `MOD-case-model.StepAnswerOutcome`, `MOD-case-model.Money` and `MOD-case-model.Quantity` — the types of its interface.
