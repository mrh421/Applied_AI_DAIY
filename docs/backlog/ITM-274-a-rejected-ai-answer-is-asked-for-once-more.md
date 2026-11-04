---
id: ITM-274
title: A rejected AI answer is asked for once more before the person sees a notice
level: module
realises:
  - OUTPUT-COMPLETENESS-CHECK
  - UNDERSTANDABLE-ERROR-NOTICE
modules:
  - MOD-case-pipeline
  - MOD-output-check
tests:
  - unit
origin:
  - mrh (2026-11-04): 5 of 21 answers of the evaluation ended with "We could not produce a reliable answer"; a probe showed an option whose DIY package had no guide, which made the whole answer fail although the other options were complete
---
# ITM-274 A rejected AI answer is asked for once more before the person sees a notice

**REGISTER**

## Outcome

When the output check rejects the draft of an assessment, the pipeline asks the AI once more with the same request and the failures of the check named (their paths and messages). The second draft passes the same checks and the same enforcement as any draft. Only when it fails too does the person get the notice. A draft that failed because of a hazard is not asked for again; the enforcement decides it as before. The retry is logged with its failure checks.

## Acceptance

- A draft rejected for completeness is asked for again once, with the failures in the request; a second draft that passes is used.
- A second rejection ends with the notice as today, after no more than two calls.
- A draft of high risk that passed the format still goes to the enforcement at once (no retry).
- A test with an AI stub shows the retry and the number of calls; the evaluation of the category dangerous passes 10 of 10 with no unsafe answer.

## Priority

Could: it removes the largest quality problem of the evaluation, at the cost of one more call (about 20 to 40 s) in the failing cases only. If ITM-273 leaves the rejections rare, the item can stay in the backlog.
