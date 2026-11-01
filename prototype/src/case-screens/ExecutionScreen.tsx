import { useState } from "react";

import type { StepAnswerOutcome } from "../case-model";
import { useCaseSession } from "../case-session";
import { Button, Checkbox, Page, TextField, announce } from "../ui-kit";
import { EscalationView } from "./EscalationView";

function Answer(p: { outcome: StepAnswerOutcome }) {
  const o = p.outcome;
  if (o.type === "answer") return <p>{o.text}</p>;
  if (o.type === "escalation") return <EscalationView escalation={o.escalation} />;
  return <p>{o.notice.text}</p>;
}

/** The route `/case/$id/work/$packageId`: the steps of one package, one at a time. */
export function ExecutionScreen(p: { caseId: string; packageId: string; onBack?: () => void }) {
  const { session, checkStep, reExplain, askStep } = useCaseSession(p.caseId);
  const [questions, setQuestions] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, StepAnswerOutcome>>({});
  const back = p.onBack ? { back: { label: "Back", onBack: p.onBack } } : {};

  const outcome = session?.record.outcome;
  const pkg =
    outcome?.type === "guidance"
      ? outcome.options.flatMap((o) => o.packages).find((x) => x.id === p.packageId)
      : undefined;
  if (!session || !pkg?.guide) {
    return (
      <Page title="The work" {...back}>
        <p>There are no steps for this package.</p>
      </Page>
    );
  }
  const record = session.record;
  const done = record.checked[pkg.id] ?? [];
  const basics = record.explanations[pkg.id] ?? {};
  const current = pkg.guide.steps.find((s) => !done.includes(s.n))?.n;
  const busy = session.pending !== null;

  return (
    <Page title={pkg.title} {...back}>
      {current === undefined && <p>All steps are done.</p>}
      <ol aria-label="Steps" className="grid list-decimal gap-4 pl-5">
        {pkg.guide.steps.map((s) => (
          <li key={s.n} className="grid gap-2">
            {s.n === current && <strong>Current step: {s.n}</strong>}
            <span>{s.text}</span>
            <Checkbox
              label={`Done: step ${s.n}`}
              checked={done.includes(s.n)}
              onChange={(v) => checkStep(pkg.id, s.n, v)}
            />
            {basics[s.n] && <p className="text-sm">{basics[s.n]}</p>}
            <div>
              <Button
                label={`Explain step ${s.n} again`}
                variant="secondary"
                disabled={busy}
                onPress={() => {
                  announce("Explaining the step again.");
                  void reExplain(pkg.id, s.n).then((out) => {
                    if (out.type === "notice") announce(out.notice.text);
                  });
                }}
              />
            </div>
            <TextField
              label={`Question about step ${s.n}`}
              value={questions[s.n] ?? ""}
              onChange={(v) => setQuestions((q) => ({ ...q, [s.n]: v }))}
            />
            <div>
              <Button
                label={`Ask about step ${s.n}`}
                variant="secondary"
                disabled={busy || !(questions[s.n] ?? "").trim()}
                onPress={() => {
                  announce("Asking your question.");
                  void askStep(pkg.id, s.n, (questions[s.n] ?? "").trim()).then((out) =>
                    setAnswers((a) => ({ ...a, [s.n]: out })),
                  );
                }}
              />
            </div>
            {answers[s.n] && <Answer outcome={answers[s.n]!} />}
          </li>
        ))}
      </ol>
    </Page>
  );
}
