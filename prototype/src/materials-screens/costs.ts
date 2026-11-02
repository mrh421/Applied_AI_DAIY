import { searchOffers, type Offer } from "../catalogue";
import type { Money, SolutionOption } from "../case-model";
import { estimateCosts } from "../cost-estimate";
import type { OptionCost } from "../cost-estimate";
import type { CaseRecord } from "../history";
import type { MaterialItem, ToolItem } from "../inventory";
import { matchStock } from "../stock-matching";
import { guidesOf } from "./plan";

/** The cost of each option of a case, with the offers the person chose and the AI's price estimates for the rest. */
export function costsOf(
  record: CaseRecord,
  options: SolutionOption[],
  inventory: { materials: MaterialItem[]; tools: ToolItem[] },
  budget: Money | null,
): { costs: OptionCost[]; noneWithinBudget: boolean } {
  return estimateCosts(
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
    budget,
  );
}

const eur = (n: number) => `${Math.round(n)} EUR`;

/** The total of an option in words: an exact sum, or a range that says it is an estimate. */
export function totalText(c: OptionCost): string {
  if (c.estimatedTotal) {
    const { min, max } = c.estimatedTotal;
    return `about ${min === max ? eur(min) : `${eur(min)} to ${eur(max)}`} (an estimate, please check the prices)`;
  }
  const total = `${c.total.amount.toFixed(2)} EUR`;
  return c.incomplete ? `${total} (some prices are unknown)` : total;
}
