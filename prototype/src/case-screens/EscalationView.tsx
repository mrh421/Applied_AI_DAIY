import type { Escalation } from "../case-model";

/** Why no instructions are given, what to do now and whom to contact (ESCALATION-REASON). */
export function EscalationView(p: { escalation: Escalation }) {
  const e = p.escalation;
  return (
    <section className="grid gap-2" role="alert">
      <p className="font-medium">{e.reason}</p>
      <ul className="list-disc pl-5">
        {e.actions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p>Contact: {e.professionals.join(", ")}</p>
    </section>
  );
}
