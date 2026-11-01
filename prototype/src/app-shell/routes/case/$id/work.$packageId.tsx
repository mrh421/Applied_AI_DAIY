import { createFileRoute } from "@tanstack/react-router";

import { ExecutionScreen } from "../../../../case-screens";

export const Route = createFileRoute("/case/$id/work/$packageId")({ component: Work });

function Work() {
  const { id, packageId } = Route.useParams();
  return <ExecutionScreen caseId={id} packageId={packageId} />;
}
