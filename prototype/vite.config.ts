import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    // The app shell (MOD-app-shell) holds the routes, the router and the entries; the server entry is our SSR error wrapper.
    tanstackStart({
      router: {
        entry: "app-shell/router",
        routesDirectory: "app-shell/routes",
        generatedRouteTree: "app-shell/routeTree.gen.ts",
      },
      start: { entry: "app-shell/start" },
      server: { entry: "app-shell/server" },
    }),
    viteReact(),
    tailwindcss(),
    nitro({ preset: "node-server" }),
  ],
});
