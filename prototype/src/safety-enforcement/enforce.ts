import { FIXED_TOPICS, LABEL_STRICTNESS, stricterLabel } from "../case-model";
import type {
  Answer,
  AssessmentDraft,
  CaseOutcome,
  FollowUpQuestion,
  Guide,
  HazardKind,
  PackageLabel,
  SolutionOption,
  Step,
  StepAnswerDraft,
  StepAnswerOutcome,
  WorkPackage,
} from "../case-model";
import { detectHazards, escalationFor, opensHousing } from "../hazard-precheck";
import { FIXED_QUESTIONS, FIXED_TEXTS } from "./fixed";

export type EnforceContext = { round: 0 | 1 | 2; answers: Answer[] };

const unique = <T>(items: T[]): T[] => [...new Set(items)];

function allPackages(options: SolutionOption[]): WorkPackage[] {
  return options.flatMap((o) => o.packages);
}

function outputTexts(draft: AssessmentDraft): string[] {
  const packages = allPackages(draft.options);
  return [
    draft.summary,
    ...(draft.photoDescription ? [draft.photoDescription] : []),
    ...packages.flatMap((p) => [p.title, p.reason, ...(p.guide?.steps.map((s) => s.text) ?? [])]),
  ];
}

/** A value is missing when no answer has the topic, or the answer says "not sure". */
function isMissing(topic: string, answers: Answer[]): boolean {
  return !answers.some((a) => a.topic === topic && !a.notSure);
}

function wasAnswered(topic: string, answers: Answer[]): boolean {
  return answers.some((a) => a.topic === topic);
}

function nextRound(round: 0 | 1 | 2): 1 | 2 {
  return round === 0 ? 1 : 2;
}

function questionsOutcome(
  ctx: EnforceContext,
  missing: string[],
  questions: FollowUpQuestion[],
): CaseOutcome {
  return { type: "questions", round: nextRound(ctx.round), missing, questions };
}

function mapPackages(options: SolutionOption[], fn: (p: WorkPackage) => WorkPackage) {
  return options.map((o) => ({ ...o, packages: o.packages.map(fn) }));
}

function nextStricterLabel(label: PackageLabel): PackageLabel {
  const i = LABEL_STRICTNESS.indexOf(label);
  return LABEL_STRICTNESS[Math.min(i + 1, LABEL_STRICTNESS.length - 1)] ?? label;
}

function fixedStep(text: string): Step {
  return {
    n: 0,
    text,
    opensDevice: false,
    switchesOffCircuit: false,
    fixedSafetyStep: true,
    imageIds: [],
  };
}

function withFixedSafetySteps(pkg: WorkPackage, guide: Guide): Guide {
  let steps = [...guide.steps];
  const has = (text: string) => steps.some((s) => s.text === text);
  const firstOpening = steps.findIndex((s) => s.opensDevice);
  if (firstOpening >= 0 && !has(FIXED_TEXTS.unplug)) {
    steps.splice(firstOpening, 0, fixedStep(FIXED_TEXTS.unplug));
  }
  if (pkg.flags.waterRelated && !has(FIXED_TEXTS.shutOffWater)) {
    steps = [fixedStep(FIXED_TEXTS.shutOffWater), ...steps];
  }
  const lockOut =
    guide.steps.some((s) => s.switchesOffCircuit) && !guide.warnings.includes(FIXED_TEXTS.lockOut);
  return {
    ...guide,
    steps: steps.map((s, i) => ({ ...s, n: i + 1 })),
    warnings: lockOut ? [...guide.warnings, FIXED_TEXTS.lockOut] : guide.warnings,
    materials: guide.materials.map((m) =>
      m.safetyCritical === "unclear" ? { ...m, safetyCritical: "yes" } : m,
    ),
  };
}

/** Rules 6 to 11 for one package. */
function shapePackage(original: WorkPackage): WorkPackage {
  let label = original.label;
  if (original.flags.opensMainsHousing || original.guide?.steps.some((s) => opensHousing(s.text))) {
    label = stricterLabel(label, "professional-only");
  }
  if (original.labelUncertain) {
    label = stricterLabel(label, original.alternativeLabel ?? nextStricterLabel(label));
  }
  const pkg = { ...original, label };
  if (label === "professional-only" || label === "not-recommended") {
    const { guide: _guide, ...rest } = pkg;
    return rest;
  }
  if (label === "diy-preparation") pkg.agreeBeforehand = FIXED_TEXTS.agreeBeforehand;
  if (pkg.guide) pkg.guide = withFixedSafetySteps(pkg, pkg.guide);
  return pkg;
}

export function enforceSafety(input: AssessmentDraft, ctx: EnforceContext): CaseOutcome {
  const draft = structuredClone(input);
  const { answers, round } = ctx;

  // 1. Escalation
  if (draft.outOfScope !== null || draft.risk === "high" || draft.risk === "critical") {
    const kinds: HazardKind[] = [...draft.hazards, ...(draft.outOfScope ? [draft.outOfScope] : [])];
    return { type: "escalation", escalation: escalationFor(kinds, "output") };
  }

  // 1b. Hazards in the output text
  const found = unique(outputTexts(draft).flatMap(detectHazards));
  if (found.length > 0) {
    return { type: "escalation", escalation: escalationFor(found, "output") };
  }

  // 2. Unclear risk
  if (draft.riskUncertain) {
    if (round < 2 && draft.questions.length > 0) {
      return questionsOutcome(ctx, draft.missing, draft.questions);
    }
    return { type: "escalation", escalation: escalationFor(draft.hazards, "output") };
  }

  const added: FollowUpQuestion[] = [];
  const addedMissing: string[] = [];
  let options = draft.options;
  let assumptions = draft.assumptions;

  // 3. Device model
  if (draft.device.concernsDevice && !draft.device.modelKnown) {
    const wanted = [FIXED_QUESTIONS.deviceModel, FIXED_QUESTIONS.deviceVariant].filter(
      (q) => !wasAnswered(q.topic, answers),
    );
    if (round < 2 && wanted.length > 0) {
      added.unshift(...wanted);
      addedMissing.push(...wanted.map((q) => q.topic));
    } else {
      options = options.map((o) => ({
        ...o,
        packages: o.packages.map((p) =>
          p.guide
            ? {
                ...p,
                guide: {
                  ...p.guide,
                  materials: p.guide.materials.filter((m) => !m.replacementPart),
                },
              }
            : p,
        ),
      }));
      assumptions = [...assumptions, FIXED_TEXTS.unknownModel];
    }
  }

  // 4. Person-carrying furniture
  if (allPackages(options).some((p) => p.flags.carriesPerson)) {
    const gaps = [
      {
        question: FIXED_QUESTIONS.furnitureLoad,
        deciding: FIXED_TEXTS.loadDeciding,
      },
      {
        question: FIXED_QUESTIONS.furnitureDimensions,
        deciding: FIXED_TEXTS.dimensionsDeciding,
      },
    ].filter((g) => isMissing(g.question.topic, answers));
    if (gaps.length > 0) {
      if (round < 2) {
        added.push(...gaps.map((g) => g.question));
        addedMissing.push(...gaps.map((g) => g.question.topic));
      } else {
        options = mapPackages(options, (p) =>
          p.flags.carriesPerson
            ? {
                ...p,
                label: "not-recommended",
                decidingInformation: unique([
                  ...p.decidingInformation,
                  ...gaps.map((g) => g.deciding),
                ]),
              }
            : p,
        );
      }
    }
  }

  // 5. Questions
  if ((draft.kind === "questions" || added.length > 0) && round < 2) {
    const own = draft.questions.filter((q) => !added.some((a) => a.topic === q.topic));
    const fixedFirst = added.filter((q) => q.topic.startsWith("device."));
    const fixedLast = added.filter((q) => !q.topic.startsWith("device."));
    return questionsOutcome(ctx, unique([...draft.missing, ...addedMissing]), [
      ...fixedFirst,
      ...own,
      ...fixedLast,
    ]);
  }

  // 6 to 11
  options = mapPackages(options, shapePackage);

  // 12. Result
  return {
    type: "guidance",
    summary: draft.summary,
    assumptions,
    options,
    notices: [],
    photoAlt: draft.photoDescription,
  };
}

export function enforceStepAnswer(draft: StepAnswerDraft): StepAnswerOutcome {
  if (draft.risk === "high" || draft.risk === "critical") {
    return { type: "escalation", escalation: escalationFor(draft.hazards, "output") };
  }
  const found = detectHazards(draft.answer);
  if (found.length > 0) {
    return { type: "escalation", escalation: escalationFor(found, "output") };
  }
  return { type: "answer", text: draft.answer };
}
