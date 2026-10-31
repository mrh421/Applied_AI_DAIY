import { describe, expect, it } from "vitest";

import type { Answer, FollowUpQuestion } from "../case-model";
import { prefillQuestions } from "./index";

const q = (id: string, topic: string): FollowUpQuestion => ({
  id,
  topic,
  text: `Question ${id}?`,
  termExplanations: [],
});
const a = (topic: string, text: string, notSure = false): Answer => ({
  questionId: `old-${topic}`,
  topic,
  text,
  notSure,
});

describe("prefillQuestions (REDUNDANT-ENTRY)", () => {
  it("sets prefill of a question whose topic an earlier answer covers", () => {
    const out = prefillQuestions(
      [q("q2", "device.model"), q("q3", "tap.age")],
      [a("device.model", "Grohe X1")],
    );
    expect(out[0].prefill).toBe("Grohe X1");
    expect(out[1].prefill).toBeUndefined();
  });

  it("uses the latest answer of a topic", () => {
    const out = prefillQuestions(
      [q("q2", "device.model")],
      [a("device.model", "old"), a("device.model", "new")],
    );
    expect(out[0].prefill).toBe("new");
  });

  it("does not prefill from a 'not sure' answer", () => {
    const out = prefillQuestions([q("q2", "device.model")], [a("device.model", "", true)]);
    expect(out[0].prefill).toBeUndefined();
  });

  it("does not change its inputs", () => {
    const questions = [q("q2", "device.model")];
    prefillQuestions(questions, [a("device.model", "x")]);
    expect(questions[0].prefill).toBeUndefined();
  });
});
