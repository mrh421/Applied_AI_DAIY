---
id: MOD-case-screens
title: Screens of a case
folder: prototype/src/case-screens/
realises:
  - FREE-TEXT-INPUT
  - OPTIONAL-PHOTO
  - THREE-STEP-START
  - USABILITY-START-WITHOUT-HELP
  - NO-PROMPT-SKILL-NEEDED
  - AI-INTERACTION-DISCLOSED
  - EVERYDAY-LANGUAGE-QUESTIONS
  - REDUNDANT-ENTRY
  - PROBLEM-SUMMARY
  - INSTRUCTION-STRUCTURE
  - NUMBERED-STEPS
  - DETAIL-FOLLOWS-PROFILE
  - BASICS-EXPANDABLE
  - ILLUSTRATIVE-IMAGES
  - TEXT-ALTERNATIVES
  - PACKAGE-LABEL
  - PACKAGE-REASON
  - HANDOVER-BRIEF
  - AGREE-WITH-PROFESSIONAL-BEFOREHAND
  - ESCALATION-REASON
  - HAZARD-PROFESSIONAL
  - STEP-CHECK-OFF
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - UNDERSTANDABLE-ERROR-NOTICE
  - NOT-COLOR-ALONE
  - PRIVATE-BY-DEFAULT
  - DEVICE-STORAGE-CONSENT
  - UC-012
follows:
  - ARC-008
  - ARC-011
uses:
  - MOD-ui-kit.Button
  - MOD-ui-kit.IconButton
  - MOD-ui-kit.TextField
  - MOD-ui-kit.Checkbox
  - MOD-ui-kit.Collapsible
  - MOD-ui-kit.StatusBadge
  - MOD-ui-kit.Img
  - MOD-ui-kit.Page
  - MOD-ui-kit.announce
  - MOD-case-session.useCaseSession
  - MOD-profile.levelFor
  - MOD-consent.hasConsent
  - MOD-consent.giveConsent
  - MOD-consent.CONSENT_PURPOSES
  - MOD-illustrations.illustration
  - MOD-case-model.CaseOutcome
  - MOD-case-model.WorkPackage
  - MOD-case-model.PackageLabel
  - MOD-data-screens.PrivacyNotice
provides:
  - CaseInputScreen
  - QuestionsScreen
  - OutcomeScreen
  - ExecutionScreen
---
# MOD-case-screens Screens of a case

## Responsibility

It belongs to the User interface (ARC-008). It presents a case: input, follow-up questions, outcome with work packages and notices, the guide, and the step-by-step execution.

## Parts

- `index.ts`: the interface.
- `CaseInputScreen`: a free-text field, an optional photo, and Confirm. The AI notice text stating that the user is interacting with an AI system, and a short `PrivacyNotice`, are shown above the field. Neither is a required step. When a photo is attached, a one-action choice asks for the consent `keep-case-photos` with its purpose; leaving it unchosen blocks nothing.
- `QuestionsScreen`: questions in everyday language with their term explanations, prefilled answers that can be confirmed or changed, and a `not sure` choice.
- `OutcomeScreen`: the summary, the listed assumptions and the ranked options; packages with a `StatusBadge` for the label, with icon and text, and the reason; the deciding information, and the handover brief with copy and share (Web Share API, with copy to the clipboard as the fallback); the agree-beforehand advice, legal notices with their marks, the escalation view, and notices.
- `GuideView`: diagnosis, tools, materials, numbered steps, time and warnings; basics in `Collapsible`, open by default for `beginner` and closed for other levels; illustrations with their `alt`.
- `ExecutionScreen`: the current step marked, check off and uncheck, explain again, and ask a question with the answer or escalation shown in the step's context.
- `*.test.tsx`: Testing Library tests. A case starts in three required inputs; the AI notice is visible before confirm; each label shows icon and text; basics are open for beginner and closed but expandable for experienced; an escalation shows no steps; a step check-off persists.

## Data

None. Everything comes from MOD-case-session.

## Interfaces

- `CaseInputScreen(p: { caseId?: string }): JSX.Element` — the route `/`; with `caseId` it shows the description and photo of that open case again.
- `QuestionsScreen(p: { caseId: string }): JSX.Element` — the route `/case/$id` while questions are open.
- `OutcomeScreen(p: { caseId: string }): JSX.Element` — the route `/case/$id` with an outcome.
- `ExecutionScreen(p: { caseId: string; packageId: string }): JSX.Element` — the route `/case/$id/work/$packageId`.

**Errors a caller handles:** none. Notices and failures are shown as text, and status messages go through `announce`.

## Files

It reads and writes no file.

## Uses

- `MOD-ui-kit.Button`, `MOD-ui-kit.IconButton`, `MOD-ui-kit.TextField`, `MOD-ui-kit.Checkbox`, `MOD-ui-kit.Collapsible`, `MOD-ui-kit.StatusBadge`, `MOD-ui-kit.Img`, `MOD-ui-kit.Page` and `MOD-ui-kit.announce` — every element of the screens.
- `MOD-case-session.useCaseSession` — the state and the actions of the case.
- `MOD-profile.levelFor` — whether basics start open.
- `MOD-consent.hasConsent`, `MOD-consent.giveConsent` and `MOD-consent.CONSENT_PURPOSES` — asking to keep the photo.
- `MOD-illustrations.illustration` — the images of the steps.
- `MOD-case-model.CaseOutcome`, `MOD-case-model.WorkPackage` and `MOD-case-model.PackageLabel` — what the screens show.
- `MOD-data-screens.PrivacyNotice` — the short privacy notice on the case input.
