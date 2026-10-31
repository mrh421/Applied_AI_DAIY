import { useState } from "react";

import type { Answer, FollowUpQuestion } from "../case-model";
import { useCaseSession } from "../case-session";
import { Button, Checkbox, Page, TextField, announce } from "../ui-kit";

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
        <section key={q.id} className="grid gap-1">
          <TextField
            label={q.text}
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
      <Button
        label="Confirm"
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
    </>
  );
}

/** The route `/case/$id` while questions are open (EVERYDAY-LANGUAGE-QUESTIONS, REDUNDANT-ENTRY). */
export function QuestionsScreen(p: { caseId: string }) {
  const { session, answer } = useCaseSession(p.caseId);
  const outcome = session?.record.outcome;
  if (!session || outcome?.type !== "questions") {
    return (
      <Page title="Questions">
        <p>There are no open questions for this case.</p>
      </Page>
    );
  }
  return (
    <Page title="A few questions">
      <p>Answer what you can. If you do not know, choose “not sure”.</p>
      <Questions
        key={`${outcome.round}-${outcome.questions.map((q) => q.id).join()}`}
        questions={outcome.questions}
        busy={session.pending !== null}
        onSend={(answers) => {
          announce("Sending your answers.");
          void answer(answers);
        }}
      />
    </Page>
  );
}
