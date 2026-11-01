import { createFileRoute } from "@tanstack/react-router";

import { InventoryScreen } from "../../data-screens";

export const Route = createFileRoute("/inventory")({ component: InventoryScreen });
