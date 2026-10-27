---
id: MOD-accounts
title: Accounts, credentials and sessions
folder: prototype/src/accounts/
realises:
  - ACCOUNT-SYNC
  - PASSWORDS-HASHED
  - ACCESSIBLE-AUTHENTICATION
  - PRIVATE-BY-DEFAULT
  - DATA-MINIMISATION
  - DATA-RECTIFICATION
  - DELETE-ALL-DATA
  - ERROR-IDENTIFICATION
follows:
  - ARC-007
  - ARC-012
  - ARC-013
uses:
provides:
  - AccountData
  - AccountFieldError
  - signUp
  - signIn
  - signOut
  - currentAccount
  - passkeyRegistrationOptions
  - verifyPasskeyRegistration
  - passkeySignInOptions
  - verifyPasskeySignIn
  - changeUsername
  - changePassword
  - deleteAccount
  - UnauthenticatedError
  - requireAccountId
---
# MOD-accounts Accounts, credentials and sessions

## Responsibility

It belongs to Account, sync and data rights (ARC-007). It creates, authenticates, changes and deletes accounts, and resolves a session to its account.

## Parts

- `index.ts`: the interface.
- `db.ts`: the connection to `data/accounts.sqlite` and the migrations.
- `password.ts`: scrypt hashing (ARC-013).
- `passkey.ts`: `@simplewebauthn/server`.
- `session.ts`: the cookie and the session table.
- `functions.ts`: the server functions.
- `*.test.ts`: unit tests with a temporary database file. No plain-text password is in any column; wrong credentials fail; a session expires; a passkey round trip with the library's test helpers; delete removes sessions; field errors are named.

## Data

Tables:

- `accounts(id, username unique, password_hash, created_at)`;
- `passkeys(id, account_id, public_key, counter, name, created_at)`;
- `sessions(token_hash, account_id, expires_at)`;
- `challenges(id, challenge, purpose, expires_at)`: the WebAuthn challenge between an `…Options` call and its `verify…` call, valid for five minutes and deleted when used. Its id travels in a short-lived HttpOnly cookie, so that the server functions keep no state in memory.

Validation: the user name has 3 to 40 characters and is unique; the password has at least 10 characters. Each error names its field.

## Interfaces

The functions below, except `requireAccountId`, are server functions called remotely from the browser over HTTPS POST. On the client, a network failure rejects their promise.

- `AccountData` — `{ username: string; createdAt: string; passkeys: { name: string; createdAt: string }[] }`.
- `AccountFieldError` — `{ field: 'username' | 'password'; message: string }`.
- `signUp: (i: { username: string; password: string }) => Promise<{ ok: true } | { ok: false; errors: AccountFieldError[] }>` — creates the account and signs it in.
- `signIn: (i: { username: string; password: string }) => Promise<{ ok: true } | { ok: false; reason: 'wrong-credentials' }>` — signs in.
- `signOut: () => Promise<void>` — ends the session.
- `currentAccount: () => Promise<AccountData | null>` — the signed-in account, or `null`.
- `passkeyRegistrationOptions: () => Promise<PublicKeyCredentialCreationOptionsJSON>` — options to add a passkey.
- `verifyPasskeyRegistration: (i: { response: RegistrationResponseJSON; name: string }) => Promise<{ ok: boolean }>` — stores a passkey.
- `passkeySignInOptions: () => Promise<PublicKeyCredentialRequestOptionsJSON>` — options to sign in with a passkey; it takes no user name, because the credentials are discoverable.
- `verifyPasskeySignIn: (i: { response: AuthenticationResponseJSON }) => Promise<{ ok: boolean }>` — signs in with a passkey.
- `changeUsername: (i: { username: string }) => Promise<{ ok: true } | { ok: false; errors: AccountFieldError[] }>` — corrects the user name.
- `changePassword: (i: { current: string; next: string }) => Promise<{ ok: true } | { ok: false; errors: AccountFieldError[] }>` — changes the password.
- `deleteAccount: () => Promise<{ ok: boolean }>` — deletes the account, its passkeys and all its sessions.
- `UnauthenticatedError` — `class UnauthenticatedError extends Error {}`.
- `requireAccountId(request: Request): string` — server side only; the account of the session.

**Errors a caller handles:** functions that need a session throw `UnauthenticatedError` without a valid one, which reaches the client as HTTP 401; `requireAccountId` throws the same.

## Files

`data/accounts.sqlite`, read and written.

## Uses

No DAIY module. It uses the libraries `better-sqlite3` and `@simplewebauthn/server`, and `node:crypto`.
