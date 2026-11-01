import { useState } from "react";

import { saveCase, useHistory, type CaseRecord } from "../history";
import { activeOption, guidesOf, quantity } from "../materials-screens";
import { Button, Page, StatusBadge, TextField, announce } from "../ui-kit";

function Record({ record, onBack }: { record: CaseRecord; onBack: () => void }) {
  const [notes, setNotes] = useState(record.notes);
  const option = activeOption(record);
  const steps = option ? guidesOf(option).flatMap((g) => g.steps) : [];

  const save = () => {
    saveCase({ ...record, notes });
    announce("Notes saved.");
  };

  return (
    <Page title="Your case" back={{ label: "Back to history", onBack }}>
      <p>{record.description}</p>
      <h2 className="text-xl font-semibold">Steps</h2>
      {steps.length === 0 ? (
        <p>This case has no steps yet.</p>
      ) : (
        <ol className="grid list-decimal gap-1 pl-6">
          {steps.map((s, i) => (
            <li key={i}>{s.text}</li>
          ))}
        </ol>
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

/** Ongoing and completed cases; only the notes of a record are edited here (UC-021). */
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
