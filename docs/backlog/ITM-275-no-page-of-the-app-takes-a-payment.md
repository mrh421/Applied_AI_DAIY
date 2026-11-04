---
id: ITM-275
title: No page of the app takes a payment
level: system
realises:
  - NO-IN-APP-PURCHASE
modules:
  - MOD-app-shell
tests:
  - system
origin:
  - mrh (2026-11-04): the backlog shows NO-IN-APP-PURCHASE as accepted and realised by no item
---
# ITM-275 No page of the app takes a payment

**REGISTER**

## Outcome

A browser test opens every page of the app (the start page, a case with its plan, the materials and the offers of a case, the work, the inventory, the history, the profile) and finds on none of them a control that takes a payment: no card or payment field, no button or link named pay, checkout or add to cart. An offer leaves the app through a link to the seller.

## Acceptance

- The test declares itself (`guards: NO-IN-APP-PURCHASE`) and runs in the system level.
- A known positive: the same search finds a control named pay in a page the test builds for it, so that the search is shown to work.

## Priority

Should: a requirement with no item and no test is not covered. The product has no purchase function; the test shows it.
