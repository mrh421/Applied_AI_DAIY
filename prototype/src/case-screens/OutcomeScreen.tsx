import { useEffect } from "react";

import type { PackageLabel, SolutionOption, WorkPackage } from "../case-model";
import { useCaseSession } from "../case-session";
import { levelFor } from "../profile";
import { Button, Card, Eyebrow, Icon, Page, StatusBadge, announce, type IconName } from "../ui-kit";
import { EscalationView } from "./EscalationView";
import { GuideView } from "./GuideView";

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
      <h4 className="text-sm font-medium">Brief for the professional</h4>
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

function PackageView(p: { pkg: WorkPackage; basics: Record<number, string> | undefined }) {
  const { pkg } = p;
  const label = LABELS[pkg.label];
  return (
    <section role="group" aria-label={pkg.title} className="grid gap-4">
      <div className="grid gap-2 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge tone={label.tone} icon={label.icon} text={label.text} />
          <h3 className="font-sans text-base font-semibold">{pkg.title}</h3>
        </div>
        <p>{pkg.reason}</p>
        {pkg.decidingInformation.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <h4 className="font-sans font-medium">This would change the label</h4>
            <ul className="list-disc pl-5">
              {pkg.decidingInformation.map((info) => (
                <li key={info}>{info}</li>
              ))}
            </ul>
          </div>
        )}
        {pkg.label === "diy-preparation" && pkg.agreeBeforehand && <p>{pkg.agreeBeforehand}</p>}
        {pkg.label === "professional-only" && <HandoverBrief brief={pkg.handoverBrief} />}
      </div>
      {pkg.guide && <GuideView guide={pkg.guide} level={levelFor(pkg.area)} basics={p.basics} />}
    </section>
  );
}

/** The route `/case/$id` with an outcome (PROBLEM-SUMMARY, ESCALATION-REASON, UNDERSTANDABLE-ERROR-NOTICE). */
export function OutcomeScreen(p: { caseId: string }) {
  const { session, chooseOption } = useCaseSession(p.caseId);
  const outcome = session?.record.outcome;
  const guidance = outcome?.type === "guidance" ? outcome : null;
  const chosenId = session?.record.chosenOptionId ?? null;
  const firstId = guidance?.options[0]?.id;

  // The first option is the one shown at once; its basics are requested when none was chosen yet.
  useEffect(() => {
    if (firstId && chosenId === null) void chooseOption(firstId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstId, chosenId]);

  if (!session || !outcome || outcome.type === "questions") {
    return (
      <Page title="Result">
        <p>There is no result for this case yet.</p>
      </Page>
    );
  }
  if (outcome.type === "notice") {
    return (
      <Page title="Notice">
        <p>{outcome.notice.text}</p>
      </Page>
    );
  }
  if (outcome.type === "escalation") {
    return (
      <Page title="Please get professional help">
        <EscalationView escalation={outcome.escalation} />
      </Page>
    );
  }

  const shown: SolutionOption | undefined =
    outcome.options.find((o) => o.id === chosenId) ?? outcome.options[0];
  const explanations = session.record.explanations;
  const loading = session.pending === "explain";
  const hasGuide = shown?.packages.some((pkg) => pkg.guide) ?? false;
  const noBasics =
    hasGuide && !loading && !shown?.packages.some((pkg) => explanations[pkg.id] !== undefined);

  const localNotices = outcome.notices.filter((n) => n.marks.includes("check-locally"));

  return (
    <Page title="Your plan" hideTitle>
      <h1 className="sr-only">Your plan</h1>
      <Card tone="soft">
        <Eyebrow>Your problem</Eyebrow>
        <p className="mt-1 text-lg">{outcome.summary}</p>
        {outcome.assumptions.length > 0 && (
          <section className="mt-3 text-sm text-muted-foreground">
            <h2 className="font-sans font-semibold">Assumptions</h2>
            <ul className="list-disc pl-5">
              {outcome.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        )}
      </Card>
      {outcome.options.length > 1 && (
        <section className="grid gap-2">
          <h2 className="font-sans font-semibold">Options</h2>
          {outcome.options.map((o) =>
            o.id === shown?.id ? (
              <p key={o.id}>{o.title} (shown)</p>
            ) : (
              <Button
                key={o.id}
                label={`Show: ${o.title}`}
                variant="secondary"
                onPress={() => void chooseOption(o.id)}
              />
            ),
          )}
        </section>
      )}
      {shown && (
        <Card className="grid gap-4">
          <div>
            <h2 className="text-2xl">Who does what</h2>
            <p className="mt-1 text-muted-foreground">
              Your skill level changes how detailed the help is — never which work needs a
              professional.
            </p>
            <p className="mt-3 font-semibold">{shown.title}</p>
          </div>
          {loading && <p>Explanations are being prepared.</p>}
          {noBasics && <p>Explanations are not available right now. The steps are complete.</p>}
          {shown.packages.map((pkg) => (
            <PackageView key={pkg.id} pkg={pkg} basics={explanations[pkg.id]} />
          ))}
        </Card>
      )}
      {localNotices.length > 0 && (
        <Card tone="soft">
          <h2 className="flex items-center gap-2 text-xl">
            <span className="text-primary">
              <Icon name="CircleHelp" />
            </span>{" "}
            Check locally
          </h2>
          <p className="mt-1 text-muted-foreground">
            These rules depend on where you live — we can't confirm them for you.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {localNotices.map((n) => (
              <li key={n.text}>{n.text}</li>
            ))}
          </ul>
        </Card>
      )}
    </Page>
  );
}
