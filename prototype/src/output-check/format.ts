import type { ZodType } from "zod";

// OUTPUT-FORMAT-CHECK: the draft has the expected format.

export type CheckFailure = {
  check: "format" | "completeness" | "prohibited-path";
  path: string;
  message: string;
};

export type CheckResult<T> = { ok: true; value: T } | { ok: false; failures: CheckFailure[] };

/** The longest `basics` of an explanation, a chosen value that no requirement fixes. */
export const BASICS_MAX_LENGTH = 600;

/** `["options", 0, "title"]` becomes `options[0].title`. */
export function pathOf(segments: readonly (string | number | symbol)[]): string {
  return segments.reduce<string>((path, segment) => {
    if (typeof segment === "number") return `${path}[${segment}]`;
    return path === "" ? String(segment) : `${path}.${String(segment)}`;
  }, "");
}

export function parseFormat<T>(schema: ZodType<T>, raw: unknown): CheckResult<T> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    failures: parsed.error.issues.map((issue) => ({
      check: "format",
      path: pathOf(issue.path),
      message: issue.message,
    })),
  };
}

export function basicsLengthFailures(steps: readonly { basics: string }[]): CheckFailure[] {
  return steps.flatMap((step, i) =>
    step.basics.length > BASICS_MAX_LENGTH
      ? [
          {
            check: "format" as const,
            path: pathOf(["steps", i, "basics"]),
            message: `basics has ${step.basics.length} characters; the limit is ${BASICS_MAX_LENGTH}`,
          },
        ]
      : [],
  );
}
