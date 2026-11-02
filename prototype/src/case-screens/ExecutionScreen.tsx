import { useState } from "react";

import type { StepAnswerOutcome } from "../case-model";
import { useCaseSession } from "../case-session";
import { Button, Card, Checkbox, Icon, Page, Progress, TextField, announce, cn } from "../ui-kit";
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
  // The step a request is running for, and what went wrong with an explanation: both are shown at the step.
  const [working, setWorking] = useState<{ n: number; what: "explain" | "question" } | null>(null);
  const [explainNotes, setExplainNotes] = useState<Record<number, string>>({});
  const back = p.onBack ? { back: { label: "Back", onBack: p.onBack } } : {};

  const outcome = session?.record.outcome;
  // The chosen option first: cases stored before the ids were made unique may repeat an id across options.
  const options = outcome?.type === "guidance" ? outcome.options : [];
  const chosen = options.find((o) => o.id === session?.record.chosenOptionId) ?? options[0];
  const pkg =
    chosen?.packages.find((x) => x.id === p.packageId) ??
    options.flatMap((o) => o.packages).find((x) => x.id === p.packageId);
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

  const total = pkg.guide.steps.length;
  const pct = total === 0 ? 0 : Math.round((done.length / total) * 100);

  return (
    <Page title={pkg.title} {...back}>
      <Card className="grid gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl">Step by step</h2>
          <p className="text-sm text-muted-foreground">
            {done.length} of {total} done
          </p>
        </div>
        <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        {current === undefined && <p>All steps are done.</p>}
        <ol aria-label="Steps" className="grid gap-3">
          {pkg.guide.steps.map((s) => {
            const isDone = done.includes(s.n);
            return (
              <li
                key={s.n}
                className={cn(
                  "grid gap-2 rounded-2xl border bg-card p-4",
                  s.n === current ? "border-primary" : "border-border",
                )}
              >
                {s.n === current && (
                  <strong className="text-sm text-primary">Current step: {s.n}</strong>
                )}
                <div className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-sm",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {isDone ? <Icon name="Check" /> : s.n}
                  </span>
                  <span
                    className={cn("min-w-0 flex-1", isDone && "text-muted-foreground line-through")}
                  >
                    {s.text}
                  </span>
                </div>
                <Checkbox
                  label={`Done: step ${s.n}`}
                  checked={isDone}
                  onChange={(v) => checkStep(pkg.id, s.n, v)}
                />
                {basics[s.n] && (
                  <p className="rounded-lg bg-secondary/60 p-3 text-sm">
                    <span className="font-semibold">In simple words: </span>
                    <span>{basics[s.n]}</span>
                  </p>
                )}
                <div>
                  <Button
                    label={`Explain step ${s.n} again`}
                    icon="RotateCcw"
                    variant="secondary"
                    disabled={busy}
                    onPress={() => {
                      announce("Explaining the step again.");
                      setExplainNotes((x) => ({ ...x, [s.n]: "" }));
                      setWorking({ n: s.n, what: "explain" });
                      const fail = (text: string) => {
                        announce(text);
                        setExplainNotes((x) => ({ ...x, [s.n]: text }));
                      };
                      void reExplain(pkg.id, s.n)
                        .then((out) => {
                          if (out.type === "notice") fail(out.notice.text);
                        })
                        .catch(() => fail("The step could not be explained. Please try again."))
                        .finally(() => setWorking(null));
                    }}
                  />
                </div>
                {working?.n === s.n && working.what === "explain" && (
                  <Progress messages={["Explaining the step in simpler words…", "Almost there…"]} />
                )}
                {explainNotes[s.n] && (
                  <p role="alert" className="rounded-xl border border-warning/40 bg-warning/10 p-3">
                    {explainNotes[s.n]}
                  </p>
                )}
                <TextField
                  label={`Question about step ${s.n}`}
                  value={questions[s.n] ?? ""}
                  onChange={(v) => setQuestions((q) => ({ ...q, [s.n]: v }))}
                />
                <div>
                  <Button
                    label={`Ask about step ${s.n}`}
                    icon="MessageCircle"
                    variant="secondary"
                    disabled={busy || !(questions[s.n] ?? "").trim()}
                    onPress={() => {
                      announce("Asking your question.");
                      setWorking({ n: s.n, what: "question" });
                      void askStep(pkg.id, s.n, (questions[s.n] ?? "").trim())
                        .then((out) => setAnswers((a) => ({ ...a, [s.n]: out })))
                        .finally(() => setWorking(null));
                    }}
                  />
                </div>
                {working?.n === s.n && working.what === "question" && (
                  <Progress messages={["Looking at your question…", "Almost there…"]} />
                )}
                {answers[s.n] && <Answer outcome={answers[s.n]!} />}
              </li>
            );
          })}
        </ol>
      </Card>
    </Page>
  );
}
