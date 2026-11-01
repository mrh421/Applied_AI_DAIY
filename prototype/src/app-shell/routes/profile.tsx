import { createFileRoute } from "@tanstack/react-router";

import { ProfileScreen } from "../../data-screens";

export const Route = createFileRoute("/profile")({ component: ProfileScreen });
