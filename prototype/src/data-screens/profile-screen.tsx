import { SKILL_AREAS, type SkillArea, type SkillLevel } from "../case-model";
import { clearLevel, setLevel, useProfile } from "../profile";
import { Page, Select, announce } from "../ui-kit";

type Choice = SkillLevel | "unset";

const OPTIONS: { value: Choice; label: string }[] = [
  { value: "unset", label: "Not set (treated as beginner)" },
  { value: "beginner", label: "Beginner" },
  { value: "some-experience", label: "Some experience" },
  { value: "experienced", label: "Experienced" },
];

export const AREA_LABEL: Record<SkillArea, string> = {
  plumbing: "Plumbing",
  "electrical-devices": "Electrical devices",
  woodwork: "Woodwork",
  "walls-and-floors": "Walls and floors",
  furniture: "Furniture",
  garden: "Garden",
  bikes: "Bikes",
  textiles: "Textiles",
  other: "Other",
};

/** The skill level per area; an area left open counts as beginner (SKILL-PROFILE). */
export function ProfileScreen() {
  const profile = useProfile();

  const change = (area: SkillArea, choice: Choice) => {
    if (choice === "unset") clearLevel(area);
    else setLevel(area, choice);
    announce(`${AREA_LABEL[area]} saved.`);
  };

  return (
    <Page title="Your skills">
      <p>Say how experienced you are in each area. Areas you leave open count as beginner.</p>
      {SKILL_AREAS.map((area) => (
        <Select
          key={area}
          label={AREA_LABEL[area]}
          value={profile.levels[area] ?? "unset"}
          options={OPTIONS}
          onChange={(v) => change(area, v)}
        />
      ))}
    </Page>
  );
}
