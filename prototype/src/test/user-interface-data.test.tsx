import "fake-indexeddb/auto";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Announcer, announce } from "../ui-kit";
import { open, seed, violations } from "./ui-support";

// ITM-255, ARC-008: every screen is reached from the shell, built from the kit, has a label on
// every control and passes the accessibility rules in jsdom (UC-027, KEYBOARD-OPERABLE,
// CLEAR-LABELS, STATUS-MESSAGES). jsdom has no layout, so the colour rules (checked on the
// tokens in ui-kit/tokens.test.ts) and the layout rules (checked in the browser, ITM-257) are off.
// Two files, because a long run of page mounts in one file does not finish (cause not found).

const ROUTES: [path: string, title: RegExp][] = [
  ["/profile", /Your skills/],
  ["/inventory", /Your inventory/],
  ["/history", /Your history/],
];

beforeEach(seed);
afterEach(cleanup);

describe("user interface: the pages of the user's data", () => {
  it.each(ROUTES)("%s renders and has no accessibility violation", async (path, title) => {
    await open(path);
    expect(await screen.findByText(title, { selector: "h1, h2" })).toBeInTheDocument();
    expect(await violations()).toEqual([]);
  });

  it.each(ROUTES)("%s: every control has a label", async (path) => {
    await open(path);
    await waitFor(() => expect(document.querySelector("h1, h2")).not.toBeNull());
    const controls = document.querySelectorAll("input, select, textarea, button");
    for (const c of controls) {
      const name =
        c.getAttribute("aria-label") ??
        c.getAttribute("aria-labelledby") ??
        (c as HTMLInputElement).labels?.[0]?.textContent ??
        c.textContent;
      expect(name?.trim(), c.outerHTML.slice(0, 100)).toBeTruthy();
    }
  });
});

describe("user interface: status messages", () => {
  // The kit's live region, with a focused button beside it. Focusing an input of the inventory page
  // inside the router does not return in jsdom (it does when the page is mounted alone), so the
  // focus is not tested on the routes here; the browser tests of ITM-256 and 257 type in it.
  it("announces a status message without moving the focus", () => {
    render(
      <>
        <button type="button">Save</button>
        <Announcer />
      </>,
    );
    const button = screen.getByText("Save");
    button.focus();
    expect(document.activeElement).toBe(button);

    act(() => announce("Spanner saved."));

    expect(document.querySelector('[role="status"]')).toHaveTextContent("Spanner saved.");
    expect(document.activeElement).toBe(button);
  });
});
