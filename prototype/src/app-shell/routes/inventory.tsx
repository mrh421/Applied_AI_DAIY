import { createFileRoute } from "@tanstack/react-router";

import { InventoryScreen } from "../../data-screens";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Your inventory — D.AI.Y" }] }),
  component: InventoryScreen,
});
