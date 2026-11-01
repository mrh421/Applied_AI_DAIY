import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import axe from "axe-core";

import { routeTree } from "../app-shell/routeTree.gen";
import type { CaseOutcome } from "../case-model";
import { diyPackage } from "../case-pipeline/fixtures";
import { saveCase, type CaseRecord } from "../history";
import { saveMaterial, saveTool } from "../inventory";
import { setLevel } from "../profile";

// Shared by the tests of ITM-255: stored cases of every outcome, a route opened in a router,
// and the axe run with the rules jsdom cannot decide off (colour and layout).

const guidance: CaseOutcome = {
  type: "guidance",
  summary: "A tap drips.",
  assumptions: ["The tap is a single-lever mixer."],
  options: [{ id: "o1", kind: "repair", title: "Repair the tap", packages: [diyPackage] }],
  notices: [],
  photoAlt: null,
};
const questions: CaseOutcome = {
  type: "questions",
  round: 1,
  missing: [],
  questions: [{ id: "q1", topic: "tap.age", text: "How old is the tap?", termExplanations: [] }],
};
const escalation: CaseOutcome = {
  type: "escalation",
  escalation: {
    risk: "critical",
    reason: "A gas smell is dangerous.",
    hazards: ["gas"],
    origin: "precheck",
    actions: ["Leave the room."],
    professionals: ["Gas emergency service"],
  },
};

const record = (id: string, outcome: CaseOutcome): CaseRecord => ({
  id,
  createdAt: "2026-11-02T10:00:00Z",
  rulesVersion: "1",
  chosenOffers: {},
  status: "ongoing",
  description: "The kitchen tap drips.",
  hadPhoto: false,
  answers: [],
  round: 0,
  outcome,
  chosenOptionId: "o1",
  explanations: {
    p1: { 1: "A stop valve cuts the water.", 2: "Shut off first.", 3: "A seal is a ring." },
  },
  checked: {},
  notes: "",
  budget: null,
  materialsUsed: [],
});

export async function open(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
}

export async function violations() {
  const result = await axe.run(document.body, {
    rules: {
      "color-contrast": { enabled: false },
      "color-contrast-enhanced": { enabled: false },
      region: { enabled: false },
      "landmark-one-main": { enabled: false },
      "page-has-heading-one": { enabled: false },
    },
  });
  return result.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 80)).join(" | ")}`,
  );
}

/** A guide, a question round and an escalation as stored cases, an inventory and a profile. */
export function seed(): void {
  localStorage.clear();
  saveCase(record("guide", guidance));
  saveCase(record("asking", questions));
  saveCase(record("danger", escalation));
  saveMaterial({ name: "Seal", amount: 1, unit: "piece" });
  saveTool("Spanner");
  setLevel("plumbing", "some-experience");
}
