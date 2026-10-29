import type { Notice, NoticeKind } from "../case-model";
import { CATALOGUE } from "./catalogue";

type Found = { kind: NoticeKind; certainty: "applies" | "possible" };

/** One notice per distinct kind, in catalogue order. A kind found with both certainties is `applies`. */
export function noticesFor(found: Found[]): Notice[] {
  const applies = new Set(found.filter((f) => f.certainty === "applies").map((f) => f.kind));
  const kinds = new Set(found.map((f) => f.kind));
  return (Object.keys(CATALOGUE) as NoticeKind[])
    .filter((kind) => kinds.has(kind))
    .map((kind) => {
      const certainty = applies.has(kind) ? "applies" : "possible";
      const entry = CATALOGUE[kind];
      return { kind, certainty, text: entry[certainty], marks: [...entry.marks] };
    });
}
