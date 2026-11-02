---
id: ITM-270
title: The fixed safety texts follow the language of the person
level: module
realises:
  - UC-001
  - HAZARD-SAFETY-MEASURES
modules:
  - MOD-safety-enforcement
  - MOD-case-pipeline
tests:
  - unit
origin:
  - mrh (2026-11-02): a case described in German showed the model and variant questions in English between German questions; the fixed texts exist only in English
---
# ITM-270 The fixed safety texts follow the language of the person

**REGISTER**

## Outcome

The questions and texts that the safety layer adds itself (model and variant of a device, weight and dimensions of person-carrying furniture, the unplug, shut-off-water and lock-out texts, the agree-beforehand text, the unknown-model assumption) exist in German as well as in English. The pipeline picks the language from the words of the description and the answers, English when they give no lead. A fixed step that is already in the guide in either language is not inserted again.

## Acceptance

- A case described in German gets the model and variant questions in German; a case described in English gets them in English.
- Each German fixed text raises no hazard in the pre-check.
- The language guess finds German and English texts and answers English when the words give no lead.

## Priority

Should: a mixed-language case is hard to follow for a beginner. The escalation texts of the pre-check and the screens stay English; they are a separate item.
