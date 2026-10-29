import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

export function CheckboxShell(p: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <CheckboxPrimitive.Root
      id={p.id}
      checked={p.checked}
      onCheckedChange={(c) => p.onChange(c === true)}
      className="grid size-6 shrink-0 cursor-pointer place-content-center rounded-sm border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <CheckboxPrimitive.Indicator>
        <Check aria-hidden="true" className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
