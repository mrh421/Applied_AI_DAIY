import type { PartSpec, Quantity } from "../case-model";
import listings from "../../data/catalogue/listings.json";
import products from "../../data/catalogue/products.json";
import { offerSchema, type Datum, type Offer } from "./schema";
import { matchesRequirements } from "./spec-match";

import { z } from "zod";

const OFFERS: Offer[] = z.array(offerSchema).parse([...listings, ...products]);

/** An unverified value does not meet a requirement. */
function known<T>(d: Datum<T>): T | undefined {
  return d.certainty === "unverified" || d.value === null ? undefined : d.value;
}

function price(o: Offer): number {
  return known(o.unitPrice)?.amount ?? Number.POSITIVE_INFINITY;
}

/** Filters and orders the given offers; searchOffers applies it to the sample catalogue. */
export function rankOffers(
  all: readonly Offer[],
  item: { name: string; spec?: PartSpec },
  missing: Quantity,
): { offers: Offer[]; noMatch: boolean } {
  // SUGGESTIONS-ONLY-FOR-MISSING: nothing missing, nothing to suggest.
  if (missing.amount <= 0) return { offers: [], noMatch: false };
  const offers = all
    .filter((o) => o.packSize.unit === missing.unit)
    .filter((o) =>
      matchesRequirements(item.name, item.spec, {
        title: o.title,
        dimensionsMm: known(o.spec.dimensionsMm),
        material: known(o.spec.material),
        function: known(o.spec.function),
      }),
    )
    .map((o, i) => ({ o, i }))
    .sort((a, b) => {
      const sh = Number(b.o.condition === "second-hand") - Number(a.o.condition === "second-hand");
      if (sh !== 0) return sh;
      const p = price(a.o) - price(b.o);
      return Number.isNaN(p) || p === 0 ? a.i - b.i : p;
    })
    .map(({ o }) => o);
  return { offers, noMatch: offers.length === 0 };
}

export function searchOffers(
  item: { name: string; spec?: PartSpec },
  missing: Quantity,
): { offers: Offer[]; noMatch: boolean } {
  return rankOffers(OFFERS, item, missing);
}
