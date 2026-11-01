import { createFileRoute } from "@tanstack/react-router";

import { ProfileScreen } from "../../data-screens";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Your skills — D.AI.Y" }] }),
  component: ProfileScreen,
});
