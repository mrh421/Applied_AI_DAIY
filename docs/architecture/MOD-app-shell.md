---
id: MOD-app-shell
title: Routes and navigation
folder: prototype/src/app-shell/
realises:
  - GO-BACK
  - KEYBOARD-OPERABLE
  - ACCOUNT-SYNC
  - USE-WITHOUT-ACCOUNT
follows:
  - ARC-008
  - ARC-009
uses:
  - MOD-case-screens.CaseInputScreen
  - MOD-case-screens.QuestionsScreen
  - MOD-case-screens.OutcomeScreen
  - MOD-case-screens.ExecutionScreen
  - MOD-materials-screens.MaterialsScreen
  - MOD-materials-screens.OffersScreen
  - MOD-data-screens.ProfileScreen
  - MOD-data-screens.InventoryScreen
  - MOD-data-screens.HistoryScreen
  - MOD-data-screens.PrivacyScreen
  - MOD-data-screens.AccountScreen
  - MOD-ui-kit.Page
  - MOD-ui-kit.LinkButton
  - MOD-sync-client.startSync
provides:
  - router
---
# MOD-app-shell Routes and navigation

## Responsibility

It belongs to the User interface (ARC-008). It defines the routes and the layout of the app, provides the back action on every screen, and starts background sync. No route asks for a sign-in (USE-WITHOUT-ACCOUNT).

## Parts

- `index.ts`: the interface.
- `routes/`: TanStack Router file routes. The plugin's `routesDirectory` points here (ARC-009). Each route renders a screen of MOD-case-screens, MOD-materials-screens or MOD-data-screens.
- `layout.tsx`: the header with navigation and back.
- `start.tsx`: calls `startSync` once.
- `*.test.tsx`: Testing Library tests. Every route renders a back action; going back from the questions screen restores the description and the photo of the open case (route `/?case=<id>`).

## Data

None. The screen state lives in the URL and in MOD-case-session, so going back keeps earlier input. The routes:

- `/`, with the optional search parameter `case=<id>`: the case input of an open case, so that the description and the photo are restored when the user goes back from `/case/$id`
- `/case/$id`
- `/case/$id/work/$packageId`
- `/case/$id/materials`
- `/case/$id/offers/$itemId`
- `/profile`
- `/inventory`
- `/history`
- `/privacy`
- `/account`

## Interfaces

- `router` — the TanStack Router instance for the TanStack Start entry. No DAIY module imports it. Its back action from `/case/$id` goes to `/?case=<id>`; elsewhere it calls `router.history.back()`, and falls back to the parent route when there is no history entry.

**Errors a caller handles:** none. An unknown route or case id shows a not-found page with a link to the start, worded in plain language.

## Files

It reads and writes no file.

## Uses

- `MOD-case-screens.CaseInputScreen`, `MOD-case-screens.QuestionsScreen`, `MOD-case-screens.OutcomeScreen` and `MOD-case-screens.ExecutionScreen` — the case routes.
- `MOD-materials-screens.MaterialsScreen` and `MOD-materials-screens.OffersScreen` — the materials routes.
- `MOD-data-screens.ProfileScreen`, `MOD-data-screens.InventoryScreen`, `MOD-data-screens.HistoryScreen`, `MOD-data-screens.PrivacyScreen` and `MOD-data-screens.AccountScreen` — the data routes.
- `MOD-ui-kit.Page` and `MOD-ui-kit.LinkButton` — the layout, the back action and the not-found page.
- `MOD-sync-client.startSync` — the start of background sync.
