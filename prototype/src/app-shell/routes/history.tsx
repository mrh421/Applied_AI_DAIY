import { createFileRoute } from "@tanstack/react-router";

import { HistoryScreen } from "../../data-screens";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Your history — D.AI.Y" }] }),
  component: HistoryScreen,
});
