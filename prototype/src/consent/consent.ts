import { useSyncExternalStore } from "react";

export type ConsentKind = "keep-case-photos";

export type ConsentRecord = { kind: ConsentKind; given: boolean; at: string };

export const CONSENT_PURPOSES: Record<ConsentKind, string> = {
  "keep-case-photos":
    "Keep the photo of a case on this device after the case, so you can see it again in your history.",
};

const KEY = "daiy.v1.consents";
const EMPTY: ConsentRecord[] = [];

const purges = new Map<ConsentKind, Array<() => Promise<void>>>();
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedRecords: ConsentRecord[] = EMPTY;

function read(): ConsentRecord[] {
  const raw = localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedRecords;
  let records = EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) {
      records = parsed.filter(
        (r): r is ConsentRecord =>
          typeof r === "object" &&
          r !== null &&
          typeof r.kind === "string" &&
          typeof r.given === "boolean" &&
          typeof r.at === "string",
      );
    }
  } catch {
    // damaged storage counts as no consent
  }
  cachedRaw = raw;
  cachedRecords = records;
  return records;
}

function write(records: ConsentRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records));
  notify();
}

function record(kind: ConsentKind, given: boolean): void {
  const others = read().filter((r) => r.kind !== kind);
  write([...others, { kind, given, at: new Date().toISOString() }]);
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function listConsents(): ConsentRecord[] {
  return read();
}

export function hasConsent(kind: ConsentKind): boolean {
  return read().some((r) => r.kind === kind && r.given);
}

export function giveConsent(kind: ConsentKind): void {
  record(kind, true);
}

export async function withdrawConsent(kind: ConsentKind): Promise<void> {
  record(kind, false);
  for (const handler of purges.get(kind) ?? []) await handler();
}

export function registerPurge(kind: ConsentKind, handler: () => Promise<void>): void {
  purges.set(kind, [...(purges.get(kind) ?? []), handler]);
}

export function clearConsents(): void {
  localStorage.removeItem(KEY);
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useConsents(): ConsentRecord[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
