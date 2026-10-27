---
id: MOD-illustrations
title: Illustration catalogue
folder: prototype/src/illustrations/
realises:
  - ILLUSTRATIVE-IMAGES
  - TEXT-ALTERNATIVES
  - UC-003
follows:
  - ARC-002
uses:
provides:
  - Illustration
  - illustrationIndex
  - illustration
---
# MOD-illustrations Illustration catalogue

## Responsibility

It belongs to the Case domain (ARC-002). It names the illustrative images that are available, with their topic and their text alternative, so that UC-003 can include the available images in the instructions and show them without images when none are available (UC-003 A7).

## Parts

- `index.ts`: the interface.
- `catalogue.ts`: the list of entries.
- The images themselves in `prototype/public/illustrations/`.
- `*.test.ts`: unit tests. Every entry has an existing file and a non-empty `alt`; the ids are unique.

## Data

The catalogue of entries of type `Illustration`. Every entry has a non-empty `alt` that serves the same purpose as the image.

## Interfaces

- `Illustration` — `{ id: string; topic: string; src: string; alt: string }`.
- `illustrationIndex(): { id: string; topic: string }[]` — given to the AI so it can reference images.
- `illustration(id: string): Illustration | undefined` — the entry of an id.

**Errors a caller handles:** none. An unknown id returns `undefined`.

## Files

It reads nothing at runtime. The image files in `prototype/public/illustrations/` are static assets served by the server.

## Uses

No other module.
