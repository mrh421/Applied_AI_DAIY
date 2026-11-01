import type { SkillLevel, WorkPackage } from "../case-model";
import { illustration } from "../illustrations";
import { Collapsible, Img } from "../ui-kit";

/** The guide of a package: diagnosis, tools, materials, numbered steps, time and warnings. */
export function GuideView(p: {
  pkg: WorkPackage;
  level: SkillLevel;
  basics: Record<number, string>;
}) {
  const guide = p.pkg.guide;
  if (!guide) return null;
  return (
    <section className="grid gap-2" aria-label={`Guide: ${p.pkg.title}`}>
      <p>{guide.diagnosis}</p>
      <p>
        Time: {guide.estimatedMinutes.min} to {guide.estimatedMinutes.max} minutes
      </p>
      <h4 className="font-medium">Tools</h4>
      <ul className="list-disc pl-5">
        {guide.tools.map((t) => (
          <li key={t.id}>{t.name}</li>
        ))}
      </ul>
      <h4 className="font-medium">Materials</h4>
      <ul className="list-disc pl-5">
        {guide.materials.map((m) => (
          <li key={m.id}>
            {m.name}: {m.quantity.amount} {m.quantity.unit}
          </li>
        ))}
      </ul>
      <h4 className="font-medium">Warnings</h4>
      <ul className="list-disc pl-5">
        {guide.warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <ol aria-label="Steps" className="grid list-decimal gap-3 pl-5">
        {guide.steps.map((s) => {
          const basics = p.basics[s.n];
          return (
            <li key={s.n} className="grid gap-1">
              <span>{s.text}</span>
              {s.imageIds.map((id) => {
                const image = illustration(id);
                return image ? <Img key={id} src={image.src} alt={image.alt} /> : null;
              })}
              {basics && (
                <Collapsible
                  summary={`Basics for step ${s.n}`}
                  defaultOpen={p.level === "beginner"}
                >
                  {basics}
                </Collapsible>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
