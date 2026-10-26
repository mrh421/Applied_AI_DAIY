---
id: UC-003
title: Receive instructions
area: 3 instructions
actors:
  - User
  - App
  - AI
realises:
  - PROBLEM-SUMMARY
  - INSTRUCTION-STRUCTURE
  - NUMBERED-STEPS
  - SHORT-SENTENCES
  - PLAIN-LANGUAGE
  - DETAIL-FOLLOWS-PROFILE
  - BASICS-EXPANDABLE
  - REPAIR-FIRST
  - REUSE-FIRST
  - NO-UNVALIDATED-OUTPUT
---

# UC-003 Receive instructions

## Actors

- User: the person who wants to solve the problem.
- App: the DAIY application, which validates the AI output.
- AI: the AI component that drafts the answer.

## Precondition

A case has been started (UC-001). Missing information has been clarified or has been replaced by listed assumptions (UC-002). The case is not one for which the app gives no instructions.

## Main flow

1. The AI drafts the answer from the case, the skill profile and the inventory.
2. The app validates the draft. Only a draft that passes validation goes on.
3. The app shows the user a summary of the problem that the user can follow.
4. The app ranks the solution options. Repair comes before buying new, and reuse comes before buying new.
5. The app shows the instructions for the chosen option. They contain the diagnosis, the required tools, the required materials, the numbered steps, the estimated time and the warnings.
6. The steps are written in short sentences. A technical term is avoided or explained where it first appears.
7. The level of detail follows the user's skill profile. A user without a profile gets the beginner level.
8. The user reads the instructions.

## Alternative flows

- A1, advanced profile: basic explanations are collapsed or skipped. The user can expand each of them at any time.
- A2, beginner profile: the basic explanations are shown in full. The user can collapse them.
- A3, draft fails validation: the app does not show the draft. It shows an understandable notice instead and invents no solution.
- A4, no repair or reuse option: the app proposes buying new. It shows this option after any repair or reuse option that exists.
- A5, uncertain classification: the instructions name the information that would change the label, as for an uncertain classification in UC-002.

## Postcondition

The user holds a validated answer with a problem summary and a complete, numbered set of instructions at the level of the profile. No AI output reached the user without validation.

## Diagram

```mermaid
sequenceDiagram
    actor User
    participant App
    participant AI
    User->>App: Case with answers
    App->>AI: Case, profile, inventory
    AI-->>App: Draft answer
    App->>App: Validate draft
    alt draft is valid
        App->>App: Rank options, repair and reuse before buying new
        App-->>User: Problem summary
        App-->>User: Instructions at the level of the profile
    else draft is not valid
        App-->>User: Understandable notice, no invented solution
    end
```
