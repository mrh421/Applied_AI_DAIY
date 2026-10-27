---
id: MOD-ui-kit
title: Accessible building blocks
folder: prototype/src/ui-kit/
realises:
  - ADEQUATE-CONTRAST
  - LARGE-TEXT-CONTRAST
  - NON-TEXT-CONTRAST
  - NOT-COLOR-ALONE
  - READABLE-TEXT
  - REFLOW
  - REFLOW-NO-TWO-DIMENSIONAL-SCROLLING
  - TEXT-ALTERNATIVES
  - KEYBOARD-OPERABLE
  - FOCUS-VISIBLE
  - TARGET-SIZE
  - CLEAR-LABELS
  - ERROR-IDENTIFICATION
  - STATUS-MESSAGES
  - BASICS-EXPANDABLE
  - GO-BACK
  - ACCESSIBLE-AUTHENTICATION
follows:
  - ARC-008
  - ARC-009
uses:
provides:
  - IconName
  - Button
  - IconButton
  - LinkButton
  - TextField
  - Select
  - Checkbox
  - Collapsible
  - StatusBadge
  - Img
  - Dialog
  - Page
  - announce
---
# MOD-ui-kit Accessible building blocks

## Responsibility

It belongs to the User interface (ARC-008). It provides the components and design tokens from which every screen is built, so that the accessibility requirements hold by construction.

## Parts

- `index.ts`: the interface.
- `tokens.css`: Tailwind theme with text colours at 4.5:1 or more against their backgrounds, and 3:1 for large text; borders and state indicators at 3:1 against adjacent colours; a focus ring of 2 px with 3:1 contrast; sizes in rem, so text scales to 200 percent.
- `components/`: the shadcn components that are used, wrapped.
- `announcer.tsx`: one polite live region.
- `*.test.tsx`: Testing Library tests of names and labels, the link between an error and its field, `announce` writing to the live region without moving focus, and a collapsible operable by keyboard; a token test computes the contrast ratios of all token pairs.

## Data

None.

## Interfaces

- `IconName` — the names of the lucide icons the app uses.
- `Button(p: { label: string; icon?: IconName; variant?: 'primary' | 'secondary' | 'danger'; onPress: () => void; disabled?: boolean }): JSX.Element` — a target of at least 24 by 24 CSS pixels.
- `IconButton(p: { label: string; icon: IconName; onPress: () => void }): JSX.Element` — the label is required and is the accessible name.
- `LinkButton(p: { label: string; href: string; external?: boolean }): JSX.Element` — an external link opens in a new tab with `rel=noopener` and says so in text.
- `TextField(p: { label: string; value: string; onChange: (v: string) => void; error?: string; multiline?: boolean; autoComplete?: string; type?: 'text' | 'password' | 'number' }): JSX.Element` — the error is linked by `aria-describedby` and `aria-invalid`; paste is allowed.
- `Select<T extends string>(p: { label: string; value: T | null; options: { value: T; label: string }[]; onChange: (v: T) => void; error?: string }): JSX.Element` — a labelled choice.
- `Checkbox(p: { label: string; checked: boolean; onChange: (v: boolean) => void }): JSX.Element` — a labelled check box.
- `Collapsible(p: { summary: string; defaultOpen: boolean; children: ReactNode }): JSX.Element` — operable by keyboard.
- `StatusBadge(p: { tone: 'ok' | 'warning' | 'danger' | 'info'; icon: IconName; text: string }): JSX.Element` — text always present, never colour alone.
- `Img(p: { src: string; alt: string } | { src: string; decorative: true }): JSX.Element` — an image with a text alternative, or marked decorative.
- `Dialog(p: { title: string; open: boolean; onClose: () => void; children: ReactNode }): JSX.Element` — a titled dialog.
- `Page(p: { title: string; back?: { label: string; onBack: () => void }; children: ReactNode }): JSX.Element` — single column, no horizontal scroll at 320 CSS pixels, with the back action.
- `announce(message: string): void` — a status message without a change of focus.

**Errors a caller handles:** none.

## Files

It reads and writes no file.

## Uses

No DAIY module. It uses React, Radix through shadcn/ui, Tailwind, sonner and lucide-react.
