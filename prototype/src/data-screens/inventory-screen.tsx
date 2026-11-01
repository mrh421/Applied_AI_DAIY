import { useState } from "react";

import type { Unit } from "../case-model";
import {
  removeMaterial,
  removeTool,
  saveMaterial,
  saveTool,
  useInventory,
  type InventoryFieldError,
} from "../inventory";
import { parseAmount } from "../materials-screens/plan";
import { Button, Page, Select, TextField, announce } from "../ui-kit";

const UNITS: Unit[] = ["piece", "mm", "cm", "m", "m2", "ml", "l", "g", "kg"];
const UNIT_OPTIONS = UNITS.map((u) => ({ value: u, label: u }));

const errorOf = (errors: InventoryFieldError[], field: InventoryFieldError["field"]) =>
  errors.find((e) => e.field === field)?.message;

/** The `error` prop only when there is one (exactOptionalPropertyTypes). */
const shown = (message: string | undefined) => (message === undefined ? {} : { error: message });

/** Add, change and remove materials and tools; each error names its field (UC-021). */
export function InventoryScreen() {
  const inventory = useInventory();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<InventoryFieldError[]>([]);
  const [tool, setTool] = useState("");
  const [toolError, setToolError] = useState<string | undefined>();

  const reset = () => {
    setEditing(null);
    setName("");
    setAmount("");
    setUnit(null);
    setLocation("");
    setErrors([]);
  };

  const save = () => {
    const result = saveMaterial(
      { name, amount: parseAmount(amount), unit, location },
      editing ?? undefined,
    );
    if (!result.ok) {
      setErrors(result.errors);
      announce(result.errors.map((e) => e.message).join(" "));
      return;
    }
    announce(`${result.item.name} saved.`);
    reset();
  };

  const edit = (id: string) => {
    const m = inventory.materials.find((x) => x.id === id);
    if (!m) return;
    setEditing(id);
    setName(m.name);
    setAmount(String(m.quantity.amount));
    setUnit(m.quantity.unit);
    setLocation(m.location ?? "");
    setErrors([]);
  };

  const addTool = () => {
    const result = saveTool(tool);
    if (!result.ok) {
      setToolError(errorOf(result.errors, "name"));
      announce(result.errors.map((e) => e.message).join(" "));
      return;
    }
    announce(`${tool.trim()} saved.`);
    setTool("");
    setToolError(undefined);
  };

  return (
    <Page title="Your inventory">
      <section className="grid gap-3" aria-labelledby="materials-heading">
        <h2 id="materials-heading" className="text-xl font-semibold">
          Materials
        </h2>
        {inventory.materials.length === 0 && <p>You have no materials saved.</p>}
        <ul className="grid gap-2">
          {inventory.materials.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-2">
              <span>
                {m.name}: {m.quantity.amount} {m.quantity.unit}
                {m.location ? `, ${m.location}` : ""}
              </span>
              <Button label={`Change ${m.name}`} variant="secondary" onPress={() => edit(m.id)} />
              <Button
                label={`Remove ${m.name}`}
                icon="Trash2"
                variant="secondary"
                onPress={() => {
                  removeMaterial(m.id);
                  if (editing === m.id) reset();
                  announce(`${m.name} removed.`);
                }}
              />
            </li>
          ))}
        </ul>
        <TextField
          label="Material name"
          value={name}
          onChange={setName}
          {...shown(errorOf(errors, "name"))}
        />
        <TextField
          label="Amount"
          value={amount}
          onChange={setAmount}
          {...shown(errorOf(errors, "amount"))}
        />
        <Select
          label="Unit"
          value={unit}
          options={UNIT_OPTIONS}
          onChange={setUnit}
          {...shown(errorOf(errors, "unit"))}
        />
        <TextField label="Where it is kept (optional)" value={location} onChange={setLocation} />
        <div className="flex gap-2">
          <Button label={editing ? "Save changes" : "Add material"} onPress={save} />
          {editing && <Button label="Cancel" variant="secondary" onPress={reset} />}
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-xl font-semibold">
          Tools
        </h2>
        {inventory.tools.length === 0 && <p>You have no tools saved.</p>}
        <ul className="grid gap-2">
          {inventory.tools.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-2">
              <span>{t.name}</span>
              <Button
                label={`Remove ${t.name}`}
                icon="Trash2"
                variant="secondary"
                onPress={() => {
                  removeTool(t.id);
                  announce(`${t.name} removed.`);
                }}
              />
            </li>
          ))}
        </ul>
        <TextField label="Tool name" value={tool} onChange={setTool} {...shown(toolError)} />
        <Button label="Add tool" onPress={addTool} />
      </section>
    </Page>
  );
}
