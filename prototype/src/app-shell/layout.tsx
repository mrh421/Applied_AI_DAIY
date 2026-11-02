import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button, Icon } from "../ui-kit";

// These screens bring their own back control.
const OWN_BACK = [/\/materials$/, /\/offers\/[^/]+$/];

const NAV = [
  { to: "/", label: "New case" },
  { to: "/history", label: "History" },
  { to: "/inventory", label: "Inventory" },
  { to: "/profile", label: "Skills" },
] as const;

/** The header with navigation and a back control on every page but the start (GO-BACK). */
export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const caseMatch = /^\/case\/([^/]+)\/?$/.exec(pathname);

  const goBack = () => {
    // From the outcome back to the open case: the input is restored (route `/?case=<id>`).
    if (caseMatch?.[1]) {
      void router.navigate({ to: "/", search: { case: caseMatch[1] } });
    } else if (window.history.length > 1) {
      router.history.back();
    } else {
      void router.navigate({ to: pathname.startsWith("/case/") ? "/history" : "/" });
    }
  };

  const showBack = pathname !== "/" && !OWN_BACK.some((r) => r.test(pathname));

  return (
    <div className="min-h-screen bg-background bg-hero">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight"
        >
          <span className="text-primary [&>svg]:size-6">
            <Icon name="Sprout" />
          </span>{" "}
          <span>D.AI.Y</span>
        </Link>
        <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
          <Icon name="Leaf" /> Repair first. Reuse second.
        </span>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5">
        <nav aria-label="Main" className="flex gap-x-4 gap-y-1 overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="min-h-6 whitespace-nowrap text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              activeProps={{ "aria-current": "page", className: "text-foreground underline" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        {showBack && <Button label="Back" icon="ArrowLeft" variant="secondary" onPress={goBack} />}
      </div>
      {children}
    </div>
  );
}
