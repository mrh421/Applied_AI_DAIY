import type { Guide, SkillLevel } from "../case-model";
import { illustration } from "../illustrations";
import { Collapsible, Img } from "../ui-kit";

/** Diagnosis, tools, materials, numbered steps, time and warnings (INSTRUCTION-STRUCTURE). */
export function GuideView(p: {
  guide: Guide;
  level: SkillLevel;
  /** The basics per step number; absent while they are loading or when they failed. */
  basics: Record<number, string> | undefined;
}) {
  const { guide } = p;
  return (
    <div className="grid gap-3">
      <section>
        <h4 className="font-medium">Diagnosis</h4>
        <p>{guide.diagnosis}</p>
      </section>
      <section>
        <h4 className="font-medium">Tools</h4>
        {guide.tools.length === 0 ? (
          <p>No tools needed.</p>
        ) : (
          <ul className="list-disc pl-5">
            {guide.tools.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4 className="font-medium">Materials</h4>
        {guide.materials.length === 0 ? (
          <p>No materials needed.</p>
        ) : (
          <ul className="list-disc pl-5">
            {guide.materials.map((m) => (
              <li key={m.id}>
                {m.name}: {m.quantity.amount} {m.quantity.unit}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p>
        Time: {guide.estimatedMinutes.min} to {guide.estimatedMinutes.max} minutes
      </p>
      {guide.warnings.length > 0 && (
        <section>
          <h4 className="font-medium">Warnings</h4>
          <ul className="list-disc pl-5">
            {guide.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      )}
      <ol aria-label="Steps" className="grid list-decimal gap-3 pl-5">
        {guide.steps.map((s) => {
          const basics = p.basics?.[s.n];
          return (
            <li key={s.n}>
              <p>{s.text}</p>
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
    </div>
  );
}
