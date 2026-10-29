import { localStore } from "../local-store";
import type { InventoryFieldError, ToolItem } from "./types";
import { validateName } from "./validate";

type Stored = Omit<ToolItem, "id">;

export function listTools(): ToolItem[] {
  return localStore.list<Stored>("tools").map((r) => ({ id: r.id, ...r.data }));
}

export function saveTool(
  name: string,
  id?: string,
): { ok: true; item: ToolItem } | { ok: false; errors: InventoryFieldError[] } {
  const errors = validateName(name);
  if (errors.length > 0) return { ok: false, errors };
  const itemId = id ?? crypto.randomUUID();
  const data: Stored = { name: name.trim() };
  localStore.put("tools", itemId, data);
  return { ok: true, item: { id: itemId, ...data } };
}

export function removeTool(id: string): void {
  localStore.remove("tools", id);
}
