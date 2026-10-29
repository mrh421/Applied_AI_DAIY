import type { Collection } from "./records";

type Listener = (c: Collection) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify(c: Collection): void {
  for (const listener of listeners) listener(c);
}
