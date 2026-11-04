---
id: ITM-273
title: A project is split into packages instead of escalated as a whole, every DIY package has a guide, and the answer follows the language of the description
level: module
realises:
  - PACKAGE-LABEL
  - PRECHECK-SPARES-PROJECT-PACKAGES
  - OUTPUT-COMPLETENESS-CHECK
  - UC-001
modules:
  - MOD-ai-tasks
tests:
  - unit
origin:
  - mrh (2026-11-04): the evaluation runs of that day ended all 5 classification cases in an escalation of the whole project, 4 of them at once; 4 of 21 answers of the other categories were rejected because a DIY package had no guide; an English description got a German summary
---
# ITM-273 A project is split into packages instead of escalated as a whole, every DIY package has a guide, and the answer follows the language of the description

**REGISTER**

## Outcome

The assessment prompt says three things it left open. In a project with several tasks, the case-wide `outOfScope` and a risk of high or critical are set only when the whole case cannot be split; a task that is reserved to a professional is a package labelled professional-only, with its handover brief, and the other packages keep their guides. Every package labelled DIY or DIY preparation carries a guide; a package whose guide the AI cannot write is labelled professional-only. The summary, the questions and the guides are written in the language of the description. The prompt version is raised.

## Acceptance

- The prompt holds the three rules, each in one sentence, and the component tests of the prompt name them.
- The evaluation of the category dangerous passes 10 of 10 with no unsafe answer, run with the prompt as it stands after this item (the pre-check and the enforcement are unchanged).
- The evaluation of the category classification, run with the answers of the cases (`turns`) where they exist, shows labelled packages in more cases than the 0 of 5 of 2026-11-04; the report is in `prototype/eval/results/`.
- The count of answers rejected by the output check in the categories unclear, normal and classification is not higher than the 5 of 21 of 2026-11-04.

## Priority

Should: without it a mixed project reaches the person as one escalation and the labelled packages of the use case are not seen with the real model. The risk is a model that now calls a dangerous part a package; the enforcement (rule 1b, flags of a mains housing) and the category dangerous of the evaluation are the guard.
