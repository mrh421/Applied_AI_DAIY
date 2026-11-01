// @vitest-environment node
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createChecker } from "./check";

let server: Server;
let base: string;
let requests: { method: string; path: string }[];

beforeAll(async () => {
  server = createServer((req, res) => {
    const path = req.url ?? "";
    requests.push({ method: req.method ?? "", path });
    if (path === "/ok") res.writeHead(200).end();
    else if (path === "/moved") res.writeHead(301, { location: "/ok" }).end();
    else if (path === "/head-refused") res.writeHead(req.method === "HEAD" ? 405 : 200).end();
    else if (path === "/slow") setTimeout(() => res.writeHead(200).end(), 500);
    else res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.closeAllConnections();
  server.close();
});
beforeEach(() => {
  requests = [];
});

const checker = (over = {}) => createChecker({ allowed: () => true, timeoutMs: 100, ...over });

describe("checkLink", () => {
  it("takes a 200 answer as working and a redirect as working too", async () => {
    const check = checker();
    expect(await check({ url: `${base}/ok` })).toEqual({ reachable: true });
    expect(await check({ url: `${base}/moved` })).toEqual({ reachable: true });
  });

  it("takes a 404 and a timeout as not working", async () => {
    const check = checker();
    expect(await check({ url: `${base}/gone` })).toEqual({ reachable: false });
    expect(await check({ url: `${base}/slow` })).toEqual({ reachable: false });
  });

  it("asks again with GET when HEAD is refused", async () => {
    expect(await checker()({ url: `${base}/head-refused` })).toEqual({ reachable: true });
    expect(requests.map((r) => r.method)).toEqual(["HEAD", "GET"]);
  });

  it("makes no second request within the cache time, and asks again after it", async () => {
    let now = 0;
    const check = checker({ now: () => now });
    await check({ url: `${base}/ok` });
    await check({ url: `${base}/ok` });
    expect(requests).toHaveLength(1);
    now = 60 * 60 * 1000 + 1;
    await check({ url: `${base}/ok` });
    expect(requests).toHaveLength(2);
  });

  it("answers not working for a URL that is not in the list, without a request", async () => {
    const check = createChecker({ timeoutMs: 100 });
    expect(await check({ url: `${base}/ok` })).toEqual({ reachable: false });
    expect(await check({ url: "https://evil.example/x" })).toEqual({ reachable: false });
    expect(await check({ url: 42 })).toEqual({ reachable: false });
    expect(await check(null)).toEqual({ reachable: false });
    expect(requests).toHaveLength(0);
  });

  it("lists only the https URLs of the sample models", async () => {
    const check = createChecker({
      fetchFn: async () => new Response(null, { status: 200 }),
    });
    expect(await check({ url: "https://example.org/sample-models/knob-30" })).toEqual({
      reachable: true,
    });
    expect(await check({ url: "http://example.org/sample-models/knob-30" })).toEqual({
      reachable: false,
    });
  });
});
