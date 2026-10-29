import type { InventorySnapshot } from "../case-model";
import { localStore } from "../local-store";
import type { InventoryFieldError, MaterialInput, MaterialItem } from "./types";
import { validateMaterial } from "./validate";

type Stored = Omit<MaterialItem, "id">;

export function listMaterials(): MaterialItem[] {
  return localStore.list<Stored>("materials").map((r) => ({ id: r.id, ...r.data }));
}

export function saveMaterial(
  input: MaterialInput,
  id?: string,
): { ok: true; item: MaterialItem } | { ok: false; errors: InventoryFieldError[] } {
  const errors = validateMaterial(input);
  if (errors.length > 0) return { ok: false, errors };
  const location = input.location?.trim();
  const data: Stored = {
    name: input.name.trim(),
    quantity: {
      amount: input.amount as number,
      unit: input.unit as NonNullable<MaterialInput["unit"]>,
    },
    ...(location ? { location } : {}),
  };
  const itemId = id ?? crypto.randomUUID();
  localStore.put("materials", itemId, data);
  return { ok: true, item: { id: itemId, ...data } };
}

export function removeMaterial(id: string): void {
  localStore.remove("materials", id);
}

export function deduct(used: { itemId: string; amount: number }[]): MaterialItem[] {
  const changed = new Map<string, MaterialItem>();
  for (const { itemId, amount } of used) {
    const record = localStore.get<Stored>("materials", itemId);
    if (!record || record.deleted) continue;
    const held = changed.get(itemId)?.quantity.amount ?? record.data.quantity.amount;
    const data: Stored = {
      ...record.data,
      quantity: { ...record.data.quantity, amount: Math.max(0, held - amount) },
    };
    localStore.put("materials", itemId, data);
    changed.set(itemId, { id: itemId, ...data });
  }
  return [...changed.values()];
}

export function materialsSnapshot(): InventorySnapshot["materials"] {
  return listMaterials().map((m) => ({ name: m.name, quantity: m.quantity }));
}
