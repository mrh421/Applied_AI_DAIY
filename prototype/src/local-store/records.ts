import { notify } from "./events";

export type Collection = "profile" | "materials" | "tools" | "cases";

export type StoredRecord<T> = {
  id: string;
  collection: Collection;
  updatedAt: number;
  deleted: boolean;
  data: T;
};

export class StorageFullError extends Error {}

export const COLLECTIONS: Collection[] = ["profile", "materials", "tools", "cases"];

const keyOf = (c: Collection): string => `daiy.v1.${c}`;

function readAll(c: Collection): StoredRecord<unknown>[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(keyOf(c)) ?? "[]");
    return Array.isArray(parsed) ? (parsed as StoredRecord<unknown>[]) : [];
  } catch {
    return [];
  }
}

function writeAll(c: Collection, records: StoredRecord<unknown>[]): void {
  try {
    localStorage.setItem(keyOf(c), JSON.stringify(records));
  } catch (error) {
    throw new StorageFullError(`localStorage is full: ${String(error)}`);
  }
}

function upsert(records: StoredRecord<unknown>[], next: StoredRecord<unknown>): void {
  const i = records.findIndex((r) => r.id === next.id);
  if (i < 0) records.push(next);
  else records[i] = next;
}

export function list<T>(c: Collection): StoredRecord<T>[] {
  return readAll(c).filter((r) => !r.deleted) as StoredRecord<T>[];
}

export function get<T>(c: Collection, id: string): StoredRecord<T> | undefined {
  return list<T>(c).find((r) => r.id === id);
}

export function put<T>(c: Collection, id: string, data: T): StoredRecord<T> {
  const records = readAll(c);
  const stored: StoredRecord<T> = {
    id,
    collection: c,
    updatedAt: Date.now(),
    deleted: false,
    data,
  };
  upsert(records, stored);
  writeAll(c, records);
  notify(c);
  return stored;
}

export function remove(c: Collection, id: string): void {
  const records = readAll(c);
  const existing = records.find((r) => r.id === id);
  if (!existing || existing.deleted) return;
  upsert(records, { ...existing, updatedAt: Date.now(), deleted: true, data: null });
  writeAll(c, records);
  notify(c);
}

export function changedSince(ts: number): StoredRecord<unknown>[] {
  return COLLECTIONS.flatMap(readAll).filter((r) => r.updatedAt > ts);
}

export function applyRemote(remote: StoredRecord<unknown>[]): void {
  const changed = new Set<Collection>();
  for (const c of COLLECTIONS) {
    const records = readAll(c);
    for (const r of remote.filter((x) => x.collection === c)) {
      const local = records.find((l) => l.id === r.id);
      if (local && local.updatedAt >= r.updatedAt) continue;
      upsert(records, r);
      changed.add(c);
    }
    if (changed.has(c)) writeAll(c, records);
  }
  for (const c of changed) notify(c);
}

export function removeAllRecords(): void {
  for (const c of COLLECTIONS) {
    localStorage.removeItem(keyOf(c));
    notify(c);
  }
}
