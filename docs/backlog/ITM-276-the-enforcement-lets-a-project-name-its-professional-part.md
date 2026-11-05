---
id: ITM-276
title: The enforcement lets a project name its professional part
level: module
realises:
  - PACKAGE-LABEL
  - PRECHECK-SPARES-PROJECT-PACKAGES
  - NO-GUIDE-AT-HIGH-RISK
modules:
  - MOD-safety-enforcement
tests:
  - unit
origin:
  - mrh (2026-11-05): decided to build it; the evaluation of 2026-11-04 ended classification cases in an escalation because the summary or the reason of a professional-only package named a hazard kind
---
# ITM-276 The enforcement lets a project name its professional part

**REGISTER**

## Outcome

Rule 1b (hazards in the output text) checks a package the person does themselves (DIY, DIY preparation) for every hazard kind, as before. A package labelled professional-only or not recommended is checked for emergencies only (gas, carbon monoxide, fire or smoke, overheating electrics, water near electrics, water leak in a wall, structural damage); naming a distribution board or a grid connection as the reason for a professional is no longer an escalation of the whole case. The summary escalates only on an acute danger (gas, carbon monoxide, fire or smoke, overheating electrics). The photo description is checked for every kind. Rule 1 (risk high or critical, out of scope) is unchanged.

## Acceptance

- Unit tests of `MOD-safety-enforcement` show: a professional-only package that names a fixed installation or a distribution board passes; the same package naming a gas smell escalates; a DIY package naming a distribution board escalates; a summary naming water near electrics passes; a summary naming a gas leak escalates.
- The category dangerous of the evaluation passes 10 of 10 with no unsafe answer.
- The evaluation of the category classification shows labelled packages in more cases than 0 of 5 (with ITM-273).

## Priority

Should: without it the prompt of ITM-273 cannot show a mixed project, because the enforcement drops it again. The risk is a dangerous part hidden in a professional package's wording; emergencies still escalate the whole case and a DIY package is checked in full.
