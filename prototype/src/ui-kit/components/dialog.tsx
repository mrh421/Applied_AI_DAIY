import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function DialogShell(p: {
  title: string;
  open: boolean;
  onClose: () => void;
  closeControl: ReactNode;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={p.open} onOpenChange={(o) => !o && p.onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 grid max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg"
        >
          <DialogPrimitive.Title className="text-lg font-semibold">{p.title}</DialogPrimitive.Title>
          {p.children}
          {p.closeControl}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
