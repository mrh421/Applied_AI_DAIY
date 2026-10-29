import { registerPurge } from "../consent";
import {
  ConsentMissingError,
  getBlob,
  putBlob,
  removeAllBlobs,
  removeBlobs,
  type BlobKind,
} from "./blobs";
import { subscribe } from "./events";
import {
  StorageFullError,
  applyRemote,
  changedSince,
  get,
  list,
  put,
  remove,
  removeAllRecords,
  type Collection,
  type StoredRecord,
} from "./records";
import { STORAGE_REGISTER, type StorageBasis } from "./register";

registerPurge("keep-case-photos", () => removeBlobs("case-photo"));

async function clearAll(): Promise<void> {
  removeAllRecords();
  for (const key of Object.keys(STORAGE_REGISTER)) {
    if (key.startsWith("daiy.v1.")) localStorage.removeItem(key);
  }
  await removeAllBlobs();
}

export const localStore = {
  list,
  get,
  put,
  remove,
  changedSince,
  applyRemote,
  subscribe,
  putBlob,
  getBlob,
  removeBlobs,
  clearAll,
};

export { ConsentMissingError, STORAGE_REGISTER, StorageFullError };
export type { BlobKind, Collection, StorageBasis, StoredRecord };
