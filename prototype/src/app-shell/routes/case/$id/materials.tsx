import { createFileRoute } from "@tanstack/react-router";

import { MaterialsScreen } from "../../../../materials-screens";

export const Route = createFileRoute("/case/$id/materials")({
  head: () => ({ meta: [{ title: "Materials and tools — D.AI.Y" }] }),
  component: Materials,
});

function Materials() {
  const { id } = Route.useParams();
  return <MaterialsScreen caseId={id} />;
}
