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

describe("App shell", () => {
  // The tests store nothing; clearing the stored records would wait for the database
  // connections that earlier routes left open.
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(cleanup);

  it("shows the main navigation on every page", async () => {
    await open("/profile");
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const label of ["New case", "History", "Inventory", "Skills"]) {
      expect(nav).toHaveTextContent(label);
    }
  });

  it("works without an account: the start page asks for no sign-in", async () => {
    await open("/");
    expect(screen.queryByText(/sign in|log in|password/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start|continue|confirm/i })).toBeInTheDocument();
  });

  it("renders no back action on the start page", async () => {
    await open("/");
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it.each(["/profile", "/inventory", "/history", "/case/c1", "/case/c1/work/p1"])(
    "renders a back action on %s (GO-BACK)",
    async (path) => {
      await open(path);
      expect(await screen.findByRole("button", { name: /^Back/ })).toBeInTheDocument();
    },
  );

  it.each([
    ["/profile", "Your skills"],
    ["/inventory", "Your inventory"],
    ["/history", "Your history"],
  ])("shows the screen of %s", async (path, title) => {
    await open(path);
    expect(await screen.findByText(title, { selector: "h1" })).toBeInTheDocument();
  });

  it("shows a not-found page in plain language with a link to the start", async () => {
    await open("/nothing-here");
    expect(await screen.findByText(/does not exist/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a new case" })).toHaveAttribute("href", "/");
  });
});
