import { describe, expect, it } from "vitest";

import type { AssessmentDraft, CaseOutcome } from "../case-model";
import { detectHazards, precheck } from "../hazard-precheck";
import { noticesFor } from "../legal-notices";
import { checkAssessmentDraft } from "../output-check";
import { enforceSafety } from "../safety-enforcement";
import { answerDraft } from "../output-check/fixtures";
import { draft, pkg, step } from "../safety-enforcement/fixtures";

// ARC-002, the Case domain subsystem: the pre-check, the output check, the enforcement and the legal notices over
// the case model, run together as the pipeline runs them. The unit tests of each module hold the rules one by one.

const ctx = { round: 0 as const, answers: [] };

const dangerous = [
  "I smell gas near the stove",
  "the lamp has a frayed cable",
  "my carbon monoxide alarm is going off",
  "the fuse box is smoking",
];

const hasGuide = (o: CaseOutcome) =>
  o.type === "guidance" && o.options.some((opt) => opt.packages.some((p) => p.guide !== null));

describe("a case is checked for hazards before any instructions (UC-011)", () => {
  it.each(dangerous)("escalates without an AI draft: %s", (text) => {
    const escalation = precheck([text]);
    expect(escalation).not.toBeNull();
    expect(escalation?.origin).toBe("precheck");
    expect(["high", "critical"]).toContain(escalation?.risk);
  });

  it("finds a hazard that only a follow-up answer names", () => {
    expect(
      precheck(["My lamp does not light", "There is a frayed cable at the plug"]),
    ).not.toBeNull();
  });

  it("lets a harmless case through", () => {
    expect(precheck(["My drawer is sticking", "It is a kitchen drawer"])).toBeNull();
  });
});

describe("no output with risk high or critical holds a guide", () => {
  it.each(["high", "critical"] as const)("risk %s", (risk) => {
    const outcome = enforceSafety(draft({ risk }), ctx);
    expect(outcome.type).toBe("escalation");
    expect(hasGuide(outcome)).toBe(false);
  });

  it("also when the AI calls the risk low but its text names a hazard (second line)", () => {
    const outcome = enforceSafety(
      draft({ risk: "low", summary: "A scorched socket and a smell of gas." }),
      ctx,
    );
    expect(outcome.type).toBe("escalation");
    expect(hasGuide(outcome)).toBe(false);
  });
});

describe("the labels and escalations do not depend on a skill level (ARC-011)", () => {
  const drafts: AssessmentDraft[] = [
    draft(),
    draft({ risk: "high", hazards: ["gas"] }),
    draft({
      options: [
        {
          id: "o1",
          kind: "repair",
          title: "Repair",
          packages: [
            pkg({ flags: { opensMainsHousing: true, carriesPerson: false, waterRelated: false } }),
          ],
        },
      ],
    }),
  ];

  it.each(drafts.map((d, i) => [i, d] as const))(
    "draft %i gives the same outcome for a beginner and an expert",
    (_, d) => {
      const asBeginner = enforceSafety(d, { ...ctx, skill: "beginner" } as typeof ctx);
      const asExpert = enforceSafety(d, { ...ctx, skill: "expert" } as typeof ctx);
      expect(asBeginner).toEqual(asExpert);
      expect(asBeginner).toEqual(enforceSafety(d, ctx));
    },
  );
});

describe("the rules keep their order", () => {
  it("escalation (rule 1) ends the run before the label rules", () => {
    const openingStep = step(1, "Open the housing of the meter.", { opensDevice: true });
    const outcome = enforceSafety(
      draft({
        risk: "high",
        options: [
          {
            id: "o1",
            kind: "repair",
            title: "Repair",
            packages: [pkg({ guide: { ...pkg().guide!, steps: [openingStep] } })],
          },
        ],
      }),
      ctx,
    );
    expect(outcome.type).toBe("escalation");
  });

  it("a package that opens a mains housing is labelled professional-only and loses its guide (rules 6 and 8)", () => {
    const outcome = enforceSafety(
      draft({
        options: [
          {
            id: "o1",
            kind: "repair",
            title: "Repair",
            packages: [
              pkg({
                flags: { opensMainsHousing: true, carriesPerson: false, waterRelated: false },
              }),
            ],
          },
        ],
      }),
      ctx,
    );
    expect(outcome.type).toBe("guidance");
    if (outcome.type !== "guidance") return;
    const p = outcome.options[0]!.packages[0]!;
    expect(p.label).toBe("professional-only");
    expect(p.guide ?? null).toBeNull();
  });
});

describe("a harmless case runs through all the modules", () => {
  it("passes the pre-check and the output check, is enforced and gets its legal notices", () => {
    expect(precheck(["My tap drips"])).toBeNull();

    const checked = checkAssessmentDraft(answerDraft, ctx);
    expect(checked.ok).toBe(true);
    if (!checked.ok) return;

    const outcome = enforceSafety(checked.value, ctx);
    expect(outcome.type).toBe("guidance");
    expect(hasGuide(outcome)).toBe(true);
    expect(detectHazards(JSON.stringify(outcome))).toEqual([]);

    expect(noticesFor([])).toEqual([]);
  });
});
