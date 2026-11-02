import { useState } from "react";

import type { Answer, FollowUpQuestion } from "../case-model";
import { useCaseSession } from "../case-session";
import {
  Button,
  Card,
  Checkbox,
  Eyebrow,
  Icon,
  Page,
  Progress,
  TextField,
  announce,
} from "../ui-kit";

type Entry = { text: string; notSure: boolean };

function Questions(p: {
  questions: FollowUpQuestion[];
  busy: boolean;
  onSend: (answers: Answer[]) => void;
}) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const entry = (q: FollowUpQuestion): Entry =>
    entries[q.id] ?? { text: q.prefill ?? "", notSure: false };
  const set = (q: FollowUpQuestion, patch: Partial<Entry>) =>
    setEntries((all) => ({ ...all, [q.id]: { ...entry(q), ...patch } }));

  return (
    <>
      {p.questions.map((q) => (
        <section key={q.id} className="grid gap-2">
          <TextField
            label={q.text}
            placeholder="Your answer (or “not sure”)"
            value={entry(q).notSure ? "" : entry(q).text}
            onChange={(text) => set(q, { text, notSure: false })}
          />
          {q.termExplanations.length > 0 && (
            <ul className="text-sm">
              {q.termExplanations.map((t) => (
                <li key={t.term}>
                  <strong>{t.term}</strong>: {t.explanation}
                </li>
              ))}
            </ul>
          )}
          <Checkbox
            label={`Not sure: ${q.text}`}
            checked={entry(q).notSure}
            onChange={(notSure) => set(q, { notSure })}
          />
        </section>
      ))}
      <div>
        <Button
          label="Continue"
          disabled={p.busy}
          onPress={() =>
            p.onSend(
              p.questions.map((q) => ({
                questionId: q.id,
                topic: q.topic,
                text: entry(q).notSure ? "" : entry(q).text.trim(),
                notSure: entry(q).notSure,
              })),
            )
          }
        />
      </div>
      {p.busy && (
        <Progress
          messages={[
            "Thank you, reading your answers…",
            "Checking for risks again…",
            "Drafting your plan…",
          ]}
        />
      )}
    </>
  );
}

/** The route `/case/$id` while questions are open (EVERYDAY-LANGUAGE-QUESTIONS, REDUNDANT-ENTRY). */
export function QuestionsScreen(p: { caseId: string }) {
  const { session, answer } = useCaseSession(p.caseId);
  const [notice, setNotice] = useState<string | null>(null);
  const outcome = session?.record.outcome;
  if (!session || outcome?.type !== "questions") {
    return (
      <Page title="Questions">
        <p>There are no open questions for this case.</p>
      </Page>
    );
  }
  return (
    <Page title="A few quick questions" hideTitle>
      <Card tone="soft">
        <Eyebrow>Your problem</Eyebrow>
        <p className="mt-1 text-lg">{session.record.description}</p>
      </Card>
      <Card className="grid gap-5">
        <h1 className="flex items-center gap-2 text-2xl">
          <span className="text-primary">
            <Icon name="CircleHelp" />
          </span>{" "}
          A few quick questions
        </h1>
        <p className="text-muted-foreground">
          So we don't guess — your answers make the advice safer and more accurate. If you do not
          know, choose “not sure”.
        </p>
        <Questions
          key={`${outcome.round}-${outcome.questions.map((q) => q.id).join()}`}
          questions={outcome.questions}
          busy={session.pending !== null}
          onSend={(answers) => {
            announce("Sending your answers.");
            setNotice(null);
            // A notice (timeout, rejected draft) must not vanish: the user stays here and can send again.
            const fail = (text: string) => {
              announce(text);
              setNotice(text);
            };
            void answer(answers).then(
              (out) => {
                if (out.type === "notice") fail(out.notice.text);
              },
              () => fail("Your answers could not be saved on this device. Please try again."),
            );
          }}
        />
        {notice && (
          <p role="alert" className="rounded-xl border border-warning/40 bg-warning/10 p-4">
            {notice} You can press “Continue” to try again.
          </p>
        )}
      </Card>
    </Page>
  );
}
