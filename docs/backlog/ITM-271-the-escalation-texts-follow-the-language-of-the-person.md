---
id: ITM-271
title: The escalation texts follow the language of the person
level: module
realises:
  - UC-001
  - NO-GUIDE-FOR-HAZARDS
  - ESCALATION-REASON
modules:
  - MOD-hazard-precheck
  - MOD-safety-enforcement
  - MOD-case-pipeline
builds_on:
  - ITM-270
tests:
  - unit
origin:
  - mrh (2026-11-02): the evaluation run showed the escalation of a German case (CASE-024, scorched socket) in English; the case asks for an answer in the language of the input (G4)
---
# ITM-271 The escalation texts follow the language of the person

**REGISTER**

## Outcome

The reason, the immediate actions and the professionals of an escalation exist in German for every hazard kind of the catalogue as well as in English. The language is the one of the person's words (the guess of ITM-270): the pre-check, the enforcement of an AI draft and the answer to a step question use it. English stays the default when the words give no lead.

## Acceptance

- A German input that the pre-check stops gets a German reason, German actions and a German professional; the risk, the hazard kinds and the number of actions are the same as in English.
- Every hazard kind has a German text.
- An escalation of the enforcement and of a step answer follows the language given.

## Priority

Should: a German case that ends in an English emergency text is hard to follow in the moment it matters. The reason shown for an escalation that the AI caused (the AI's own wording instead of the catalogue text) is a separate item.
