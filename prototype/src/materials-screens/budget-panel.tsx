import { useState } from "react";

import { searchOffers, type Offer } from "../catalogue";
import { estimateCosts } from "../cost-estimate";
import { useCaseSession } from "../case-session";
import { useInventory } from "../inventory";
import { matchStock } from "../stock-matching";
import { StatusBadge, TextField } from "../ui-kit";
import { activeOption, guidesOf, money, parseAmount } from "./plan";

/** A budget field, the total per option against it, and the prices and fits to check. */
export function BudgetPanel({ caseId }: { caseId: string }) {
  const { session, setBudget } = useCaseSession(caseId);
  const inventory = useInventory();
  const [text, setText] = useState(session?.record.budget?.amount.toString() ?? "");
  const [error, setError] = useState<string | undefined>();
  if (!session || session.record.outcome?.type !== "guidance") return null;
  const { record } = session;

  const onChange = (v: string) => {
    setText(v);
    if (v.trim() === "") {
      setError(undefined);
      setBudget(null);
      return;
    }
    const amount = parseAmount(v);
    if (amount === null) {
      setError("Enter a number of 0 or more, for example 25.50.");
      return;
    }
    setError(undefined);
    setBudget({ amount, currency: "EUR" });
  };

  const options = record.outcome?.type === "guidance" ? record.outcome.options : [];
  const { costs, noneWithinBudget } = estimateCosts(
    options.map((o) => {
      const match = matchStock(guidesOf(o), inventory);
      const chosen: Record<string, Offer | null> = {};
      for (const m of match.materials) {
        const id = record.chosenOffers[m.need.id];
        if (m.status.kind === "available" || id === undefined) continue;
        const found = searchOffers({ name: m.need.name, spec: m.need.spec }, m.status.missing);
        const offer = found.offers.find((x) => x.id === id);
        if (offer) chosen[m.need.id] = offer;
      }
      return { optionId: o.id, match, chosen };
    }),
    record.budget,
  );

  return (
    <section aria-label="Cost estimate" className="grid gap-3">
      <h2 className="text-xl font-semibold">Cost estimate</h2>
      <TextField
        label="Budget (EUR)"
        value={text}
        onChange={onChange}
        {...(error ? { error } : {})}
      />
      {costs.map((c) => {
        const title = options.find((o) => o.id === c.optionId)?.title ?? c.optionId;
        return (
          <div key={c.optionId} className="grid gap-1">
            <h3 className="font-medium">{title}</h3>
            <p>
              {`Total: ${money(c.total)}`}
              {c.incomplete ? " (some prices are unknown)" : ""}
            </p>
            {c.budget === "within" && (
              <StatusBadge tone="ok" icon="CircleCheck" text="within budget" />
            )}
            {c.budget === "exceeds" && (
              <StatusBadge tone="danger" icon="CircleX" text="exceeds budget" />
            )}
            <ul className="list-disc pl-5 text-sm">
              {c.lines.flatMap((l) => [
                l.amount === null && !l.fromOwnStock ? (
                  <li key={`${l.name}-none`}>{`No price found: ${l.name}`}</li>
                ) : null,
                l.priceToCheck ? (
                  <li key={`${l.name}-price`}>{`Price to check: ${l.name}`}</li>
                ) : null,
                l.fitToCheck ? <li key={`${l.name}-fit`}>{`Fit to check: ${l.name}`}</li> : null,
              ])}
            </ul>
          </div>
        );
      })}
      {noneWithinBudget && <p role="status">No option stays within your budget.</p>}
    </section>
  );
}
