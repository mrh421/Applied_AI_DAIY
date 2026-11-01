import { useState } from "react";

import { useCaseSession } from "../case-session";
import { useInventory } from "../inventory";
import { matchStock } from "../stock-matching";
import { Button, Dialog, TextField, announce } from "../ui-kit";
import { activeOption, guidesOf, parseAmount } from "./plan";

type Result = "done" | "storage-full" | null;

/** On completion: the used quantities, to confirm or correct, and the new inventory quantities. */
export function DeductDialog(p: { caseId: string; open: boolean; onClose: () => void }) {
  const { session, complete } = useCaseSession(p.caseId);
  const inventory = useInventory();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const option = session ? activeOption(session.record) : null;
  const rows = (option ? matchStock(guidesOf(option), inventory).materials : []).map((m) => {
    const item = inventory.materials.find((i) => i.id === m.inventoryItemId);
    // The quantity is entered in the unit of the inventory item, which is the one that is deducted.
    const unit = item?.quantity.unit ?? m.need.quantity.unit;
    const proposed = unit === m.need.quantity.unit ? m.need.quantity.amount : 0;
    const text = values[m.need.id] ?? String(proposed);
    return {
      m,
      item,
      unit,
      label: `Used: ${m.need.name} (${unit})`,
      text,
      amount: parseAmount(text),
    };
  });

  const close = () => {
    setValues({});
    setShowErrors(false);
    setResult(null);
    p.onClose();
  };

  const finish = (used: Parameters<typeof complete>[0]) => {
    const r = complete(used);
    if (r.ok) {
      setResult("done");
      announce("Project completed. The inventory is updated.");
    } else {
      setResult("storage-full");
    }
  };

  const confirm = () => {
    if (rows.some((r) => r.amount === null)) {
      setShowErrors(true);
      announce("Some used quantities are not valid.");
      return;
    }
    finish(
      rows.flatMap((r) =>
        (r.amount ?? 0) > 0
          ? [
              {
                name: r.m.need.name,
                quantity: { amount: r.amount as number, unit: r.unit },
                ...(r.item ? { inventoryItemId: r.item.id } : {}),
              },
            ]
          : [],
      ),
    );
  };

  return (
    <Dialog title="Complete project" open={p.open} onClose={close}>
      {result === "done" ? (
        <p>Project completed. The inventory is updated.</p>
      ) : (
        <>
          {rows.length === 0 && <p>No materials were needed.</p>}
          {rows.map((r) => (
            <div key={r.m.need.id} className="grid gap-1">
              <TextField
                label={r.label}
                value={r.text}
                onChange={(v) => setValues((prev) => ({ ...prev, [r.m.need.id]: v }))}
                {...(showErrors && r.amount === null
                  ? { error: "Enter a number of 0 or more, for example 2." }
                  : {})}
              />
              {r.item && r.amount !== null && (
                <p className="text-sm">
                  {`${r.m.need.name}: new quantity in inventory ${Math.max(0, r.item.quantity.amount - r.amount)} ${r.unit}`}
                </p>
              )}
            </div>
          ))}
          {result === "storage-full" && (
            <p role="alert">
              The device storage is full, so the project was not completed and the inventory is
              unchanged.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button label="Complete and deduct" onPress={confirm} />
            <Button
              label="Complete without deducting"
              variant="secondary"
              onPress={() => finish([])}
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
