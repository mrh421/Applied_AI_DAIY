import "fake-indexeddb/auto";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { routeTree } from "./routeTree.gen";

const make = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

async function open(path: string) {
  const router = make(path);
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
  return router;
}

// Its own file: after another render test in the same file the run does not finish (cause not found).
describe("Back from the outcome", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(cleanup);

  it("goes back from the outcome to the case input of the open case (route /?case=<id>)", async () => {
    const user = userEvent.setup();
    const router = await open("/case/c1");
    await user.click(await screen.findByRole("button", { name: "Back" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(router.state.location.search).toEqual({ case: "c1" });
  });
});
