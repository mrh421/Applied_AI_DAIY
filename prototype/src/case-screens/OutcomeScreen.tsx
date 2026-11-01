import type { Notice, WorkPackage } from "../case-model";
import { useCaseSession } from "../case-session";
import { levelFor } from "../profile";
import { Button, Page, StatusBadge, announce } from "../ui-kit";
import { EscalationView } from "./EscalationView";
import { GuideView } from "./GuideView";
import { LABEL_VIEW } from "./labels";

const MARKS: Record<Notice["marks"][number], string> = {
  "check-locally": "Check locally",
  "check-with-manufacturer-or-funding-body": "Check with manufacturer or funding body",
};

async function shareBrief(text: string): Promise<void> {
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
    announce("The task description was copied.");
  } catch {
    announce("The task description could not be shared. Please copy it by hand.");
  }
}

async function copyBrief(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    announce("The task description was copied.");
  } catch {
    announce("The task description could not be copied. Please copy it by hand.");
  }
}

function PackageView(p: {
  pkg: WorkPackage;
  basics: Record<number, string>;
  chosen: boolean;
  onStart: () => void;
}) {
  const { pkg } = p;
  const view = LABEL_VIEW[pkg.label];
  return (
    <section className="grid gap-2 rounded-md border p-3">
      <h3 className="font-medium">{pkg.title}</h3>
      <div>
        <StatusBadge tone={view.tone} icon={view.icon} text={view.text} />
      </div>
      <p>{pkg.reason}</p>
      {pkg.decidingInformation.length > 0 && (
        <div>
          <p>This would change the label:</p>
          <ul className="list-disc pl-5">
            {pkg.decidingInformation.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {pkg.agreeBeforehand && <p>{pkg.agreeBeforehand}</p>}
      {(pkg.label === "professional-only" || pkg.label === "diy-preparation") && (
        <div className="grid gap-2">
          <p>{pkg.handoverBrief}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              label="Copy task description"
              variant="secondary"
              onPress={() => void copyBrief(pkg.handoverBrief)}
            />
            <Button
              label="Share task description"
              variant="secondary"
              onPress={() => void shareBrief(pkg.handoverBrief)}
            />
          </div>
        </div>
      )}
      {pkg.guide && (
        <>
          <GuideView pkg={pkg} level={levelFor(pkg.area)} basics={p.basics} />
          {p.chosen && <Button label={`Start the work: ${pkg.title}`} onPress={p.onStart} />}
        </>
      )}
    </section>
  );
}

/** The route `/case/$id` with an outcome. */
export function OutcomeScreen(p: {
  caseId: string;
  onBack?: () => void;
  onOpenPackage?: (packageId: string) => void;
}) {
  const { session, chooseOption, reassess } = useCaseSession(p.caseId);
  const back = p.onBack ? { back: { label: "Back", onBack: p.onBack } } : {};
  const outcome = session?.record.outcome;
  if (!session || !outcome || outcome.type === "questions") {
    return (
      <Page title="Your answer" {...back}>
        <p>There is no answer for this case yet.</p>
      </Page>
    );
  }
  const record = session.record;
  const stale = session.staleRules && (
    <div className="grid gap-2">
      <p>This plan was made under older safety rules.</p>
      <Button
        label="Assess again"
        onPress={() => void reassess()}
        disabled={session.pending !== null}
      />
    </div>
  );

  if (outcome.type === "escalation") {
    return (
      <Page title="We cannot give instructions for this" {...back}>
        <EscalationView escalation={outcome.escalation} />
      </Page>
    );
  }
  if (outcome.type === "notice") {
    return (
      <Page title="Your answer" {...back}>
        <p>{outcome.notice.text}</p>
      </Page>
    );
  }
  return (
    <Page title="Your answer" {...back}>
      {stale}
      <p>{outcome.summary}</p>
      {outcome.assumptions.length > 0 && (
        <div>
          <h2 className="font-medium">What we assumed</h2>
          <ul className="list-disc pl-5">
            {outcome.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {outcome.options.map((option) => (
        <section key={option.id} className="grid gap-3">
          <h2 className="text-lg font-medium">{option.title}</h2>
          {option.packages.map((pkg) => (
            <PackageView
              key={pkg.id}
              pkg={pkg}
              basics={record.explanations[pkg.id] ?? {}}
              chosen={record.chosenOptionId === option.id}
              onStart={() => p.onOpenPackage?.(pkg.id)}
            />
          ))}
          {record.chosenOptionId !== option.id && (
            <Button
              label={`Choose this option: ${option.title}`}
              disabled={session.pending !== null}
              onPress={() => void chooseOption(option.id)}
            />
          )}
        </section>
      ))}
      {outcome.notices.map((n) => (
        <section key={n.kind} className="grid gap-1 rounded-md border p-3">
          <p>{n.text}</p>
          {n.marks.length > 0 && (
            <p className="text-sm">{n.marks.map((m) => MARKS[m]).join(", ")}</p>
          )}
        </section>
      ))}
    </Page>
  );
}
