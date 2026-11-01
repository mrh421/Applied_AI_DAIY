import type { PackageLabel, WorkPackage } from "../case-model";
import { useCaseSession } from "../case-session";
import { Button, Page, StatusBadge, announce, type IconName } from "../ui-kit";

type Tone = "ok" | "warning" | "danger" | "info";

/** PACKAGE-LABEL, NOT-COLOR-ALONE: every label has a word and an icon besides its tone. */
const LABELS: Record<PackageLabel, { text: string; icon: IconName; tone: Tone }> = {
  diy: { text: "DIY", icon: "CircleCheck", tone: "ok" },
  "diy-preparation": { text: "DIY preparation for a professional", icon: "Info", tone: "info" },
  "professional-only": { text: "Professional only", icon: "TriangleAlert", tone: "warning" },
  "not-recommended": { text: "Not recommended", icon: "CircleX", tone: "danger" },
};

async function copyBrief(brief: string) {
  try {
    await navigator.clipboard.writeText(brief);
    announce("The brief was copied.");
  } catch {
    announce("The brief could not be copied. Select the text and copy it by hand.");
  }
}

async function shareBrief(brief: string) {
  try {
    await navigator.share({ text: brief });
  } catch {
    // The user closed the share sheet; nothing to report.
  }
}

/** HANDOVER-BRIEF: a task description for a professional, to copy or share. */
function HandoverBrief(p: { brief: string }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-medium">Brief for the professional</h3>
      <p>{p.brief}</p>
      <div className="flex flex-wrap gap-2">
        <Button label="Copy brief" variant="secondary" onPress={() => void copyBrief(p.brief)} />
        {typeof navigator.share === "function" && (
          <Button
            label="Share brief"
            variant="secondary"
            onPress={() => void shareBrief(p.brief)}
          />
        )}
      </div>
    </div>
  );
}

function PackageCard(p: { pkg: WorkPackage }) {
  const { pkg } = p;
  const label = LABELS[pkg.label];
  return (
    <section role="group" aria-label={pkg.title} className="grid gap-2 rounded-md border p-3">
      <h2 className="text-lg font-medium">{pkg.title}</h2>
      <div>
        <StatusBadge tone={label.tone} icon={label.icon} text={label.text} />
      </div>
      <p>{pkg.reason}</p>
      {pkg.decidingInformation.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">This would change the label</h3>
          <ul className="list-disc pl-5">
            {pkg.decidingInformation.map((info) => (
              <li key={info}>{info}</li>
            ))}
          </ul>
        </div>
      )}
      {pkg.label === "diy-preparation" && pkg.agreeBeforehand && <p>{pkg.agreeBeforehand}</p>}
      {pkg.label === "professional-only" && <HandoverBrief brief={pkg.handoverBrief} />}
    </section>
  );
}

/** The route `/case/$id` with an outcome. */
export function OutcomeScreen(p: { caseId: string }) {
  const { session } = useCaseSession(p.caseId);
  const outcome = session?.record.outcome;
  if (outcome?.type !== "guidance") {
    return (
      <Page title="Your plan">
        <p>There is no plan for this case yet.</p>
      </Page>
    );
  }
  return (
    <Page title="Your plan">
      <p>{outcome.summary}</p>
      {outcome.assumptions.length > 0 && (
        <div>
          <h2 className="text-lg font-medium">What we assumed</h2>
          <ul className="list-disc pl-5">
            {outcome.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {outcome.options.map((option) => (
        <section key={option.id} className="grid gap-3">
          <h2 className="text-xl font-semibold">{option.title}</h2>
          {option.packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </section>
      ))}
    </Page>
  );
}
