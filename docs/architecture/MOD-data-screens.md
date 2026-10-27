---
id: MOD-data-screens
title: Screens of personal data, privacy and account
folder: prototype/src/data-screens/
realises:
  - SKILL-PROFILE
  - MATERIAL-INVENTORY
  - TOOL-INVENTORY
  - PROJECT-HISTORY
  - PRIVACY-NOTICE
  - DATA-MINIMISATION
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - DATA-RECTIFICATION
  - DATA-EXPORT
  - DELETE-ALL-DATA
  - ACCOUNT-SYNC
  - PASSWORDS-HASHED
  - ACCESSIBLE-AUTHENTICATION
  - USE-WITHOUT-ACCOUNT
  - CLEAR-LABELS
  - ERROR-IDENTIFICATION
  - STATUS-MESSAGES
follows:
  - ARC-008
  - ARC-007
  - ARC-013
uses:
  - MOD-ui-kit.Button
  - MOD-ui-kit.TextField
  - MOD-ui-kit.Select
  - MOD-ui-kit.Checkbox
  - MOD-ui-kit.Dialog
  - MOD-ui-kit.Page
  - MOD-ui-kit.announce
  - MOD-profile.useProfile
  - MOD-profile.setLevel
  - MOD-profile.clearLevel
  - MOD-inventory.useInventory
  - MOD-inventory.saveMaterial
  - MOD-inventory.removeMaterial
  - MOD-inventory.saveTool
  - MOD-inventory.removeTool
  - MOD-history.useHistory
  - MOD-history.saveCase
  - MOD-consent.useConsents
  - MOD-consent.giveConsent
  - MOD-consent.withdrawConsent
  - MOD-consent.CONSENT_PURPOSES
  - MOD-data-portability.exportAll
  - MOD-data-portability.eraseAll
  - MOD-sync-client.useSyncState
  - MOD-sync-client.syncNow
  - MOD-accounts.signUp
  - MOD-accounts.signIn
  - MOD-accounts.signOut
  - MOD-accounts.currentAccount
  - MOD-accounts.passkeyRegistrationOptions
  - MOD-accounts.verifyPasskeyRegistration
  - MOD-accounts.passkeySignInOptions
  - MOD-accounts.verifyPasskeySignIn
  - MOD-accounts.changeUsername
  - MOD-accounts.changePassword
  - MOD-case-model.SKILL_AREAS
provides:
  - ProfileScreen
  - InventoryScreen
  - HistoryScreen
  - PrivacyScreen
  - AccountScreen
  - PrivacyNotice
---
# MOD-data-screens Screens of personal data, privacy and account

## Responsibility

It belongs to the User interface (ARC-008). It presents the user's own data and rights: profile, inventory, history, consents, privacy notice, export, erasure and account.

## Parts

- `index.ts`: the interface.
- `ProfileScreen`: the areas with a simple level scale, the stored level shown, and areas left open shown as beginner.
- `InventoryScreen`: add, change and remove materials and tools, with errors that name the field.
- `HistoryScreen`: ongoing and completed cases, each opened with its steps, materials used and editable notes, and an empty state. The notes are the only part of a record that the user edits (UC-021); a wrong entry under materials used is corrected in the inventory, not in the record.
- `PrivacyScreen`: the full `PrivacyNotice`; consents with a one-action toggle each, giving and withdrawing alike; export as a download; delete all data with a warning, an export offer and confirmation, followed by the report.
- `AccountScreen`: the `PrivacyNotice` before the sign-up form; sign up and sign in with paste-enabled password fields; passkey add and sign-in through `@simplewebauthn/browser`; change user name or password, and sign out; the sync state.
- `PrivacyNotice`: the text with six items (PRIVACY-NOTICE): the controller's identity and contact; the purposes and legal bases (case answers, account and sync); the recipients (hosting provider and AI provider, with the transfer to a third country, ARC-010); the storage periods, including the 30 days of backups (ARC-012); the user's rights; and the right to complain to a supervisory authority. Variant `full` gives each item as a paragraph. Variant `short` gives each item as one line and links to the full text, so that no item is missing where data is first collected (UC-019). The notice is always shown beside the case input and before the account form, so a changed notice is seen again on the next visit; the app stores no notice version (UC-019 A1, A4).
- `*.test.tsx`: Testing Library tests. The notice contains every required item; the account form appears only after the notice; withdrawing a consent takes as many actions as giving it; a correction is stored; the export is offered; erasure shows the report.

## Data

The privacy notice text, owned here.

## Interfaces

- `ProfileScreen(): JSX.Element` — the route `/profile`.
- `InventoryScreen(): JSX.Element` — the route `/inventory`.
- `HistoryScreen(): JSX.Element` — the route `/history`.
- `PrivacyScreen(): JSX.Element` — the route `/privacy`.
- `AccountScreen(): JSX.Element` — the route `/account`.
- `PrivacyNotice(p: { variant: 'short' | 'full' }): JSX.Element` — the privacy notice, short beside the case input and full before collection.

**Errors a caller handles:** none. Field errors, a failed sign-in, a failed export and a failed erasure are shown as text and announced.

## Files

It reads and writes no file directly; the export download is produced by MOD-data-portability.

## Uses

- `MOD-ui-kit.Button`, `MOD-ui-kit.TextField`, `MOD-ui-kit.Select`, `MOD-ui-kit.Checkbox`, `MOD-ui-kit.Dialog`, `MOD-ui-kit.Page` and `MOD-ui-kit.announce` — every element of the screens.
- `MOD-profile.useProfile`, `MOD-profile.setLevel` and `MOD-profile.clearLevel` — the profile.
- `MOD-inventory.useInventory`, `MOD-inventory.saveMaterial`, `MOD-inventory.removeMaterial`, `MOD-inventory.saveTool` and `MOD-inventory.removeTool` — the inventory.
- `MOD-history.useHistory` and `MOD-history.saveCase` — the history and its notes.
- `MOD-consent.useConsents`, `MOD-consent.giveConsent`, `MOD-consent.withdrawConsent` and `MOD-consent.CONSENT_PURPOSES` — the consents.
- `MOD-data-portability.exportAll` and `MOD-data-portability.eraseAll` — export and erasure.
- `MOD-sync-client.useSyncState` and `MOD-sync-client.syncNow` — the sync state.
- `MOD-accounts.signUp`, `MOD-accounts.signIn`, `MOD-accounts.signOut`, `MOD-accounts.currentAccount`, `MOD-accounts.passkeyRegistrationOptions`, `MOD-accounts.verifyPasskeyRegistration`, `MOD-accounts.passkeySignInOptions`, `MOD-accounts.verifyPasskeySignIn`, `MOD-accounts.changeUsername` and `MOD-accounts.changePassword` — the account.
- `MOD-case-model.SKILL_AREAS` — the areas of the profile.
