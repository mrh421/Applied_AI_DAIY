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
  "min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive";

function FieldError(p: { id: string; label: string; error: string }) {
  return (
    <p id={p.id} className="text-sm text-destructive">
      {p.label}: {p.error}
    </p>
  );
}

export function TextField(p: {
  label: string;
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

export function Page(p: {
  title: string;
  back?: { label: string; onBack: () => void };
  children: ReactNode;
}) {
  return (
    <main className="mx-auto grid w-full min-w-0 max-w-2xl gap-4 break-words px-4 py-6">
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
      <h1 className="text-2xl font-semibold">{p.title}</h1>
      {p.children}
    </main>
  );
}
