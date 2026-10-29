type Listener = (message: string) => void;
const listeners = new Set<Listener>();

/** Subscribes the live region; returns the unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A status message for assistive technology, without a change of focus. */
export function announce(message: string): void {
  listeners.forEach((listener) => listener(message));
}
