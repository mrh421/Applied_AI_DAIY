import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  rootRouteId,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "./routeTree.gen";

const make = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each([
    "/",
    "/case/c1",
    "/case/c1/work/p1",
    "/case/c1/materials",
    "/case/c1/offers/m1",
    "/profile",
    "/inventory",
    "/history",
  ])("matches a page for %s instead of falling back to not found", (path) => {
    const matches = make(path).matchRoutes(path);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("knows no page for an unknown address", () => {
    expect(make("/nothing-here").matchRoutes("/nothing-here").at(-1)?.routeId).toBe(rootRouteId);
  });
});
