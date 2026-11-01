import type { WorkPackage } from "../../../src/case-model";
import { answerDraft, diyPackage, questionsDraft } from "../../../src/case-pipeline/fixtures";
import type { Reply } from "./server";

// What the stub answers to the system tests, chosen by what the request contains: the kind of
// task by the fields of its schema, the scenario by a marker in the description.

const professionalPackage: WorkPackage = {
  id: "p2",
  title: "Repaint the high ceiling",
  area: "walls-and-floors",
  label: "professional-only",
  reason: "Work at height needs a scaffold and a second person.",
  labelUncertain: false,
  decidingInformation: [],
  handoverBrief: "Repaint the bathroom ceiling, 3 metres high, after the tap is repaired.",
  flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: false },
};

const projectDraft = {
  ...answerDraft,
  summary: "A kitchen tap drips and the bathroom ceiling needs repainting.",
  options: [
    {
      id: "o1",
      kind: "repair" as const,
      title: "Repair both",
      packages: [diyPackage, professionalPackage],
    },
  ],
};

const explanationFor = (body: string) => {
  const steps = body.slice(body.indexOf("Steps:"));
  const numbers = [...steps.matchAll(/\\n(\d+)\. /g)].map((m) => Number(m[1]));
  return { steps: numbers.map((n) => ({ n, basics: `Basics of step ${n}: take your time.` })) };
};

const text = (draft: unknown): Reply => ({ status: 200, text: JSON.stringify(draft) });

export function respond(body: string): Reply {
  if (body.includes('"photoDescription"')) {
    if (body.includes("PROJECT")) return text(projectDraft);
    const round = Number(/Question round: (\d)/.exec(body)?.[1] ?? "0");
    return text(round === 0 ? questionsDraft : answerDraft);
  }
  if (body.includes('"basics"')) return text(explanationFor(body));
  return text({ answer: "Turn the cap slowly with a cloth around it.", risk: "low", hazards: [] });
}
