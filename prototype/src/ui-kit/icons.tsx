import {
  ArrowLeft,
  Check,
  CircleCheck,
  CircleX,
  ExternalLink,
  Info,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  ArrowLeft,
  Check,
  CircleCheck,
  CircleX,
  ExternalLink,
  Info,
  Trash2,
  TriangleAlert,
  X,
};

/** The names of the lucide icons the app uses. */
export type IconName = keyof typeof ICONS;

/** An icon is decoration: the text beside it, or the label of its button, names it. */
export function Icon({ name }: { name: IconName }) {
  const Component: LucideIcon = ICONS[name];
  return <Component aria-hidden="true" focusable="false" className="size-4 shrink-0" />;
}
