import { createFileRoute } from "@tanstack/react-router";

import { CaseNav } from "../../../case-nav";
import { OutcomeScreen, QuestionsScreen } from "../../../../case-screens";
import { useCaseSession } from "../../../../case-session";

export const Route = createFileRoute("/case/$id/")({
  head: () => ({ meta: [{ title: "Your case — D.AI.Y" }] }),
  component: CaseRoute,
});

/** The questions while the assessment asks for more, the outcome otherwise. */
function CaseRoute() {
  const { id } = Route.useParams();
  const { session } = useCaseSession(id);
  if (session?.record.outcome?.type === "questions") return <QuestionsScreen caseId={id} />;
  return (
    <>
      <OutcomeScreen caseId={id} />
      <CaseNav caseId={id} />
    </>
  );
}
