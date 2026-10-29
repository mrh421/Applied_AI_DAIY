import type { Unit } from "../case-model";
import type { InventoryFieldError, MaterialInput } from "./types";

const UNITS = {
  piece: true,
  mm: true,
  cm: true,
  m: true,
  m2: true,
  ml: true,
  l: true,
  g: true,
  kg: true,
} satisfies Record<Unit, true>;

function isUnit(value: unknown): value is Unit {
  return typeof value === "string" && Object.hasOwn(UNITS, value);
}

/** Each error names its field (ERROR-IDENTIFICATION). */
export function validateName(name: string): InventoryFieldError[] {
  return name.trim() === "" ? [{ field: "name", message: "Name is required." }] : [];
}

export function validateMaterial(input: MaterialInput): InventoryFieldError[] {
  const errors = validateName(input.name);
  if (input.amount === null || !Number.isFinite(input.amount) || input.amount < 0) {
    errors.push({ field: "amount", message: "Amount must be a number of 0 or more." });
  }
  if (!isUnit(input.unit)) {
    errors.push({ field: "unit", message: "Choose a unit." });
  }
  return errors;
}
