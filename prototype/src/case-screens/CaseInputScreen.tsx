import { useEffect, useState } from "react";

import { CONSENT_PURPOSES, giveConsent, hasConsent } from "../consent";
import { useCaseSession } from "../case-session";
import { Button, Page, TextField, announce } from "../ui-kit";
import { AI_NOTICE, PRIVACY_NOTICE_SHORT } from "./notices";

/** The route `/`: free text, an optional photo and Confirm. With `caseId` the open case is shown again. */
export function CaseInputScreen(p: { caseId?: string; onStarted?: (caseId: string) => void }) {
  const { session, start } = useCaseSession(p.caseId);
  const [description, setDescription] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [consented, setConsented] = useState(hasConsent("keep-case-photos"));
  const [started, setStarted] = useState(false);

  const text = description ?? session?.record.description ?? "";
  const startedId = started && session && session.pending === null ? session.record.id : null;
  const { onStarted } = p;
  useEffect(() => {
    if (startedId) onStarted?.(startedId);
  }, [startedId, onStarted]);

  async function confirm() {
    if (!text.trim()) {
      setError("Please describe the problem in a few words.");
      return;
    }
    setError(undefined);
    setStarted(true);
    try {
      await start({ description: text.trim(), ...(photo ? { photo } : {}) });
    } catch {
      setStarted(false);
      announce("Your case could not be saved on this device.");
      setError("Your case could not be saved. Please free some space and try again.");
    }
  }

  return (
    <Page title="What needs fixing?">
      <p>{AI_NOTICE}</p>
      <p>{PRIVACY_NOTICE_SHORT}</p>
      <TextField
        label="Describe the problem"
        multiline
        value={text}
        onChange={setDescription}
        {...(error ? { error } : {})}
      />
      <div className="grid gap-1">
        <label htmlFor="case-photo" className="text-sm font-medium">
          Add a photo (optional)
        </label>
        <input
          id="case-photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </div>
      {photo &&
        (consented ? (
          <p>The photo will be kept on this device.</p>
        ) : (
          <div className="grid gap-1">
            <p>{CONSENT_PURPOSES["keep-case-photos"]}</p>
            <Button
              label="Keep the photo"
              variant="secondary"
              onPress={() => {
                giveConsent("keep-case-photos");
                setConsented(true);
                announce("The photo will be kept on this device.");
              }}
            />
          </div>
        ))}
      <Button label="Confirm" onPress={() => void confirm()} disabled={session?.pending != null} />
    </Page>
  );
}
