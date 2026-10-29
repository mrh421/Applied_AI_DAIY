import { useEffect, useState } from "react";
import { subscribe } from "./announce";

/** The one polite live region; the app shell mounts it once. */
export function Announcer() {
  const [message, setMessage] = useState("");
  useEffect(() => subscribe(setMessage), []);
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
