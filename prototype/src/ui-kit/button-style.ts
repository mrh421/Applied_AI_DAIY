import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "danger";

const BASE =
  "inline-flex min-h-6 min-w-6 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-input bg-background text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export function buttonClass(variant: ButtonVariant, extra?: string | undefined) {
  return cn(BASE, VARIANTS[variant], extra);
}
