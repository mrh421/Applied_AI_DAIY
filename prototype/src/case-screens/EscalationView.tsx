import type { Escalation } from "../case-model";

/** The risk, why no instructions are given, what to do now and whom to contact (ESCALATION-REASON, HAZARD-PROFESSIONAL). */
export function EscalationView(p: { escalation: Escalation }) {
  const { escalation } = p;
  return (
    <section className="grid gap-2" role="alert">
      <p>Risk: {escalation.risk}</p>
      <p className="font-medium">{escalation.reason}</p>
      <h3 className="font-medium">What to do now</h3>
      <ul className="list-disc pl-5">
        {escalation.actions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <h3 className="font-medium">Who to contact</h3>
      <ul className="list-disc pl-5">
        {escalation.professionals.map((pro) => (
          <li key={pro}>{pro}</li>
        ))}
      </ul>
    </section>
  );
}
