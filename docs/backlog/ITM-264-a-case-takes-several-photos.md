---
id: ITM-264
title: A case takes several photos
level: module
realises:
  - UC-001
  - OPTIONAL-PHOTO
  - UC-025
modules:
  - MOD-case-model
  - MOD-case-session
  - MOD-ai-tasks
  - MOD-history
  - MOD-consent
  - MOD-case-screens
builds_on:
  - ITM-263
tests:
  - unit
  - component
  - system
origin:
  - mrh (2026-11-02): a photo that was attached to a case was not seen by the AI and not shown on the start page; the user wants to attach several photos and see them in a small window
---
# ITM-264 A case takes several photos

**REGISTER**

## Outcome

On the start page the user attaches up to four photos to a case. Each chosen photo is shown as a small picture in a row under the photo button, with a text alternative that names the file and a button that removes that one photo. The AI receives all photos with the description and takes each of them into account. A user who attaches no photo is never asked for one. With the consent `keep-case-photos` every photo of a case is kept with the case record and is deleted together with it.

## Acceptance

- The file dialog allows choosing several files at once; a fifth photo is refused with a message that names the limit of four, and the first four stay.
- Every chosen photo is shown as a picture of its own with the accessible name "Your photo: <file name>"; every picture has its own "Remove the photo <file name>" button; removing one leaves the others.
- The request to the AI carries every photo, each downscaled to at most 1600 pixels as JPEG (ARC-015); a case without photos still works.
- Without the consent no photo is saved after the case; with it all photos are saved and deleted with the case, and a case saved with one photo before this item still opens.
- The unit, component and system tests pass, including axe, 320 px, 200 percent and keyboard operation of the photo row.

## Priority

Should: planned for sprint 11, after ITM-263 (the start page takes its look from it).
