import { useEffect } from "react";

import type { Escalation, SolutionOption, WorkPackage } from "../case-model";
import { useCaseSession } from "../case-session";
import { levelFor } from "../profile";
import { Button, Page } from "../ui-kit";
import { GuideView } from "./GuideView";

function EscalationView(p: { escalation: Escalation }) {
  const { escalation } = p;
  return (
    <>
      <p>Risk: {escalation.risk}</p>
      <p>{escalation.reason}</p>
      <h3 className="font-medium">What to do now</h3>
      <ul className="list-disc pl-5">
        {escalation.actions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <h3 className="font-medium">Who to contact</h3>
      <ul className="list-disc pl-5">
        {escalation.professionals.map((pro) => (
          <li key={pro}>{pro}</li>
        ))}
      </ul>
    </>
  );
}

function PackageView(p: { pkg: WorkPackage; basics: Record<number, string> | undefined }) {
  const { pkg } = p;
  return (
    <section className="grid gap-2">
      <h3 className="font-medium">{pkg.title}</h3>
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

  return (
    <Page title="Your plan">
      <p>{outcome.summary}</p>
      {outcome.assumptions.length > 0 && (
        <section>
          <h3 className="font-medium">Assumptions</h3>
          <ul className="list-disc pl-5">
            {outcome.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}
      {outcome.options.length > 1 && (
        <section className="grid gap-1">
          <h3 className="font-medium">Options</h3>
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
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">{shown.title}</h2>
          {loading && <p>Explanations are being prepared.</p>}
          {noBasics && <p>Explanations are not available right now. The steps are complete.</p>}
          {shown.packages.map((pkg) => (
            <PackageView key={pkg.id} pkg={pkg} basics={explanations[pkg.id]} />
          ))}
        </section>
      )}
    </Page>
  );
}
