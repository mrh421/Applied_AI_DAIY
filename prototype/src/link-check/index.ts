import { createServerFn } from "@tanstack/react-start";

import { createChecker } from "./check";

const check = createChecker();

// Input is passed on unparsed: the checker answers an invalid input with `reachable: false`,
// so a server function never throws.
const unchecked = (d: unknown) => d;

const checkLinkFn = createServerFn({ method: "POST" })
  .inputValidator(unchecked)
  .handler(({ data }) => check(data));

/** Whether a model's link answers: asked on the server, so the browser's CORS rules do not apply (3D-MODEL-LINK). */
export function checkLink(input: { url: string }): Promise<{ reachable: boolean }> {
  return checkLinkFn({ data: input });
}
