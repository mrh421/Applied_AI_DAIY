import { createFileRoute } from "@tanstack/react-router";

import { HistoryScreen } from "../../data-screens";

export const Route = createFileRoute("/history")({ component: HistoryScreen });
