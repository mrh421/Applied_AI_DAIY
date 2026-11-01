import { createFileRoute } from "@tanstack/react-router";

import { OffersScreen } from "../../../../materials-screens";

export const Route = createFileRoute("/case/$id/offers/$itemId")({
  head: () => ({ meta: [{ title: "Offers — D.AI.Y" }] }),
  component: Offers,
});

function Offers() {
  const { id, itemId } = Route.useParams();
  return <OffersScreen caseId={id} itemId={itemId} />;
}
