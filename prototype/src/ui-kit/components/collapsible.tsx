import type { ReactNode } from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";

export function CollapsibleShell(p: {
  summary: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  return (
    <CollapsiblePrimitive.Root defaultOpen={p.defaultOpen} className="rounded-md border">
      <CollapsiblePrimitive.Trigger className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {p.summary}
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="px-3 pb-3 text-sm">
        {p.children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
