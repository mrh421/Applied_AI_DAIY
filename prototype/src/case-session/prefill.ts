import type { Answer, FollowUpQuestion } from "../case-model";

// REDUNDANT-ENTRY: a question whose topic an earlier answer covers is offered with that answer.
// A "not sure" answer gives nothing to offer.
export function prefillQuestions(
  questions: FollowUpQuestion[],
  answers: Answer[],
): FollowUpQuestion[] {
  const byTopic = new Map<string, string>();
  for (const a of answers) {
    if (a.notSure) byTopic.delete(a.topic);
    else byTopic.set(a.topic, a.text);
  }
  return questions.map((q) => {
    const prefill = byTopic.get(q.topic);
    return prefill === undefined ? q : { ...q, prefill };
  });
}
