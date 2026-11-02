import type { SolutionOption } from "../case-model";
import type { CaseRecord } from "../history";
import { useInventory } from "../inventory";
import { Card } from "../ui-kit";
import { costsOf, totalText } from "./costs";
import { guidesOf } from "./plan";

/** The total cost of one option on the plan page, from the stock, the chosen offers and the AI's price estimates. */
export function CostSummary({ record, option }: { record: CaseRecord; option: SolutionOption }) {
  const inventory = useInventory();
  const guides = guidesOf(option);
  if (guides.length === 0) return null;
  const { costs } = costsOf(record, [option], inventory, record.budget);
  const cost = costs[0];
  if (!cost) return null;
  return (
    <Card tone="soft">
      <h2 className="text-xl">Estimated cost</h2>
      <p className="mt-1" data-testid="cost-summary">{`Materials: ${totalText(cost)}`}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Prices of things you do not own yet. Open "Materials and tools" to compare offers and to set
        a budget.
      </p>
    </Card>
  );
}
