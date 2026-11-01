import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { CaseInputScreen } from "../../case-screens";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { case?: string } =>
    typeof search["case"] === "string" ? { case: search["case"] } : {},
  head: () => ({ meta: [{ title: "D.AI.Y — Safe AI help to repair it yourself" }] }),
  component: Start,
});

function Start() {
  const { case: caseId } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <CaseInputScreen
      {...(caseId ? { caseId } : {})}
      onStarted={(id) => void navigate({ to: "/case/$id", params: { id } })}
    />
  );
}
