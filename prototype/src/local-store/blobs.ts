import { clear, del, get, keys, set } from "idb-keyval";

import { hasConsent, type ConsentKind } from "../consent";

export type BlobKind = "case-photo";

export class ConsentMissingError extends Error {
  readonly consent: ConsentKind;

  constructor(consent: ConsentKind) {
    super(`The consent "${consent}" is missing`);
    this.consent = consent;
  }
}

const BLOB_CONSENT: Record<BlobKind, ConsentKind> = { "case-photo": "keep-case-photos" };

const keyOf = (kind: BlobKind, id: string): string => `${kind}:${id}`;

export async function putBlob(kind: BlobKind, id: string, blob: Blob): Promise<void> {
  const consent = BLOB_CONSENT[kind];
  if (!hasConsent(consent)) throw new ConsentMissingError(consent);
  await set(keyOf(kind, id), blob);
}

export function getBlob(kind: BlobKind, id: string): Promise<Blob | undefined> {
  return get<Blob>(keyOf(kind, id));
}

export async function removeBlobs(kind: BlobKind): Promise<void> {
  const prefix = `${kind}:`;
  const all = await keys();
  await Promise.all(all.filter((k) => String(k).startsWith(prefix)).map((k) => del(k)));
}

export function removeAllBlobs(): Promise<void> {
  return clear();
}
