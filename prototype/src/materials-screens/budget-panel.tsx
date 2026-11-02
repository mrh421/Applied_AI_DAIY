import { useState } from "react";

import { useCaseSession } from "../case-session";
import { useInventory } from "../inventory";
import { StatusBadge, TextField } from "../ui-kit";
import { costsOf, totalText } from "./costs";
import { parseAmount } from "./plan";

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
  const { costs, noneWithinBudget } = costsOf(record, options, inventory, record.budget);

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
            <p>{`Total: ${totalText(c)}`}</p>
            {c.budget === "within" && (
              <StatusBadge tone="ok" icon="CircleCheck" text="within budget" />
            )}
            {c.budget === "may-exceed" && (
              <StatusBadge tone="warning" icon="CircleHelp" text="may exceed budget" />
            )}
            {c.budget === "exceeds" && (
              <StatusBadge tone="danger" icon="CircleX" text="exceeds budget" />
            )}
            <ul className="list-disc pl-5 text-sm">
              {c.lines.flatMap((l) => [
                l.amount === null && !l.estimate && !l.fromOwnStock ? (
                  <li key={`${l.name}-none`}>{`No price found: ${l.name}`}</li>
                ) : null,
                l.estimate ? (
                  <li key={`${l.name}-est`}>
                    {`Estimated price: ${l.name}, about ${Math.round(l.estimate.min)} to ${Math.round(l.estimate.max)} EUR`}
                  </li>
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
