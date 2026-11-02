import { useEffect, useMemo, useState } from "react";

import { CONSENT_PURPOSES, giveConsent, hasConsent } from "../consent";
import { useCaseSession } from "../case-session";
import {
  Button,
  Icon,
  IconButton,
  NumberDot,
  Page,
  Progress,
  TextField,
  announce,
} from "../ui-kit";

const HOW = [
  { title: "Describe it", text: "Say what is broken, as you would to a friend." },
  { title: "We check safety", text: "Risky jobs go to a professional; we ask what is missing." },
  { title: "Fix it step by step", text: "A plain guide using the tools you already own." },
];

const EXAMPLES = [
  "My drawer is sticking and no longer closes properly.",
  "The kitchen tap keeps dripping even when closed tight.",
  "A cabinet door hangs crooked and rubs against the frame.",
];
import { AI_NOTICE, PRIVACY_NOTICE_SHORT } from "./notices";

/** The route `/`: free text, an optional photo and Confirm. With `caseId` the open case is shown again. */
export function CaseInputScreen(p: { caseId?: string; onStarted?: (caseId: string) => void }) {
  const { session, start } = useCaseSession(p.caseId);
  const [description, setDescription] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);
  const [error, setError] = useState<string | undefined>();
  const [consented, setConsented] = useState(hasConsent("keep-case-photos"));
  const [started, setStarted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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
    setNotice(null);
    try {
      const outcome = await start({ description: text.trim(), ...(photo ? { photo } : {}) });
      if (outcome.type === "notice") {
        announce(outcome.notice.text);
        setNotice(outcome.notice.text);
      } else {
        setStarted(true);
      }
    } catch {
      announce("Your case could not be saved on this device.");
      setError("Your case could not be saved. Please free some space and try again.");
    }
  }

  return (
    <Page title="Fix it yourself — safely." hideTitle>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-8">
        <div>
          <h1 className="text-4xl leading-tight md:text-6xl">
            Fix it yourself — <em className="text-primary">safely.</em>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Tell us what's broken in your own words. We check for risks, ask what's missing, and
            guide you step by step — using what you already own.
          </p>
          <ol aria-label="How it works" className="mt-8 hidden gap-4 lg:grid">
            {HOW.map((h, i) => (
              <li key={h.title} className="flex gap-3">
                <NumberDot n={i + 1} />
                <span>
                  <span className="block font-semibold">{h.title}</span>
                  <span className="block text-sm text-muted-foreground">{h.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-soft backdrop-blur md:p-8">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
            <section className="grid grid-cols-[minmax(0,1fr)] gap-3">
              <TextField
                label="What's broken? Describe it like you'd tell a friend."
                multiline
                value={text}
                onChange={setDescription}
                {...(error ? { error } : {})}
              />
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setDescription(ex)}
                    className="min-h-6 shrink-0 sm:shrink rounded-full border border-border bg-card px-3 py-1 text-left text-sm text-muted-foreground transition hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="case-photo"
                  className="inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-sm font-medium hover:bg-secondary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                >
                  <Icon name="Camera" /> Add a photo (optional)
                  <input
                    key={pickerKey}
                    id="case-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {photo && preview && (
                <ul aria-label="Photos" className="flex flex-wrap gap-3">
                  <li className="relative">
                    <img
                      src={preview}
                      alt={`Your photo: ${photo.name}`}
                      className="size-24 rounded-xl border border-border object-cover"
                    />
                    <div className="absolute -right-2 -top-2">
                      <IconButton
                        label="Remove the photo"
                        icon="X"
                        onPress={() => {
                          setPhoto(null);
                          setPickerKey((k) => k + 1);
                          announce("The photo was removed.");
                        }}
                      />
                    </div>
                  </li>
                </ul>
              )}
              {photo &&
                (consented ? (
                  <p className="text-sm text-muted-foreground">
                    The photo will be kept on this device.
                  </p>
                ) : (
                  <div className="grid gap-2 rounded-xl border border-border bg-secondary/60 p-4 text-sm">
                    <p>{CONSENT_PURPOSES["keep-case-photos"]}</p>
                    <div>
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
                  </div>
                ))}
            </section>
            {notice && <p role="status">{notice}</p>}
            {session?.pending === "assess" && (
              <Progress
                messages={[
                  "Reading your description…",
                  ...(photo ? ["Looking at your photo…"] : []),
                  "Checking for risks…",
                  "Working out what to ask or do next…",
                ]}
              />
            )}
            <div className="grid gap-3">
              <div className="grid sm:block">
                <Button
                  label="Find my repair"
                  onPress={() => void confirm()}
                  disabled={session?.pending != null}
                />
              </div>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-0.5">
                  <Icon name="ShieldCheck" />
                </span>
                <span>
                  {AI_NOTICE} {PRIVACY_NOTICE_SHORT}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
