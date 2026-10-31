export type { Certainty, Datum, ModelEntry, Offer } from "./schema";
export { printedPartNote, toolHint } from "./hints";
export { searchModels } from "./models";
export { searchOffers } from "./offers";

/** The whole catalogue is sample data (SAMPLE-PRODUCT-DATA). */
export const CATALOGUE_IS_SAMPLE = true as const;
