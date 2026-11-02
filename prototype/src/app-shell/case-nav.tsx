import { useCaseSession } from "../case-session";
import { LinkButton } from "../ui-kit";

/** From the outcome to the materials and to the work of each package that has a guide. */
export function CaseNav({ caseId }: { caseId: string }) {
  const { session } = useCaseSession(caseId);
  const outcome = session?.record.outcome;
  if (outcome?.type !== "guidance") return null;
  const option =
    outcome.options.find((o) => o.id === session?.record.chosenOptionId) ?? outcome.options[0];
  const packages = option?.packages.filter((p) => p.guide) ?? [];
  return (
    <nav
      aria-label="Next steps"
      className="mx-auto flex w-full max-w-6xl flex-wrap gap-2 px-5 pb-24"
    >
      <LinkButton label="Materials and tools" href={`/case/${caseId}/materials`} />
      {packages.map((p) => (
        <LinkButton
          key={p.id}
          label={`Start the work: ${p.title}`}
          href={`/case/${caseId}/work/${encodeURIComponent(p.id)}`}
        />
      ))}
    </nav>
  );
}
