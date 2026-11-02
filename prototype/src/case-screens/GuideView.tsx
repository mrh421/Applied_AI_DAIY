import type { Guide, SkillLevel } from "../case-model";
import { illustration } from "../illustrations";
import { Badge, Card, Collapsible, Eyebrow, Icon, Img } from "../ui-kit";

/** Diagnosis, tools, materials, numbered steps, time and warnings (INSTRUCTION-STRUCTURE). */
export function GuideView(p: {
  guide: Guide;
  level: SkillLevel;
  /** The basics per step number; absent while they are loading or when they failed. */
  basics: Record<number, string> | undefined;
}) {
  const { guide } = p;
  return (
    <div className="grid gap-4">
      <Card>
        <Eyebrow primary>Diagnosis</Eyebrow>
        <p className="mt-2 text-lg">{guide.diagnosis}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>
            <Icon name="Clock" /> Time: {guide.estimatedMinutes.min} to {guide.estimatedMinutes.max}{" "}
            minutes
          </Badge>
        </div>
      </Card>
      {guide.warnings.length > 0 && (
        <Card tone="warning">
          <h4 className="flex items-center gap-2 font-sans font-semibold">
            <Icon name="TriangleAlert" /> Before you start
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {guide.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h4 className="flex items-center gap-2 font-sans font-semibold">
            <span className="text-primary">
              <Icon name="Wrench" />
            </span>{" "}
            Tools
          </h4>
          {guide.tools.length === 0 ? (
            <p className="mt-2">No tools needed.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {guide.tools.map((t) => (
                <li key={t.id}>{t.name}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h4 className="flex items-center gap-2 font-sans font-semibold">
            <span className="text-primary">
              <Icon name="Package" />
            </span>{" "}
            Materials
          </h4>
          {guide.materials.length === 0 ? (
            <p className="mt-2">No materials needed.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {guide.materials.map((m) => (
                <li key={m.id}>
                  {m.name}: {m.quantity.amount} {m.quantity.unit}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <ol aria-label="Steps" className="grid gap-3">
        {guide.steps.map((s) => {
          const basics = p.basics?.[s.n];
          return (
            <li key={s.n} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-sm"
                >
                  {s.n}
                </span>
                <div className="grid min-w-0 flex-1 gap-2">
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
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
