---
id: MOD-link-check
title: Reachability of catalogue links
folder: prototype/src/link-check/
realises:
  - 3D-MODEL-LINK
  - UC-007
follows:
  - ARC-005
uses:
provides:
  - checkLink
---
# MOD-link-check Reachability of catalogue links

## Responsibility

It belongs to Materials and offers (ARC-005). It tells whether a 3D-model link from the catalogue is reachable (UC-007 A4).

## Parts

- `index.ts`: the interface.
- `check.ts`: the server function and an in-memory cache.
- `*.test.ts`: unit tests against a local HTTP stub: 200, 404, timeout, a refused HEAD; a URL not in the list.

## Data

A cache from URL to `{ reachable, checkedAt }` for one hour. It is not persisted.

## Interfaces

- `checkLink: (input: { url: string }) => Promise<{ reachable: boolean }>` — a server function, called remotely from the browser over HTTPS POST.
  - It accepts only `https` URLs that appear in `models.json` of MOD-catalogue, which rules out requests to arbitrary addresses. Any other URL returns `{ reachable: false }`.
  - It sends HEAD, and falls back to GET when HEAD is refused, with a timeout of 5 s.
  - A 2xx or 3xx answer is reachable.

**Errors a caller handles:** none from the server; every failure there gives `reachable: false`. On the client, a network failure rejects the promise, and MOD-catalogue treats it as unreachable.

## Files

It reads the model URLs of `prototype/src/catalogue/data/models.json`, bundled at build time as a data file, not through MOD-catalogue's interface, so no cycle arises.

## Uses

No other module.
