import type { PackageLabel } from "../case-model";
import type { IconName } from "../ui-kit";

/** Every label is shown as icon and text, never by colour alone (PACKAGE-LABEL, NOT-COLOR-ALONE). */
export const LABEL_VIEW: Record<
  PackageLabel,
  { text: string; icon: IconName; tone: "ok" | "warning" | "danger" | "info" }
> = {
  diy: { text: "DIY", icon: "CircleCheck", tone: "ok" },
  "diy-preparation": { text: "DIY preparation for a professional", icon: "Info", tone: "info" },
  "professional-only": { text: "Professional only", icon: "TriangleAlert", tone: "warning" },
  "not-recommended": { text: "Not recommended", icon: "CircleX", tone: "danger" },
};
