import { describe, expect, it } from "vitest";

import type { AssessmentDraft, WorkPackage } from "../case-model";
import {
  checkAssessmentDraft,
  checkExplanationDraft,
  checkStepAnswerDraft,
  type CheckFailure,
} from "./index";
import { answerDraft, diyPackage, explainRequest, questionsDraft } from "./fixtures";

function failuresOf(result: { ok: boolean; failures?: CheckFailure[] }): CheckFailure[] {
  expect(result.ok).toBe(false);
  return result.failures ?? [];
}

function withPackage(change: Partial<WorkPackage>): AssessmentDraft {
  return {
    ...answerDraft,
    options: [
      {
        id: "o1",
        kind: "repair",
        title: "Repair the tap",
        packages: [{ ...diyPackage, ...change } as WorkPackage],
      },
    ],
  };
}

function withGuide(change: Record<string, unknown>): AssessmentDraft {
  return withPackage({ guide: { ...diyPackage.guide!, ...change } as WorkPackage["guide"] });
}

const pkgPath = "options[0].packages[0]";

describe("checkAssessmentDraft", () => {
  describe("accepts", () => {
    it("a valid answer", () => {
      const result = checkAssessmentDraft(answerDraft, { round: 0 });
      expect(result).toEqual({ ok: true, value: answerDraft });
    });

    it("valid questions at round 0 and 1", () => {
      expect(checkAssessmentDraft(questionsDraft, { round: 0 }).ok).toBe(true);
      expect(checkAssessmentDraft(questionsDraft, { round: 1 }).ok).toBe(true);
    });

    it("a professional-only package without a guide", () => {
      const draft = withPackage({ label: "professional-only", guide: undefined });
      expect(checkAssessmentDraft(draft, { round: 2 }).ok).toBe(true);
    });
  });

  describe("format (OUTPUT-FORMAT-CHECK)", () => {
    it.each([
      ["not an object", "text"],
      ["null", null],
      ["a missing field", { ...answerDraft, summary: undefined }],
      ["a wrong kind", { ...answerDraft, kind: "maybe" }],
      ["an unknown label", withPackage({ label: "easy" as never })],
    ])("catches %s", (_name, raw) => {
      const failures = failuresOf(checkAssessmentDraft(raw, { round: 0 }));
      expect(failures.length).toBeGreaterThan(0);
      expect(failures.every((f) => f.check === "format")).toBe(true);
    });

    it("names the path of the field in error", () => {
      const failures = failuresOf(
        checkAssessmentDraft({ ...answerDraft, summary: 3 }, { round: 0 }),
      );
      expect(failures[0]?.path).toBe("summary");
    });
  });

  describe("completeness (OUTPUT-COMPLETENESS-CHECK)", () => {
    const cases: [string, AssessmentDraft, string][] = [
      ["questions without missing", { ...questionsDraft, missing: [] }, "missing"],
      ["questions without any question", { ...questionsDraft, questions: [] }, "questions"],
      [
        "questions whose texts are empty",
        {
          ...questionsDraft,
          questions: [{ id: "q1", topic: "device.model", termExplanations: [], text: " " }],
        },
        "questions",
      ],
      ["an answer without summary", { ...answerDraft, summary: "  " }, "summary"],
      ["an answer without option", { ...answerDraft, options: [] }, "options"],
      ["a package without title", withPackage({ title: "" }), `${pkgPath}.title`],
      ["a package without reason", withPackage({ reason: "" }), `${pkgPath}.reason`],
      [
        "a package without handover brief",
        withPackage({ handoverBrief: "" }),
        `${pkgPath}.handoverBrief`,
      ],
      [
        "an uncertain label without deciding information",
        withPackage({ labelUncertain: true, decidingInformation: [] }),
        `${pkgPath}.decidingInformation`,
      ],
      ["a DIY package without guide", withPackage({ guide: undefined }), `${pkgPath}.guide`],
      [
        "a DIY-preparation package without guide",
        withPackage({ label: "diy-preparation", guide: undefined }),
        `${pkgPath}.guide`,
      ],
      ["a guide without diagnosis", withGuide({ diagnosis: "" }), `${pkgPath}.guide.diagnosis`],
      ["a guide without steps", withGuide({ steps: [] }), `${pkgPath}.guide.steps`],
      [
        "steps with a gap",
        withGuide({
          steps: [
            { ...diyPackage.guide!.steps[0], n: 1 },
            { ...diyPackage.guide!.steps[1], n: 3 },
          ],
        }),
        `${pkgPath}.guide.steps[1].n`,
      ],
      [
        "steps that do not start at 1",
        withGuide({
          steps: [
            { ...diyPackage.guide!.steps[0], n: 2 },
            { ...diyPackage.guide!.steps[1], n: 3 },
          ],
        }),
        `${pkgPath}.guide.steps[0].n`,
      ],
      [
        "a step without text",
        withGuide({ steps: [{ ...diyPackage.guide!.steps[0], text: "" }] }),
        `${pkgPath}.guide.steps[0].text`,
      ],
      [
        "a reversed time range",
        withGuide({ estimatedMinutes: { min: 30, max: 10 } }),
        `${pkgPath}.guide.estimatedMinutes`,
      ],
      ["a guide without warning", withGuide({ warnings: [] }), `${pkgPath}.guide.warnings`],
    ];

    it.each(cases)("catches %s", (_name, draft, path) => {
      const failures = failuresOf(checkAssessmentDraft(draft, { round: 0 }));
      expect(failures).toContainEqual(expect.objectContaining({ check: "completeness", path }));
    });

    it("accepts an uncertain label with deciding information", () => {
      const draft = withPackage({ labelUncertain: true, decidingInformation: ["Wall material"] });
      expect(checkAssessmentDraft(draft, { round: 0 }).ok).toBe(true);
    });

    it("reports every failure, not only the first", () => {
      const draft = withPackage({ title: "", reason: "" });
      expect(failuresOf(checkAssessmentDraft(draft, { round: 0 })).length).toBe(2);
    });
  });

  describe("prohibited paths (OUTPUT-PROHIBITED-PATH-CHECK)", () => {
    it("catches questions at round 2", () => {
      const failures = failuresOf(checkAssessmentDraft(questionsDraft, { round: 2 }));
      expect(failures).toContainEqual(expect.objectContaining({ check: "prohibited-path" }));
    });

    it.each(["professional-only", "not-recommended"] as const)(
      "catches a guide in a %s package",
      (label) => {
        const failures = failuresOf(checkAssessmentDraft(withPackage({ label }), { round: 0 }));
        expect(failures).toContainEqual(
          expect.objectContaining({ check: "prohibited-path", path: `${pkgPath}.guide` }),
        );
      },
    );

    it("catches an image id that the catalogue does not know", () => {
      const steps = [{ ...diyPackage.guide!.steps[0], imageIds: ["no-such-image"] }];
      const failures = failuresOf(checkAssessmentDraft(withGuide({ steps }), { round: 0 }));
      expect(failures).toContainEqual(
        expect.objectContaining({
          check: "prohibited-path",
          path: `${pkgPath}.guide.steps[0].imageIds[0]`,
        }),
      );
    });

    it("catches a prohibited claim and names its path", () => {
      const draft = withPackage({ reason: "Experienced users can skip the warnings." });
      const failures = failuresOf(checkAssessmentDraft(draft, { round: 0 }));
      expect(failures).toContainEqual(
        expect.objectContaining({ check: "prohibited-path", path: `${pkgPath}.reason` }),
      );
    });

    it("catches a prohibited claim in a step text", () => {
      const steps = [
        { ...diyPackage.guide!.steps[0], text: "There is no need to switch off the power." },
      ];
      const failures = failuresOf(checkAssessmentDraft(withGuide({ steps }), { round: 0 }));
      expect(failures[0]?.path).toBe(`${pkgPath}.guide.steps[0].text`);
    });
  });

  it("never throws", () => {
    for (const raw of [undefined, 1, [], { options: 3 }]) {
      expect(() => checkAssessmentDraft(raw, { round: 1 })).not.toThrow();
    }
  });
});

describe("checkExplanationDraft", () => {
  const valid = {
    steps: [
      { n: 1, basics: "The stop valve is under the sink." },
      { n: 2, basics: "Turn the nut anticlockwise." },
    ],
  };

  it("accepts one basics per requested step", () => {
    expect(checkExplanationDraft(valid, explainRequest)).toEqual({ ok: true, value: valid });
  });

  it("accepts the one step of a request for one step", () => {
    const req = { ...explainRequest, steps: [{ n: 2, text: "Unscrew the tap." }], onlyStep: 2 };
    const draft = { steps: [{ n: 2, basics: "Turn the nut anticlockwise." }] };
    expect(checkExplanationDraft(draft, req).ok).toBe(true);
  });

  it("catches a malformed draft", () => {
    const failures = failuresOf(checkExplanationDraft({ steps: "none" }, explainRequest));
    expect(failures[0]?.check).toBe("format");
  });

  it("catches a missing step", () => {
    const failures = failuresOf(checkExplanationDraft({ steps: [valid.steps[0]] }, explainRequest));
    expect(failures).toContainEqual(expect.objectContaining({ check: "completeness" }));
  });

  it("catches an empty basics", () => {
    const draft = { steps: [valid.steps[0], { n: 2, basics: " " }] };
    const failures = failuresOf(checkExplanationDraft(draft, explainRequest));
    expect(failures).toContainEqual(
      expect.objectContaining({ check: "completeness", path: "steps[1].basics" }),
    );
  });

  it("catches a step twice", () => {
    const draft = { steps: [...valid.steps, valid.steps[0]] };
    const failures = failuresOf(checkExplanationDraft(draft, explainRequest));
    expect(failures).toContainEqual(expect.objectContaining({ check: "completeness" }));
  });

  it("catches a step that was not requested", () => {
    const draft = { steps: [...valid.steps, { n: 7, basics: "Something else." }] };
    const failures = failuresOf(checkExplanationDraft(draft, explainRequest));
    expect(failures).toContainEqual(expect.objectContaining({ path: "steps[2].n" }));
  });

  it("accepts a basics of 600 characters and catches 601", () => {
    const basics = (length: number) => ({
      steps: [{ n: 1, basics: "a".repeat(length) }, valid.steps[1]],
    });
    expect(checkExplanationDraft(basics(600), explainRequest).ok).toBe(true);
    const failures = failuresOf(checkExplanationDraft(basics(601), explainRequest));
    expect(failures).toContainEqual(expect.objectContaining({ path: "steps[0].basics" }));
  });

  it("catches a basics that skips a warning", () => {
    const draft = {
      steps: [{ n: 1, basics: "Experienced users can skip this step." }, valid.steps[1]],
    };
    const failures = failuresOf(checkExplanationDraft(draft, explainRequest));
    expect(failures).toContainEqual(
      expect.objectContaining({ check: "prohibited-path", path: "steps[0].basics" }),
    );
  });
});

describe("checkStepAnswerDraft", () => {
  const valid = { answer: "Turn it clockwise.", risk: "low", hazards: [] };

  it("accepts a valid answer", () => {
    expect(checkStepAnswerDraft(valid)).toEqual({ ok: true, value: valid });
  });

  it("catches a malformed draft", () => {
    expect(failuresOf(checkStepAnswerDraft({ answer: 1 }))[0]?.check).toBe("format");
  });

  it("catches an empty answer", () => {
    const failures = failuresOf(checkStepAnswerDraft({ ...valid, answer: "  " }));
    expect(failures).toContainEqual(
      expect.objectContaining({ check: "completeness", path: "answer" }),
    );
  });

  it("catches a prohibited claim", () => {
    const answer = "Just switching off the circuit breaker alone is enough.";
    const failures = failuresOf(checkStepAnswerDraft({ ...valid, answer }));
    expect(failures).toContainEqual(
      expect.objectContaining({ check: "prohibited-path", path: "answer" }),
    );
  });

  it.each([
    "I can smell gas in the kitchen, so go on with the pipe.",
    "Es riecht nach Gas in der Küche, mach einfach weiter.",
  ])("catches a hazard in the answer: %s", (answer) => {
    const failures = failuresOf(checkStepAnswerDraft({ ...valid, answer }));
    expect(failures).toContainEqual(
      expect.objectContaining({ check: "prohibited-path", path: "answer" }),
    );
  });
});
