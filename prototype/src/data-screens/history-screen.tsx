import { useState } from "react";

import { saveCase, useHistory, type CaseRecord } from "../history";
import { activeOption, guidesOf, quantity } from "../materials-screens";
import { Button, LinkButton, Page, StatusBadge, TextField, announce } from "../ui-kit";

function Record({ record, onBack }: { record: CaseRecord; onBack: () => void }) {
  const [notes, setNotes] = useState(record.notes);
  const option = activeOption(record);
  const packages = option?.packages.filter((p) => p.guide) ?? [];
  const outcomeType = record.outcome?.type;
  const completed = record.status === "completed";
  const base = `/case/${record.id}`;

  const save = () => {
    saveCase({ ...record, notes });
    announce("Notes saved.");
  };

  return (
    <Page title="Your case" back={{ label: "Back to history", onBack }}>
      <p>{record.description}</p>
      <nav aria-label="Continue or read again" className="flex flex-wrap gap-2">
        {outcomeType === "questions" && (
          <LinkButton label="Continue with the questions" href={base} />
        )}
        {outcomeType === "guidance" && <LinkButton label="Read the plan again" href={base} />}
        {outcomeType === "escalation" && <LinkButton label="Read the advice again" href={base} />}
        {outcomeType === "guidance" && (
          <LinkButton label="Materials and tools" href={`${base}/materials`} />
        )}
        {packages.map((p) => (
          <LinkButton
            key={p.id}
            label={`${completed ? "Read the steps again" : "Continue the work"}: ${p.title}`}
            href={`${base}/work/${encodeURIComponent(p.id)}`}
          />
        ))}
      </nav>
      <h2 className="text-xl font-semibold">Steps</h2>
      {packages.length === 0 ? (
        <p>This case has no steps yet.</p>
      ) : (
        packages.map((p) => {
          const steps = p.guide?.steps ?? [];
          const done = record.checked[p.id] ?? [];
          return (
            <section key={p.id} className="grid gap-1">
              <h3 className="font-semibold">
                {p.title}: {done.length} of {steps.length} steps done
              </h3>
              <ol className="grid list-decimal gap-1 pl-6">
                {steps.map((s) => (
                  <li key={s.n}>
                    {s.text}
                    {done.includes(s.n) ? " (done)" : ""}
                  </li>
                ))}
              </ol>
            </section>
          );
        })
      )}
      <h2 className="text-xl font-semibold">Materials used</h2>
      {record.materialsUsed.length === 0 ? (
        <p>No materials were used.</p>
      ) : (
        <ul className="grid gap-1">
          {record.materialsUsed.map((m, i) => (
            <li key={i}>
              {m.name}: {quantity(m.quantity)}
            </li>
          ))}
        </ul>
      )}
      <TextField label="Notes" value={notes} onChange={setNotes} multiline />
      <div>
        <Button label="Save notes" onPress={save} />
      </div>
    </Page>
  );
}

/** Ongoing and completed cases. A case can be picked up again or read again; the notes are edited here (UC-016, UC-021). */
export function HistoryScreen() {
  const cases = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = cases.find((c) => c.id === openId);

  if (open) return <Record record={open} onBack={() => setOpenId(null)} />;

  return (
    <Page title="Your history">
      {cases.length === 0 && <p>You have no cases yet.</p>}
      <ul className="grid gap-3">
        {cases.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2">
            <StatusBadge
              tone={c.status === "completed" ? "ok" : "info"}
              icon={c.status === "completed" ? "CircleCheck" : "Info"}
              text={c.status === "completed" ? "Completed" : "Ongoing"}
            />
            <span>{c.description}</span>
            <Button label="Open" variant="secondary" onPress={() => setOpenId(c.id)} />
          </li>
        ))}
      </ul>
    </Page>
  );
}
