---
id: ARC-012
title: Server storage with SQLite
refines: ARC-001
forced_by:
  - ACCOUNT-SYNC
  - PASSWORDS-HASHED
  - DELETE-ALL-DATA
  - PRIVACY-NOTICE
  - UC-018
  - UC-023
---
# ARC-012 Server storage with SQLite

## Context

The server must store accounts, credentials and sessions (UC-018), and the synced records of each account (ACCOUNT-SYNC). The volume is small: a few tables, and per user records of kilobytes. The server is one Node.js process (ARC-017). Deleting an account must remove its data completely (DELETE-ALL-DATA), and the privacy notice must state how long backups are kept (PRIVACY-NOTICE).

## Decision

- **Library:** SQLite through `better-sqlite3` (npm), with synchronous calls inside server functions.
- **One file per owning module:** `data/accounts.sqlite` for MOD-accounts and `data/sync.sqlite` for MOD-sync-store. Each module opens its own connection and owns its schema and migrations. Migrations are numbered SQL statements, run at start-up.
- **Location:** the directory `data/` lies on the host's persistent volume and is excluded from git.
- **Journal mode:** WAL. A nightly copy of both files, made with the SQLite backup API, goes to the host's backup storage. Backups expire after 30 days, which the privacy notice states as the storage period of backups.

**Principles:** KISS; YAGNI; one owner per data format.

## Alternatives

| Alternative | Ecosystem | Why not |
|---|---|---|
| `node:sqlite` | Node.js standard library | No native dependency, but still marked experimental in Node 22. A candidate once it is stable. |
| PostgreSQL with `pg` or Drizzle | npm | A second server process to run and secure, for two small tables (KISS). |
| Supabase or Firebase | hosted | A further recipient of personal data, and vendor lock-in for accounts and sync. |
| One shared SQLite file | — | A shared connection would leak between modules, and ownership of tables would blur. |

## Consequences

- A backup keeps the data of a deleted account for up to 30 days. The privacy notice already states these 30 days as the storage period of backups. To keep a restore from bringing a deleted account back, the server keeps a deletion log of account ids (no personal data) outside the backups and replays it after every restore (UC-023).
- One server process can write. Scaling beyond one instance would require a change of this decision, but no requirement asks for it.
- Erasure of an account is two calls, one per module and file, which MOD-data-portability orders and reports (UC-023 A4).
- `better-sqlite3` is a native module, and the host build must compile it for its Node version.
