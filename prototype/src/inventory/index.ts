import { useSyncExternalStore } from "react";

import type { InventorySnapshot } from "../case-model";
import { localStore } from "../local-store";
import {
  deduct,
  listMaterials,
  materialsSnapshot,
  removeMaterial,
  saveMaterial,
} from "./materials";
import { listTools, removeTool, saveTool } from "./tools";
import type { MaterialItem, ToolItem } from "./types";

export type { InventoryFieldError, MaterialInput, MaterialItem, ToolItem } from "./types";
export { deduct, listMaterials, listTools, removeMaterial, removeTool, saveMaterial, saveTool };

export function snapshot(): InventorySnapshot {
  return { materials: materialsSnapshot(), tools: listTools().map((t) => ({ name: t.name })) };
}

type Inventory = { materials: MaterialItem[]; tools: ToolItem[] };

const EMPTY: Inventory = { materials: [], tools: [] };
let cache: Inventory = EMPTY;
let cacheKey = "";

function read(): Inventory {
  const next = { materials: listMaterials(), tools: listTools() };
  const key = JSON.stringify(next);
  if (key !== cacheKey) {
    cacheKey = key;
    cache = next;
  }
  return cache;
}

function subscribe(listener: () => void): () => void {
  return localStore.subscribe((c) => {
    if (c === "materials" || c === "tools") listener();
  });
}

export function useInventory(): Inventory {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
