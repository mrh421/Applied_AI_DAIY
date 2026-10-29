import type { Quantity, Unit } from "../case-model";

export type MaterialItem = { id: string; name: string; quantity: Quantity; location?: string };
export type ToolItem = { id: string; name: string };
export type MaterialInput = {
  name: string;
  amount: number | null;
  unit: Unit | null;
  location?: string;
};
export type InventoryFieldError = { field: "name" | "amount" | "unit"; message: string };
