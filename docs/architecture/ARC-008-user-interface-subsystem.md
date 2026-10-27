---
id: ARC-008
title: Subsystem User interface
refines: ARC-001
forced_by:
  - ADEQUATE-CONTRAST
  - INSTRUCTION-STRUCTURE
  - LARGE-TEXT-CONTRAST
  - NON-TEXT-CONTRAST
  - NOT-COLOR-ALONE
  - READABLE-TEXT
  - REFLOW
  - REFLOW-NO-TWO-DIMENSIONAL-SCROLLING
  - TEXT-ALTERNATIVES
  - KEYBOARD-OPERABLE
  - FOCUS-VISIBLE
  - TARGET-SIZE
  - CLEAR-LABELS
  - ERROR-IDENTIFICATION
  - STATUS-MESSAGES
  - GO-BACK
  - AI-INTERACTION-DISCLOSED
  - PRIVACY-NOTICE
  - THREE-STEP-START
  - USABILITY-START-WITHOUT-HELP
  - BASICS-EXPANDABLE
  - NUMBERED-STEPS
  - ILLUSTRATIVE-IMAGES
  - UC-001
  - UC-012
  - UC-025
  - UC-026
  - UC-027
designs:
  - MOD-ui-kit
  - MOD-app-shell
  - MOD-case-screens
  - MOD-materials-screens
  - MOD-data-screens
---
# ARC-008 Subsystem User interface

## Context

All use cases reach the user through screens. Every screen must be accessible:

- contrast (ADEQUATE-CONTRAST, LARGE-TEXT-CONTRAST, NON-TEXT-CONTRAST);
- not by colour alone (NOT-COLOR-ALONE);
- resize and reflow (READABLE-TEXT, REFLOW, REFLOW-NO-TWO-DIMENSIONAL-SCROLLING);
- text alternatives (TEXT-ALTERNATIVES);
- keyboard and focus (KEYBOARD-OPERABLE, FOCUS-VISIBLE);
- target size (TARGET-SIZE);
- labels, errors and status messages (CLEAR-LABELS, ERROR-IDENTIFICATION, STATUS-MESSAGES).

In addition, every screen of a case offers a back action (GO-BACK), the AI is disclosed before the first interaction (AI-INTERACTION-DISCLOSED), and the privacy notice is shown when data is collected (PRIVACY-NOTICE). Every use case from UC-001 to UC-027 is presented by it.

## Decision

**Responsibility:** the User interface presents every function of the other subsystems as accessible screens, and handles navigation between them. It holds no business rules. Labels, availability, costs and safety content come from the subsystems below.

**Interface it offers:** browser routes only. No other subsystem uses it.

- `/` — new case
- `/case/$id` — questions or outcome
- `/case/$id/work/$packageId` — execution
- `/case/$id/materials`
- `/case/$id/offers/$itemId`
- `/profile`
- `/inventory`
- `/history`
- `/privacy`
- `/account`

**Modules:**

| Module | Responsibility |
|---|---|
| MOD-ui-kit | Accessible building blocks and design tokens that make the accessibility requirements hold by construction |
| MOD-app-shell | Routes, layout, back action, and the start of background sync |
| MOD-case-screens | Case input with AI notice, questions, outcome with packages and notices, guide, execution |
| MOD-materials-screens | Materials list, missing tools, offers, 3D suggestion, budget, saving owned items, deduction |
| MOD-data-screens | Profile, inventory, history, privacy and consents, export and delete, account, and the privacy notice text |

The relations:

- MOD-app-shell uses the three screen modules, MOD-ui-kit and MOD-sync-client.
- Each screen module uses MOD-ui-kit and the interfaces of the subsystems it presents.
- MOD-case-screens uses the `PrivacyNotice` of MOD-data-screens.

**Principles:** layers, the top layer; DRY; least astonishment; one responsibility per module.

## Alternatives

- **Using the generated shadcn/ui components directly in screens.** Rejected: each screen would have to remember labels, text alternatives, error linking and target size. Wrapping them once in MOD-ui-kit makes these properties a requirement of the component types (DRY).
- **One screen module.** Rejected: case, materials and data screens change for different reasons and use different subsystems.
- **A component library with its own design system, such as MUI.** Rejected: the prototype already uses Radix through shadcn/ui and Tailwind, which meet the needs (KISS, ARC-009).

## Consequences

- The accessibility properties are tested once in MOD-ui-kit and once per screen with axe in the system tests.
- A screen cannot render an icon button without a label or an image without a text alternative, because the types require them.
