import type { Money } from "../case-model";
import { searchOffers, type Offer } from "../catalogue";
import type { MaterialMatch, StockMatch } from "../stock-matching";

export type CostLine = {
  name: string;
  amount: Money | null;
  fromOwnStock: boolean;
  priceToCheck: boolean;
  fitToCheck: boolean;
  /** The AI's rough price range for the whole quantity, given only when no offer of the catalogue fits. */
  estimate?: { min: number; max: number };
};

export type OptionCost = {
  optionId: string;
  total: Money;
  incomplete: boolean;
  /** The total as a range, given when some price is an AI estimate: the known prices plus the estimates. */
  estimatedTotal?: { min: number; max: number };
  lines: CostLine[];
  budget: "within" | "may-exceed" | "exceeds" | "no-budget";
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
    const guess = m.need.estimatedPrice;
    return {
      name,
      amount: null,
      fromOwnStock: false,
      priceToCheck: false,
      fitToCheck: false,
      ...(guess ? { estimate: { min: guess.min, max: Math.max(guess.min, guess.max) } } : {}),
    };
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

/** Within only when even the upper end of the estimate fits; exceeds only when even the lower end does not. */
function budgetStatus(
  total: number,
  estimated: { min: number; max: number } | undefined,
  budget: Money | null,
): OptionCost["budget"] {
  if (budget === null) return "no-budget";
  if (!estimated) return total <= budget.amount ? "within" : "exceeds";
  if (estimated.max <= budget.amount) return "within";
  return estimated.min > budget.amount ? "exceeds" : "may-exceed";
}

/** The estimated cost of each option, compared with the budget (TOTAL-COST-ESTIMATE, BUDGET-RESPECTED). */
export function estimateCosts(
  options: Option[],
  budget: Money | null,
): { costs: OptionCost[]; noneWithinBudget: boolean } {
  const costs = options.map((o): OptionCost => {
    const lines = o.match.materials.map((m) => costLine(m, o.chosen));
    const total = cents(lines.reduce((sum, l) => sum + (l.amount?.amount ?? 0), 0));
    const estimates = lines.flatMap((l) => (l.estimate ? [l.estimate] : []));
    const estimatedTotal =
      estimates.length > 0
        ? {
            min: cents(total + estimates.reduce((sum, e) => sum + e.min, 0)),
            max: cents(total + estimates.reduce((sum, e) => sum + e.max, 0)),
          }
        : undefined;
    return {
      optionId: o.optionId,
      total: { amount: total, currency: "EUR" },
      incomplete: lines.some((l) => l.amount === null && !l.estimate),
      ...(estimatedTotal ? { estimatedTotal } : {}),
      lines,
      budget: budgetStatus(total, estimatedTotal, budget),
    };
  });
  const noneWithinBudget =
    budget !== null && costs.length > 0 && costs.every((c) => c.budget === "exceeds");
  return { costs, noneWithinBudget };
}
