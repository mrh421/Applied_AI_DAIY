import type { ReactNode } from "react";
import { buttonClass, type ButtonVariant } from "../button-style";

export function ButtonBase(p: {
  variant: ButtonVariant;
  onPress: () => void;
  disabled?: boolean | undefined;
  label?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={p.label}
      disabled={p.disabled}
      onClick={p.onPress}
      className={buttonClass(p.variant, p.className)}
    >
      {p.children}
    </button>
  );
}
