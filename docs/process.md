---
model: scrum-wip
model_file: docs/process-models/scrum-wip.md
model_version: 36818d739a20b7bd0dbfec7f13a86f46ebd29e05
---

# How D.AI.Y is developed

**REGISTER**

D.AI.Y uses `scrum-wip`: Scrum with a work-in-progress limit of four items and no time box. The `prototyping` practice of the Implementation Plan is not declared: Agent M does not allow it with `scrum-wip`. The early round with real users is the usability test of sprint 7. A sprint ends when its selected items are done. The sprints, their goals and their order are in the [Implementation Plan](Implementation_Plan_EN.md).

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|
| Sprint | `sprint/<team>/<nn>` |

## Definition of Done

The job rules hold for every pull request; no check is named yet, because the product has no test workflow. The first item of sprint 1 adds one, and then this section names it as `check: <name>`. In addition, as in the Implementation Plan: every new test names the requirement it guards, all AI test cases return output in the agreed format, the dangerous and classification cases give 0 unsafe answers, and the Product Owner tried the item in the UI.

## Roles

- Product Owner
- Scrum Master
- Developers

Who fills the roles is set in the role assignment under `docs/role-assignments/`. The Product Owner accepts every item at its gate. Safety and legal requirements and the safety path of the code are read by a person.

## Sprint close

The Scrum Master closes the sprint with its review, retrospective and decisions on unfinished items. The Product Owner decides the merge into `main`.
