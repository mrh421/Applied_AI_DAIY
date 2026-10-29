// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: () => {
      throw new Error("route failed");
    },
  },
}));

import server from "../server";

describe("server entry", () => {
  it("answers an error in a route with the error page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await server.fetch(new Request("http://localhost/"), {}, {});

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(await response.text()).toContain("This page didn't load");
  });

  it("answers a swallowed h3 error with the error page", async () => {
    vi.resetModules();
    vi.doMock("@tanstack/react-start/server-entry", () => ({
      default: {
        fetch: () =>
          new Response(JSON.stringify({ unhandled: true, message: "HTTPError" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          }),
      },
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { default: fresh } = await import("../server");

    const response = await fresh.fetch(new Request("http://localhost/"), {}, {});

    expect(await response.text()).toContain("This page didn't load");
  });
});
