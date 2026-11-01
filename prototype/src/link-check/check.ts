import models from "../../data/catalogue/models.json";

const TIMEOUT_MS = 5000;
const CACHE_MS = 60 * 60 * 1000;

/** The model links the server may call: `https` URLs of models.json only (no request to an arbitrary address). */
const LISTED = new Set((models as { url: string }[]).map((m) => m.url));

type Answer = { reachable: boolean };

export type CheckDeps = {
  allowed: (url: string) => boolean;
  fetchFn: typeof fetch;
  now: () => number;
  timeoutMs: number;
};

const defaults: CheckDeps = {
  allowed: (url) => LISTED.has(url) && url.startsWith("https://"),
  fetchFn: (input, init) => fetch(input, init),
  now: () => Date.now(),
  timeoutMs: TIMEOUT_MS,
};

// A server that refuses HEAD is asked again with GET.
const HEAD_REFUSED = new Set([403, 405, 501]);

async function ask(url: string, method: "HEAD" | "GET", d: CheckDeps): Promise<number> {
  // A redirect is not followed: any 2xx or 3xx answer counts as reachable.
  const res = await d.fetchFn(url, {
    method,
    redirect: "manual",
    signal: AbortSignal.timeout(d.timeoutMs),
  });
  if (method === "GET") void res.body?.cancel();
  return res.status;
}

function ok(status: number): boolean {
  return status >= 200 && status < 400;
}

/** A checker with its own in-memory cache from URL to answer for one hour. It never rejects. */
export function createChecker(overrides: Partial<CheckDeps> = {}) {
  const d: CheckDeps = { ...defaults, ...overrides };
  const cache = new Map<string, { reachable: boolean; checkedAt: number }>();

  return async function check(input: unknown): Promise<Answer> {
    const url = (input as { url?: unknown } | null)?.url;
    if (typeof url !== "string" || !d.allowed(url)) return { reachable: false };

    const hit = cache.get(url);
    if (hit && d.now() - hit.checkedAt < CACHE_MS) return { reachable: hit.reachable };

    let reachable = false;
    try {
      let status = await ask(url, "HEAD", d);
      if (HEAD_REFUSED.has(status)) status = await ask(url, "GET", d);
      reachable = ok(status);
    } catch {
      reachable = false;
    }
    cache.set(url, { reachable, checkedAt: d.now() });
    return { reachable };
  };
}
