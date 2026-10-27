---
id: ARC-017
title: Hosting as one Node.js server in the EU
refines: ARC-001
forced_by:
  - PRIVACY-NOTICE
  - DATA-MINIMISATION
  - ACCOUNT-SYNC
  - RESPONSE-TIME
  - USE-WITHOUT-ACCOUNT
  - UC-017
  - UC-018
  - UC-019
---
# ARC-017 Hosting as one Node.js server in the EU

## Context

The server part of ARC-001 includes:

- the server functions for the case pipeline, the link check, the accounts and sync;
- two SQLite files on a persistent volume (ARC-012);
- secrets as environment variables;
- delivery of the app's static files.

The server processes personal data: case descriptions, photos in transit, and account data. Users and the controller are in Germany (SRC-daiy-legal), and the privacy notice must name recipients and storage periods (PRIVACY-NOTICE).

## Decision

- **Build:** with Nitro's `node-server` preset into one Node.js 22 process.
- **Host:** a container or virtual machine host in the EU with:
  - a persistent volume for `data/`;
  - HTTPS termination;
  - secret management through environment variables (`AI_PROVIDER_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS`, `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`);
  - backups of the volume (ARC-012).
- **One instance.**
- **Logs:** they contain request ids, outcome types, prompt version and errors, but no case text, photo or credential. They are kept for 14 days.

**Principles:** KISS; YAGNI; client-server with a fat client, so the device keeps working on its own.

## Alternatives

| Alternative | Why not |
|---|---|
| Serverless or edge functions, such as Vercel or Cloudflare | No persistent SQLite. Accounts would need a hosted database, a further recipient. Cold starts work against RESPONSE-TIME. |
| Lovable hosting | The platform is frozen for this product (prototype README). |
| Several instances behind a load balancer | No load requirement needs it. SQLite would need replacing (YAGNI). |

## Consequences

- The host and the AI provider are the recipients that the privacy notice names, with the storage periods of logs and backups.
- The single instance is a single point of failure. Without it, the device functions keep working (UC-017), and AI answers and sync wait.
