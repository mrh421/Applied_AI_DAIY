import type {
  AssessmentDraft,
  ExplainRequest,
  ExplanationDraft,
  StepAnswerDraft,
} from "../case-model";
import { pathOf, type CheckFailure } from "./format";

// OUTPUT-COMPLETENESS-CHECK: the draft holds everything its kind needs. The enums of the
// format check already guarantee an area and a label, and the arrays of tools and
// materials exist; only text, counts and ranges are checked here.

const blank = (text: string): boolean => text.trim() === "";

const fail = (path: string, message: string): CheckFailure => ({
  check: "completeness",
  path,
  message,
});

export function assessmentCompleteness(draft: AssessmentDraft): CheckFailure[] {
  if (draft.kind === "questions") {
    return [
      ...(draft.missing.some((item) => !blank(item))
        ? []
        : [fail("missing", "a questions draft names what is missing")]),
      ...(draft.questions.some((question) => !blank(question.text))
        ? []
        : [fail("questions", "a questions draft has at least one question with text")]),
    ];
  }
  return [
    ...(blank(draft.summary) ? [fail("summary", "an answer has a summary")] : []),
    ...(draft.options.length === 0 ? [fail("options", "an answer has at least one option")] : []),
    ...draft.options.flatMap((option, o) =>
      option.packages.flatMap((pkg, p) =>
        packageCompleteness(pkg, pathOf(["options", o, "packages", p])),
      ),
    ),
  ];
}

function packageCompleteness(
  pkg: AssessmentDraft["options"][number]["packages"][number],
  at: string,
): CheckFailure[] {
  const failures: CheckFailure[] = [];
  const text: [string, string][] = [
    ["title", pkg.title],
    ["area", pkg.area],
    ["label", pkg.label],
    ["reason", pkg.reason],
    ["handoverBrief", pkg.handoverBrief],
  ];
  for (const [field, value] of text) {
    if (blank(value)) failures.push(fail(`${at}.${field}`, `a package has a ${field}`));
  }
  if (pkg.labelUncertain && !pkg.decidingInformation.some((item) => !blank(item))) {
    failures.push(
      fail(
        `${at}.decidingInformation`,
        "an uncertain label names the information that would change it",
      ),
    );
  }
  if (pkg.label === "diy" || pkg.label === "diy-preparation") {
    if (pkg.guide === undefined) failures.push(fail(`${at}.guide`, "a DIY package has a guide"));
    else failures.push(...guideCompleteness(pkg.guide, `${at}.guide`));
  }
  return failures;
}

function guideCompleteness(
  guide: NonNullable<AssessmentDraft["options"][number]["packages"][number]["guide"]>,
  at: string,
): CheckFailure[] {
  const failures: CheckFailure[] = [];
  if (blank(guide.diagnosis)) failures.push(fail(`${at}.diagnosis`, "a guide has a diagnosis"));
  if (guide.steps.length === 0) failures.push(fail(`${at}.steps`, "a guide has steps"));
  guide.steps.forEach((step, i) => {
    if (step.n !== i + 1) {
      failures.push(
        fail(`${at}.steps[${i}].n`, `steps are numbered 1..n without gaps; expected ${i + 1}`),
      );
    }
    if (blank(step.text)) failures.push(fail(`${at}.steps[${i}].text`, "a step has a text"));
  });
  const { min, max } = guide.estimatedMinutes;
  if (min < 0 || max <= 0 || min > max) {
    failures.push(
      fail(`${at}.estimatedMinutes`, "a guide has a time range with min <= max and max > 0"),
    );
  }
  if (!guide.warnings.some((warning) => !blank(warning))) {
    failures.push(fail(`${at}.warnings`, "a guide has at least one warning"));
  }
  return failures;
}

export function explanationCompleteness(
  draft: ExplanationDraft,
  req: ExplainRequest,
): CheckFailure[] {
  const failures: CheckFailure[] = [];
  for (const { n } of req.steps) {
    if (!draft.steps.some((step) => step.n === n)) {
      failures.push(fail("steps", `step ${n} has no basics`));
    }
  }
  const seen = new Set<number>();
  draft.steps.forEach((step, i) => {
    if (seen.has(step.n))
      failures.push(fail(`steps[${i}].n`, `step ${step.n} has more than one basics`));
    seen.add(step.n);
    if (blank(step.basics)) failures.push(fail(`steps[${i}].basics`, "a basics is not empty"));
  });
  return failures;
}

export function stepAnswerCompleteness(draft: StepAnswerDraft): CheckFailure[] {
  return blank(draft.answer) ? [fail("answer", "an answer is not empty")] : [];
}
