import { illustration } from "../illustrations";
import { detectHazards } from "../hazard-precheck";
import type {
  AssessmentDraft,
  ExplainRequest,
  ExplanationDraft,
  StepAnswerDraft,
} from "../case-model";
import { pathOf, type CheckFailure } from "./format";

// OUTPUT-PROHIBITED-PATH-CHECK: path rules and the prohibited-claim patterns.

export type ProhibitedClaim = {
  id: string;
  requirements: string[];
  en: RegExp;
  de: RegExp;
  /** A sentence that matches this is a near miss: it denies the claim or names a professional. */
  unless?: { en: RegExp; de: RegExp };
};

const NEGATION_EN = /\bnot\b|\bnever\b|\bcannot\b|n['’]t\b/i;
const NEGATION_DE = /\b(?:nicht|nie|niemals|keinesfalls)\b/i;

const ISOLATE_EN =
  "(?:switch(?:ing)? off|turn(?:ing)? off|shut(?:ting)? off|unplug(?:ging)?|isolat(?:e|ing)|disconnect(?:ing)?|cut(?:ting)? (?:off )?the power)";
const ISOLATE_DE =
  "(?:aus(?:zu)?schalten|ab(?:zu)?schalten|(?:aus|ab)zustecken|trennen|freischalten|freizuschalten|spannungsfrei|ziehen)";
const HOUSING_EN =
  "(?:distribution\\s+board|fuse\\s+box|consumer\\s+unit|breaker\\s+box|electrical\\s+panel|mains\\s+(?:housing|unit|box))";
const HOUSING_DE =
  "(?:verteilerkasten|sicherungskasten|schaltschrank|zählerschrank|stromverteiler|unterverteilung|hausverteilung|verteilerschrank|netzteilgehäuse|gehäuse des netzteils|netzgerät)";
const PROFESSIONAL_EN = /\b(?:qualified |licensed |certified )?(?:electrician|professional)s?\b/i;
const PROFESSIONAL_DE = /elektriker|elektrofachkraft|fachkraft|fachbetrieb/i;

/** A closed table: a new pattern is a new row, not a new function. */
export const PROHIBITED_CLAIMS: readonly ProhibitedClaim[] = [
  {
    id: "breaker-alone",
    requirements: ["NO-BREAKER-ONLY-ISOLATION"],
    en: /\b(?:circuit breaker|breaker|fuse)\b[^.]{0,40}\b(?:alone|is enough|is sufficient|suffices)\b|\b(?:just|only|simply)\s+(?:switch(?:ing)?|turn(?:ing)?)\s+off\s+(?:the\s+)?(?:circuit breaker|breaker|fuse)\b/i,
    de: /\b(?:sicherung|leitungsschutzschalter|sicherungsautomat|ls-schalter)\b[^.]{0,40}\b(?:allein|alleine|reicht|genügt|ausreichend)|\b(?:nur|einfach)\s+(?:die\s+)?(?:sicherung|leitungsschutzschalter|sicherungsautomat)\b/i,
    unless: { en: NEGATION_EN, de: NEGATION_DE },
  },
  {
    id: "permit-free",
    requirements: ["PERMIT-FREE-NOT-RULE-FREE"],
    en: /\b(?:permit[- ]free|exempt from (?:a |the )?(?:building )?permit|(?:needs?|requires?) no (?:building )?permit|no (?:building )?permit is (?:needed|required|necessary))\b[^.]{0,80}?\b(?:no other (?:rules|requirements|regulations|laws)|(?:free|exempt) (?:of|from) (?:all |any |the )?(?:other|further) (?:rules|requirements|regulations|laws)|no (?:further|more) (?:rules|requirements|regulations)|nothing else (?:applies|to (?:check|consider|observe))|ignore (?:all |any )?(?:other|further) (?:rules|requirements|regulations))/i,
    de: /(?:genehmigungsfrei|verfahrensfrei|keine (?:bau)?genehmigung (?:nötig|notwendig|erforderlich))[^.]{0,80}?(?:keine (?:weiteren|anderen|sonstigen) (?:vorschriften|regeln|anforderungen|auflagen|gesetze)|frei von (?:allen |weiteren |anderen )(?:vorschriften|regeln|anforderungen)|nichts weiter zu beachten|alles erlaubt)/i,
    unless: { en: NEGATION_EN, de: NEGATION_DE },
  },
  {
    id: "co2-without-source",
    requirements: ["SUSTAINABILITY-EXPLAINED"],
    en: /\d[\d.,]*\s*(?:kg|g|t|tonnes?|tons?)?\s*(?:of\s+)?CO(?:₂|2)(?!\w)|\bCO(?:₂|2)[^.]{0,30}\d/i,
    de: /\d[\d.,]*\s*(?:kg|g|t|tonnen?)?\s*CO(?:₂|2)(?!\w)|\bCO(?:₂|2)-?(?:einsparung|ersparnis|äquivalente?)[^.]{0,30}\d/i,
    unless: {
      en: /\bsource\b|according to|based on|https?:\/\//i,
      de: /quelle|laut |gemäß|nach angaben|https?:\/\//i,
    },
  },
  {
    id: "skip-by-skill",
    requirements: ["SKILL-DOES-NOT-UNLOCK"],
    en: /\b(?:experienced|advanced|skilled|expert|seasoned)\s+(?:users?|diyers?|people|hobbyists|handymen)\s+(?:can|may|could)\s+(?:safely\s+)?(?:skip|omit|leave out|ignore|shorten)|\b(?:can|may|could)\s+(?:safely\s+)?(?:skip|omit|leave out|ignore)\s+(?:this|the|these|any)\s+(?:warnings?|safety\s+\w+|precautions?)|\b(?:skip|omit|ignore)\s+(?:the\s+)?(?:warnings?|safety\s+(?:steps?|measures?|precautions?))|\b(?:warnings?|safety\s+(?:steps?|measures?))\s+(?:is|are)\s+optional|\b(?:warnings?|safety\s+(?:steps?|measures?))\s+(?:can|may)\s+be\s+(?:skipped|omitted|left out|shortened)/i,
    de: /erfahren\w*\s+(?:nutzer\w*|anwender\w*|heimwerker\w*|personen|menschen)\s+(?:können|dürfen|kann|darf)\s[^.]{0,40}?(?:überspringen|weglassen|auslassen|ignorieren|kürzen)|(?:kannst|können|darfst|dürfen|kann|darf)\s+(?:du\s+|sie\s+)?(?:die|den|diese[ns]?)?\s*(?:warnhinweis\w*|warnung\w*|sicherheits\w+)\s+(?:überspringen|weglassen|auslassen|ignorieren)|(?:warnhinweis\w*|warnungen?|sicherheitsschritt\w*|sicherheitsmaßnahmen?)\s+(?:sind|ist)\s+optional/i,
    unless: { en: NEGATION_EN, de: NEGATION_DE },
  },
  {
    id: "no-need-to-isolate",
    requirements: ["UNPLUG-BEFORE-OPENING", "NO-BREAKER-ONLY-ISOLATION"],
    en: new RegExp(
      `\\b(?:(?:there is |there's )?no need|(?:you )?(?:do not|don['’]t) (?:have|need) to|(?:you )?needn['’]t|(?:it is|it['’]s) not necessary)\\s+(?:to\\s+)?${ISOLATE_EN}`,
      "i",
    ),
    de: new RegExp(
      `(?:kein bedarf|keine notwendigkeit|nicht (?:nötig|notwendig|erforderlich))[^.]{0,40}?${ISOLATE_DE}|(?:musst|müssen|brauchst|brauchen)[^.]{0,40}?\\bnichts?\\b[^.]{0,30}?${ISOLATE_DE}`,
      "i",
    ),
  },
  {
    id: "open-mains-housing",
    requirements: ["NO-OPENING-MAINS-HOUSINGS"],
    en: new RegExp(
      `\\b(?:open(?:ing)?(?:\\s+up)?|unscrew|remove\\s+the\\s+(?:cover|lid)\\s+(?:of|from))\\s+(?:the|your|a|this)\\s+${HOUSING_EN}\\b`,
      "i",
    ),
    de: new RegExp(
      `(?:öffne\\w*|öffnen|aufschrauben|aufmachen)\\s+(?:den|die|das|deinen|euren|diesen|diese)?\\s*${HOUSING_DE}|${HOUSING_DE}[^.]{0,20}?(?:öffne\\w*|öffnen|aufschrauben|aufmachen)`,
      "i",
    ),
    unless: {
      en: new RegExp(`${NEGATION_EN.source}|${PROFESSIONAL_EN.source}`, "i"),
      de: new RegExp(`${NEGATION_DE.source}|${PROFESSIONAL_DE.source}`, "i"),
    },
  },
];

const SENTENCES = /(?<=[.!?;])\s+|\n+/;

/** The rows of the table that a text matches, in table order. Rows are judged per sentence. */
export function findProhibitedClaims(text: string): ProhibitedClaim[] {
  const sentences = text.split(SENTENCES);
  return PROHIBITED_CLAIMS.filter((row) =>
    sentences.some(
      (sentence) =>
        (row.en.test(sentence) || row.de.test(sentence)) &&
        !(row.unless?.en.test(sentence) || row.unless?.de.test(sentence)),
    ),
  );
}

/** Every string of a value with its path. */
function strings(value: unknown, path: (string | number)[] = []): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path: pathOf(path), text: value }];
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, [...path, i]));
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => strings(item, [...path, key]));
  }
  return [];
}

function claimFailures(value: unknown): CheckFailure[] {
  return strings(value).flatMap(({ path, text }) =>
    findProhibitedClaims(text).map((row) => ({
      check: "prohibited-path" as const,
      path,
      message: `prohibited claim (${row.requirements.join(", ")}): ${row.id}`,
    })),
  );
}

const noGuide = (label: string): boolean =>
  label === "professional-only" || label === "not-recommended";

export function assessmentProhibited(draft: AssessmentDraft, round: 0 | 1 | 2): CheckFailure[] {
  const failures: CheckFailure[] = [];
  if (round === 2 && (draft.kind === "questions" || draft.questions.length > 0)) {
    failures.push({
      check: "prohibited-path",
      path: "questions",
      message: "no questions at round 2",
    });
  }
  draft.options.forEach((option, o) =>
    option.packages.forEach((pkg, p) => {
      const at = pathOf(["options", o, "packages", p]);
      if (pkg.guide !== undefined && noGuide(pkg.label)) {
        failures.push({
          check: "prohibited-path",
          path: `${at}.guide`,
          message: `a ${pkg.label} package has no guide`,
        });
      }
      pkg.guide?.steps.forEach((step, s) =>
        step.imageIds.forEach((id, i) => {
          if (illustration(id) === undefined) {
            failures.push({
              check: "prohibited-path",
              path: `${at}.guide.steps[${s}].imageIds[${i}]`,
              message: `unknown image id ${id}`,
            });
          }
        }),
      );
    }),
  );
  return [...failures, ...claimFailures(draft)];
}

export function explanationProhibited(
  draft: ExplanationDraft,
  req: ExplainRequest,
): CheckFailure[] {
  const requested = new Set(req.steps.map((step) => step.n));
  const unrequested = draft.steps.flatMap((step, i) =>
    requested.has(step.n)
      ? []
      : [
          {
            check: "prohibited-path" as const,
            path: `steps[${i}].n`,
            message: `step ${step.n} was not requested`,
          },
        ],
  );
  return [...unrequested, ...claimFailures(draft)];
}

export function stepAnswerProhibited(draft: StepAnswerDraft): CheckFailure[] {
  const hazards = detectHazards(draft.answer);
  return [
    ...(hazards.length > 0
      ? [
          {
            check: "prohibited-path" as const,
            path: "answer",
            message: `the answer touches a hazard: ${hazards.join(", ")}`,
          },
        ]
      : []),
    ...claimFailures({ answer: draft.answer }),
  ];
}
