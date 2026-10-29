import type { ConsentKind } from "../consent";

export type StorageBasis =
  { kind: "necessary"; for: string } | { kind: "consent"; consent: ConsentKind };

export const STORAGE_REGISTER: Record<string, StorageBasis> = {
  "daiy.v1.profile": { kind: "necessary", for: "the skill profile" },
  "daiy.v1.materials": { kind: "necessary", for: "the inventory" },
  "daiy.v1.tools": { kind: "necessary", for: "the inventory" },
  "daiy.v1.cases": { kind: "necessary", for: "the project history" },
  "daiy.v1.consents": { kind: "necessary", for: "recording consents" },
  "daiy.v1.sync": { kind: "necessary", for: "the sync the user started" },
  "case-photo blobs": { kind: "consent", consent: "keep-case-photos" },
  "cookie daiy_session": { kind: "necessary", for: "the sign-in the user requested" },
};
