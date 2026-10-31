import type { Money } from "../case-model";
import { searchOffers, type Offer } from "../catalogue";
import type { MaterialMatch, StockMatch } from "../stock-matching";

export type CostLine = {
  name: string;
  amount: Money | null;
  fromOwnStock: boolean;
  priceToCheck: boolean;
  fitToCheck: boolean;
};

export type OptionCost = {
  optionId: string;
  total: Money;
  incomplete: boolean;
  lines: CostLine[];
  budget: "within" | "exceeds" | "no-budget";
};

type Option = {
  optionId: string;
  match: StockMatch;
  chosen: Record<string, Offer | null>;
};

const cents = (n: number) => Math.round(n * 100) / 100;

function costLine(m: MaterialMatch, chosen: Record<string, Offer | null>): CostLine {
  const name = m.need.name;
  if (m.status.kind === "available") {
    return {
      name,
      amount: { amount: 0, currency: "EUR" },
      fromOwnStock: true,
      priceToCheck: false,
      fitToCheck: false,
    };
  }
  const missing = m.status.missing;
  // A key in `chosen` is the user's choice, null meaning none; no key means the cheapest offer.
  const offer =
    m.need.id in chosen
      ? chosen[m.need.id]
      : (searchOffers({ name: m.need.name, spec: m.need.spec }, missing).offers[0] ?? null);
  const unitPrice = offer?.unitPrice.value ?? null;
  const usable =
    offer !== null &&
    offer !== undefined &&
    unitPrice !== null &&
    offer.packSize.unit === missing.unit;
  if (!usable) {
    return { name, amount: null, fromOwnStock: false, priceToCheck: false, fitToCheck: false };
  }
  const packs = Math.ceil(missing.amount / offer.packSize.amount);
  return {
    name,
    amount: { amount: cents(packs * unitPrice.amount), currency: "EUR" },
    fromOwnStock: false,
    priceToCheck: offer.unitPrice.certainty !== "verified",
    fitToCheck: offer.compatibility.certainty !== "verified",
  };
}

/** The estimated cost of each option, compared with the budget (TOTAL-COST-ESTIMATE, BUDGET-RESPECTED). */
export function estimateCosts(
  options: Option[],
  budget: Money | null,
): { costs: OptionCost[]; noneWithinBudget: boolean } {
  const costs = options.map((o): OptionCost => {
    const lines = o.match.materials.map((m) => costLine(m, o.chosen));
    const total = cents(lines.reduce((sum, l) => sum + (l.amount?.amount ?? 0), 0));
    return {
      optionId: o.optionId,
      total: { amount: total, currency: "EUR" },
      incomplete: lines.some((l) => l.amount === null),
      lines,
      budget: budget === null ? "no-budget" : total <= budget.amount ? "within" : "exceeds",
    };
  });
  const noneWithinBudget =
    budget !== null && costs.length > 0 && costs.every((c) => c.budget === "exceeds");
  return { costs, noneWithinBudget };
}
