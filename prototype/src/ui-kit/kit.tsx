import { useId, type ReactNode } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icons";
import { buttonClass, type ButtonVariant } from "./button-style";
import { ButtonBase } from "./components/button";
import { DialogShell } from "./components/dialog";
import { SelectShell } from "./components/select";
import { CheckboxShell } from "./components/checkbox";
import { CollapsibleShell } from "./components/collapsible";

function requireText(value: string, what: string) {
  if (!value.trim()) throw new Error(`${what} requires a non-empty label`);
}

export function Button(p: {
  label: string;
  icon?: IconName;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
}) {
  requireText(p.label, "Button");
  return (
    <ButtonBase variant={p.variant ?? "primary"} onPress={p.onPress} disabled={p.disabled}>
      {p.icon && <Icon name={p.icon} />}
      {p.label}
    </ButtonBase>
  );
}

export function IconButton(p: { label: string; icon: IconName; onPress: () => void }) {
  requireText(p.label, "IconButton");
  return (
    <ButtonBase variant="secondary" label={p.label} onPress={p.onPress} className="px-2">
      <Icon name={p.icon} />
    </ButtonBase>
  );
}

export function LinkButton(p: { label: string; href: string; external?: boolean }) {
  requireText(p.label, "LinkButton");
  return (
    <a
      href={p.href}
      className={buttonClass("secondary")}
      {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {p.label}
      {p.external && (
        <>
          <Icon name="ExternalLink" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
}

const FIELD =
  "min-h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive";

function FieldError(p: { id: string; label: string; error: string }) {
  return (
    <p id={p.id} className="text-sm text-destructive">
      {p.label}: {p.error}
    </p>
  );
}

export function TextField(p: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
  autoComplete?: string;
  type?: "text" | "password" | "number";
}) {
  requireText(p.label, "TextField");
  const id = useId();
  const errorId = `${id}-error`;
  const shared = {
    id,
    value: p.value,
    autoComplete: p.autoComplete,
    placeholder: p.placeholder,
    "aria-invalid": p.error ? true : undefined,
    "aria-describedby": p.error ? errorId : undefined,
    className: FIELD,
  } as const;
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {p.label}
      </label>
      {p.multiline ? (
        <textarea {...shared} rows={4} onChange={(e) => p.onChange(e.target.value)} />
      ) : (
        <input {...shared} type={p.type ?? "text"} onChange={(e) => p.onChange(e.target.value)} />
      )}
      {p.error && <FieldError id={errorId} label={p.label} error={p.error} />}
    </div>
  );
}

export function Select<T extends string>(p: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  error?: string;
}) {
  requireText(p.label, "Select");
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {p.label}
      </label>
      <SelectShell
        id={id}
        value={p.value}
        options={p.options}
        onChange={(v) => p.onChange(v as T)}
        describedBy={p.error ? errorId : undefined}
        invalid={!!p.error}
      />
      {p.error && <FieldError id={errorId} label={p.label} error={p.error} />}
    </div>
  );
}

export function Checkbox(p: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  requireText(p.label, "Checkbox");
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <CheckboxShell id={id} checked={p.checked} onChange={p.onChange} />
      <label htmlFor={id} className="min-h-6 cursor-pointer text-sm">
        {p.label}
      </label>
    </div>
  );
}

export function Collapsible(p: { summary: string; defaultOpen: boolean; children: ReactNode }) {
  requireText(p.summary, "Collapsible");
  return <CollapsibleShell {...p} />;
}

const TONES = {
  ok: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
  info: "bg-secondary text-secondary-foreground",
} as const;

export function StatusBadge(p: {
  tone: "ok" | "warning" | "danger" | "info";
  icon: IconName;
  text: string;
}) {
  requireText(p.text, "StatusBadge");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[p.tone],
      )}
    >
      <Icon name={p.icon} />
      {p.text}
    </span>
  );
}

export function Img(p: { src: string; alt: string } | { src: string; decorative: true }) {
  if ("decorative" in p && p.decorative) {
    return <img src={p.src} alt="" className="h-auto max-w-full" />;
  }
  const alt = "alt" in p ? p.alt : "";
  requireText(alt, "Img without decorative");
  return <img src={p.src} alt={alt} className="h-auto max-w-full" />;
}

export function Dialog(p: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  requireText(p.title, "Dialog");
  return (
    <DialogShell
      title={p.title}
      open={p.open}
      onClose={p.onClose}
      closeControl={<Button label="Close" variant="secondary" onPress={p.onClose} />}
    >
      {p.children}
    </DialogShell>
  );
}

/** A rounded card on the page, the container of the Lovable design. */
export function Card(p: {
  children: ReactNode;
  tone?: "plain" | "soft" | "warning";
  className?: string;
}) {
  const tone = p.tone ?? "plain";
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        tone === "plain" && "border-border bg-card shadow-soft",
        tone === "soft" && "border-transparent bg-secondary",
        tone === "warning" && "border-warning-foreground/20 bg-warning text-warning-foreground",
        p.className,
      )}
    >
      {p.children}
    </section>
  );
}

/** The small uppercase label above a card's text ("Your problem", "Diagnosis"). */
export function Eyebrow(p: { children: ReactNode; primary?: boolean }) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-wider",
        p.primary ? "text-primary" : "text-muted-foreground",
      )}
    >
      {p.children}
    </p>
  );
}

/** A pill with a short fact (time, difficulty, where an offer comes from). */
export function Badge(p: { children: ReactNode; outline?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        p.outline
          ? "border border-border text-foreground"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      {p.children}
    </span>
  );
}

/** A round numbered marker for the sections of a form or the steps of a list. */
export function NumberDot(p: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
    >
      {p.n}
    </span>
  );
}

export function Page(p: {
  title: string;
  /** The emphasised end of the title, set in the primary colour (the start page). */
  accent?: string;
  /** A line below the title. */
  lead?: string;
  /** The title stays for screen readers; the screen shows its own heading in a card. */
  hideTitle?: boolean;
  back?: { label: string; onBack: () => void };
  children: ReactNode;
}) {
  const hero = p.accent !== undefined;
  return (
    <main className="mx-auto grid w-full min-w-0 max-w-4xl grid-cols-[minmax(0,1fr)] gap-6 break-words px-5 pb-24 pt-4">
      {p.back && (
        <div>
          <Button
            label={p.back.label}
            icon="ArrowLeft"
            variant="secondary"
            onPress={p.back.onBack}
          />
        </div>
      )}
      <div className={hero ? "py-6 md:py-10" : p.hideTitle ? "contents" : undefined}>
        <h1
          className={cn(
            hero ? "max-w-2xl text-4xl leading-tight md:text-6xl" : "text-3xl",
            p.hideTitle && "sr-only",
          )}
        >
          {p.title}
          {hero && (
            <>
              {" "}
              <em className="text-primary">{p.accent}</em>
            </>
          )}
        </h1>
        {p.lead && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{p.lead}</p>}
      </div>
      {p.children}
    </main>
  );
}
