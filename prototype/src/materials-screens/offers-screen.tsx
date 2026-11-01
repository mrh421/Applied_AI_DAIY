import { useEffect, useMemo, useState } from "react";

import type { Money, PartSpec } from "../case-model";
import {
  CATALOGUE_IS_SAMPLE,
  printedPartNote,
  searchModels,
  searchOffers,
  type Datum,
  type ModelEntry,
  type Offer,
} from "../catalogue";
import { useCaseSession } from "../case-session";
import { useInventory } from "../inventory";
import { matchStock } from "../stock-matching";
import { Button, LinkButton, Page, StatusBadge } from "../ui-kit";
import { activeOption, certaintyText, dimensions, guidesOf, money } from "./plan";

const AVAILABILITY = {
  "in-stock": "In stock",
  limited: "Limited stock",
  "out-of-stock": "Out of stock",
} as const;

const NOT_STATED = "not stated";

type Dims = NonNullable<PartSpec["dimensionsMm"]>;

// A datum as one line of text: its value (or `not stated`) and its certainty label.
function line<T>(label: string, d: Datum<T>, show: (v: T) => string): string {
  const value = d.value === null ? NOT_STATED : show(d.value);
  return `${label}: ${value} (${certaintyText(d)})`;
}

// Compatibility that is not verified is `uncertain` (UNVERIFIED-COMPATIBILITY-UNCERTAIN).
const compatibility = (d: Offer["compatibility"]) =>
  `Compatibility: ${d.certainty === "verified" ? "fits" : "uncertain"} (${certaintyText(d)})`;

function OfferCard(p: { offer: Offer; chosen: boolean; onChoose: (on: boolean) => void }) {
  const o = p.offer;
  return (
    <article aria-label={o.title} className="grid gap-2 rounded-md border p-3">
      <h3 className="font-medium">{o.title}</h3>
      <ul className="grid gap-1 text-sm">
        <li>{`Condition: ${o.condition === "new" ? "New" : "Second-hand"}`}</li>
        <li>
          {line<Money>(
            `Price`,
            o.unitPrice,
            (v) => `${money(v)} per ${o.packSize.amount} ${o.packSize.unit}`,
          )}
        </li>
        <li>{line<Dims>("Dimensions", o.spec.dimensionsMm, dimensions)}</li>
        <li>{line<string>("Material", o.spec.material, (v) => v)}</li>
        <li>{line<string>("Function", o.spec.function, (v) => v)}</li>
        <li>{compatibility(o.compatibility)}</li>
        <li>
          {line<keyof typeof AVAILABILITY>("Availability", o.availability, (v) => AVAILABILITY[v])}
        </li>
        <li>{`Data as of ${o.dataAsOf}`}</li>
        <li>{`Source: ${o.source.name}`}</li>
        {o.sustainabilityReason && (
          <li>{`Why this may be more sustainable: ${o.sustainabilityReason}`}</li>
        )}
      </ul>
      {p.chosen && <StatusBadge tone="info" icon="Check" text="Chosen for the estimate" />}
      <div className="flex flex-wrap gap-2">
        <LinkButton label={`Go to seller: ${o.title}`} href={o.sellerUrl} external />
        <Button
          label={
            p.chosen ? "Remove this offer from the estimate" : "Use this offer for the estimate"
          }
          variant="secondary"
          onPress={() => p.onChoose(!p.chosen)}
        />
      </div>
    </article>
  );
}

function ModelCard({ model: m }: { model: ModelEntry }) {
  return (
    <article aria-label={m.title} className="grid gap-2 rounded-md border p-3">
      <h3 className="font-medium">{m.title}</h3>
      <ul className="grid gap-1 text-sm">
        <li>{`Dimensions: ${dimensions(m.dimensionsMm)}`}</li>
        <li>{`Material requirements: ${m.materialRequirements}`}</li>
        <li>{`Licence: ${m.licence}`}</li>
        <li>{`Intended use: ${m.intendedUse}`}</li>
      </ul>
      <div>
        <LinkButton label={`Open the model at ${m.provider}`} href={m.url} external />
      </div>
    </article>
  );
}

/** Offers and a 3D-model suggestion for one missing item (UC-006, UC-007). */
export function OffersScreen({ caseId, itemId }: { caseId: string; itemId: string }) {
  const { session, setChosenOffer } = useCaseSession(caseId);
  const inventory = useInventory();
  const [models, setModels] = useState<ModelEntry[]>([]);
  const option = session ? activeOption(session.record) : null;
  const found = useMemo(
    () =>
      option
        ? matchStock(guidesOf(option), inventory).materials.find((m) => m.need.id === itemId)
        : undefined,
    [option, inventory, itemId],
  );

  useEffect(() => {
    setModels([]);
    if (!found || found.status.kind === "available") return;
    let current = true;
    void searchModels(found.need).then((m) => current && setModels(m));
    return () => {
      current = false;
    };
  }, [found]);

  const back = { label: "Back", onBack: () => window.history.back() };
  if (!session || !found) {
    return (
      <Page title="Offers" back={back}>
        <p>This item is not part of the plan.</p>
      </Page>
    );
  }
  const { need, status } = found;

  if (status.kind === "available") {
    return (
      <Page title={`Offers for ${need.name}`} back={back}>
        <p>{`${need.name} is already in your inventory in sufficient quantity, so no offers are shown.`}</p>
      </Page>
    );
  }

  const { offers } = searchOffers({ name: need.name, spec: need.spec }, status.missing);
  const note = printedPartNote(need);
  const chosenId = session.record.chosenOffers[itemId];

  return (
    <Page title={`Offers for ${need.name}`} back={back}>
      {CATALOGUE_IS_SAMPLE && (
        <p role="note" className="rounded-md border p-3 text-sm">
          Sample data: these offers are examples for demonstration, not live prices.
        </p>
      )}
      {offers.length === 0 ? (
        <p>{`No matching offer was found for ${need.name}.`}</p>
      ) : (
        offers.map((o) => (
          <OfferCard
            key={o.id}
            offer={o}
            chosen={chosenId === o.id}
            onChoose={(on) => setChosenOffer(itemId, on ? o.id : null)}
          />
        ))
      )}
      {models.length > 0 && (
        <section aria-labelledby="models-heading" className="grid gap-2">
          <h2 id="models-heading" className="text-xl font-semibold">
            3D model suggestion
          </h2>
          {models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </section>
      )}
      {models.length === 0 && note && <p>{note}</p>}
    </Page>
  );
}
