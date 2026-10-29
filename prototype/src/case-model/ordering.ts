import type { OptionKind, SolutionOption } from "./draft";
import { LABEL_STRICTNESS, type PackageLabel } from "./vocabulary";

/** The more restrictive of the two labels. */
export function stricterLabel(a: PackageLabel, b: PackageLabel): PackageLabel {
  return LABEL_STRICTNESS.indexOf(a) >= LABEL_STRICTNESS.indexOf(b) ? a : b;
}

const OPTION_RANK: Record<OptionKind, number> = { repair: 0, reuse: 1, "buy-new": 2 };

/** Repair, then reuse, then buy-new; stable within a kind. */
export function rankOptions(options: SolutionOption[]): SolutionOption[] {
  return [...options].sort((a, b) => OPTION_RANK[a.kind] - OPTION_RANK[b.kind]);
}
