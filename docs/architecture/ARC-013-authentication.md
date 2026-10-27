---
id: ARC-013
title: Authentication with password and passkey
refines: ARC-001
forced_by:
  - PASSWORDS-HASHED
  - ACCESSIBLE-AUTHENTICATION
  - DATA-MINIMISATION
  - PRIVATE-BY-DEFAULT
  - DELETE-ALL-DATA
  - UC-018
  - UC-019
  - UC-023
---
# ARC-013 Authentication with password and passkey

## Context

Accounts must meet these requirements and use cases:

- passwords are stored hashed (PASSWORDS-HASHED);
- signing in needs no cognitive function test unless an alternative method or an assisting mechanism exists (ACCESSIBLE-AUTHENTICATION), and UC-018 A1 offers a sign-in method that needs no remembering, in addition to the password;
- only the fields a function needs are collected (DATA-MINIMISATION, UC-019);
- no account's data is reachable by another (PRIVATE-BY-DEFAULT);
- a failed sign-in is said and can be retried (UC-018 A2);
- deleting the account signs the user out on every device (UC-023 A1).

## Decision

- **Identifier:** a user name chosen by the user. No e-mail address is collected, because no function needs one.
- **Password:**
  - hashed with scrypt from `node:crypto` (Node.js standard library), with a random 16-byte salt;
  - parameters N=2^15, r=8, p=3, which need 32 MiB per hash and meet the OWASP minimum for scrypt; they are stored with the hash so they can be raised later (a higher N needs a larger `maxmem` option, because `node:crypto` limits scrypt to 32 MiB by default);
  - the server runs at most two hashes at a time and queues the rest, so that parallel sign-in requests cannot exhaust its memory;
  - compared with `timingSafeEqual`.
- **Password field:** `type=password` with `autocomplete=current-password` or `new-password`. Pasting is allowed, so password managers work.
- **Passkey:** WebAuthn through `@simplewebauthn/server` and `@simplewebauthn/browser` (npm). Sign-in uses discoverable credentials with user verification preferred, so the user need not type a user name. The challenge of each ceremony is kept on the server for five minutes (MOD-accounts, table `challenges`). A signed-in user can add a passkey and later sign in with it alone. That is the sign-in method without a cognitive test of UC-018 A1.
- **Session:** a random 32-byte token in an HttpOnly, Secure, SameSite=Lax cookie `daiy_session`. Only the SHA-256 hash of the token is stored, and sessions expire after 30 days. Deleting an account deletes all its sessions, which signs out every device.

**Principles:** KISS, built-in crypto; YAGNI, no recovery and no OAuth; least privilege for the session cookie.

## Alternatives

| Alternative | Ecosystem | Why not |
|---|---|---|
| Argon2id through `@node-rs/argon2` | npm, native | Preferred by OWASP over scrypt, but a further native dependency (ch. 11, supply chain). scrypt is an accepted OWASP choice and built in. |
| bcrypt through `bcrypt` | npm, native | Weaker than scrypt at equal cost, and has a 72-byte input limit. |
| E-mail magic link | — | Needs an e-mail address, which is more personal data, and a mail provider, which is a further recipient. |
| Sign-in with Google or Apple through OAuth | — | Third-party recipients, and the account would depend on another account. |
| A hosted auth service, such as Auth0 or Clerk | — | A further recipient, and lock-in for two tables. |

## Consequences

- Without an e-mail address there is no password reset. A user who forgets the password and has no passkey keeps the device data and can create a new account. UC-018 does not ask for recovery (YAGNI).
- There is no sign-in rate limit. No requirement forces one. If abuse appears, it needs a requirement first. The limit of two simultaneous hashes protects the server's memory, not the account.
- The numbers of this decision (hash parameters, 30-day session, five-minute challenge, ten-character minimum) are chosen values; no requirement fixes them.
