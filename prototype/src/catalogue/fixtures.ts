import type { Offer } from "./schema";

/** Builds a fully verified offer; tests override single fields. */
export function offer(over: Partial<Offer> & { id: string }): Offer {
  return {
    title: "Test offer",
    condition: "new",
    unitPrice: { certainty: "verified", value: { amount: 5, currency: "EUR" }, source: "test" },
    packSize: { amount: 1, unit: "piece" },
    spec: {
      dimensionsMm: { certainty: "verified", value: { diameter: 20 }, source: "test" },
      material: { certainty: "verified", value: "brass", source: "test" },
      function: { certainty: "verified", value: "seal", source: "test" },
    },
    compatibility: { certainty: "verified", value: "fits", source: "test" },
    availability: { certainty: "verified", value: "in-stock", source: "test" },
    dataAsOf: "2026-10-01",
    source: { name: "Test source", url: "https://example.org/source" },
    sellerUrl: "https://example.org/seller",
    sustainabilityReason: null,
    ...over,
  };
}
