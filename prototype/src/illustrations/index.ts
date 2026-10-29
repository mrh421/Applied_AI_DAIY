import { CATALOGUE } from "./catalogue";

export type Illustration = { id: string; topic: string; src: string; alt: string };

/** The ids and topics the AI may reference (UC-003). */
export function illustrationIndex(): { id: string; topic: string }[] {
  return CATALOGUE.map(({ id, topic }) => ({ id, topic }));
}

/** The entry of an id, or undefined for an unknown id (ILLUSTRATIVE-IMAGES, TEXT-ALTERNATIVES). */
export function illustration(id: string): Illustration | undefined {
  return CATALOGUE.find((entry) => entry.id === id);
}
