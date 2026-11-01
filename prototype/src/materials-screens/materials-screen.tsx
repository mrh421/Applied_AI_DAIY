import { useState } from "react";

import { toolHint } from "../catalogue";
import { useCaseSession } from "../case-session";
import { saveMaterial, saveTool, useInventory } from "../inventory";
import { matchStock, type StockStatus } from "../stock-matching";
import { Button, Checkbox, LinkButton, Page, StatusBadge, announce } from "../ui-kit";
import { BudgetPanel } from "./budget-panel";
import { DeductDialog } from "./deduct-dialog";
import { activeOption, guidesOf, quantity } from "./plan";

function Status({ status }: { status: StockStatus }) {
  if (status.kind === "available") {
    return <StatusBadge tone="ok" icon="CircleCheck" text="Available" />;
  }
  if (status.kind === "partly-available") {
    return (
      <StatusBadge
        tone="warning"
        icon="TriangleAlert"
        text={`Partly available: ${quantity(status.missing)} missing`}
      />
    );
  }
  return <StatusBadge tone="danger" icon="CircleX" text={`Missing: ${quantity(status.missing)}`} />;
}

/** The materials and tools of a case against the inventory (UC-005, UC-009, UC-015). */
export function MaterialsScreen({ caseId }: { caseId: string }) {
  const { session } = useCaseSession(caseId);
  const inventory = useInventory();
  const [owned, setOwned] = useState<ReadonlySet<string>>(new Set());
  const [completing, setCompleting] = useState(false);
  const back = { label: "Back", onBack: () => window.history.back() };

  const option = session ? activeOption(session.record) : null;
  if (!session || !option) {
    return (
      <Page title="Materials and tools" back={back}>
        <p>There is no plan for this case yet.</p>
      </Page>
    );
  }

  const match = matchStock(guidesOf(option), inventory);
  const toggle = (key: string, on: boolean) =>
    setOwned((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  const save = () => {
    let saved = 0;
    for (const m of match.materials) {
      if (!owned.has(`m:${m.need.id}`)) continue;
      const r = saveMaterial({
        name: m.need.name,
        amount: m.need.quantity.amount,
        unit: m.need.quantity.unit,
      });
      if (r.ok) saved++;
    }
    for (const t of match.missingTools) {
      if (!owned.has(`t:${t.need.id}`)) continue;
      if (saveTool(t.need.name).ok) saved++;
    }
    setOwned(new Set());
    announce(`Saved ${saved} ${saved === 1 ? "item" : "items"} to your inventory.`);
  };

  const decline = () => {
    setOwned(new Set());
    announce("Nothing was saved to your inventory.");
  };

  return (
    <Page title="Materials and tools" back={back}>
      {match.materials.length > 0 && (
        <section aria-labelledby="materials-heading" className="grid gap-2">
          <h2 id="materials-heading" className="text-xl font-semibold">
            Materials
          </h2>
          <ul aria-label="Materials" className="grid gap-3">
            {match.materials.map((m) => (
              <li key={m.need.id} className="grid gap-1 rounded-md border p-3">
                <span className="font-medium">{`${m.need.name}, ${quantity(m.need.quantity)}`}</span>
                <Status status={m.status} />
                {m.status.kind !== "available" && (
                  <>
                    <LinkButton
                      label={`See offers for ${m.need.name}`}
                      href={`/case/${caseId}/offers/${m.need.id}`}
                    />
                    <Checkbox
                      label={`I own this: ${m.need.name}`}
                      checked={owned.has(`m:${m.need.id}`)}
                      onChange={(v) => toggle(`m:${m.need.id}`, v)}
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {match.missingTools.length > 0 && (
        <section aria-labelledby="missing-tools-heading" className="grid gap-2">
          <h2 id="missing-tools-heading" className="text-xl font-semibold">
            Missing tools
          </h2>
          <ul aria-label="Missing tools" className="grid gap-3">
            {match.missingTools.map((t) => (
              <li key={t.need.id} className="grid gap-1 rounded-md border p-3">
                <span className="font-medium">{t.need.name}</span>
                {toolHint(t.need) && <span>{toolHint(t.need)}</span>}
                <Checkbox
                  label={`I own this: ${t.need.name}`}
                  checked={owned.has(`t:${t.need.id}`)}
                  onChange={(v) => toggle(`t:${t.need.id}`, v)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {match.ownedTools.length > 0 && (
        <section aria-labelledby="owned-tools-heading" className="grid gap-2">
          <h2 id="owned-tools-heading" className="text-xl font-semibold">
            Tools you own
          </h2>
          <ul aria-label="Tools you own" className="list-disc pl-5">
            {match.ownedTools.map((t) => (
              <li key={t.need.id}>{t.need.name}</li>
            ))}
          </ul>
        </section>
      )}

      {owned.size > 0 && (
        <section aria-label="Save to inventory" className="grid gap-2 rounded-md border p-3">
          <p>Save the items you own to your inventory? You can also skip this.</p>
          <div className="flex flex-wrap gap-2">
            <Button label="Save to inventory" onPress={save} />
            <Button label="Not now" variant="secondary" onPress={decline} />
          </div>
        </section>
      )}

      <BudgetPanel caseId={caseId} />

      {session.record.status === "completed" ? (
        <StatusBadge tone="ok" icon="CircleCheck" text="Project completed" />
      ) : (
        <Button label="Complete project" onPress={() => setCompleting(true)} />
      )}
      <DeductDialog caseId={caseId} open={completing} onClose={() => setCompleting(false)} />
    </Page>
  );
}
