---
id: ITM-268
title: The user can dictate the description
level: module
realises:
  - UC-001
  - UC-019
  - UC-020
  - FREE-TEXT-INPUT
modules:
  - MOD-case-screens
  - MOD-consent
  - MOD-ui-kit
tests:
  - unit
  - component
  - system
origin:
  - mrh (2026-11-02): speech input for the description; the browser's own speech recognition is enough for the demo because dictating is optional
---
# ITM-268 The user can dictate the description

**REGISTER**

## Outcome

Next to the description field on the start page the user can press "Dictate your description" and speak. The recognised words appear in the field while the user speaks and can be corrected by typing. The recognition is the one of the browser (Web Speech API). Some browsers send the audio to the provider of the browser for the recognition, so the first press asks for a consent that says so; without the consent nothing is recorded and the user types as before. Dictating is never required: the field, the example chips and the rest of the start page work without it, and a browser without speech recognition does not show the button.

## Acceptance

- The button "Dictate your description" is shown only where the browser offers speech recognition. While it listens it is named "Stop dictating", and a status line "Listening…" is announced and shown; it stops on a second press, on silence and on leaving the page.
- The first press shows the consent text: the audio may be sent to the provider of the browser to be recognised, DAIY does not receive or store it. Only after "I agree" does the microphone open. The consent is kept like the other consents (`MOD-consent`), can be withdrawn there (UC-020), and a refusal changes nothing else.
- The recognised text is added to the description at the end, never replacing what the user typed; a language switch offers German and English and keeps the choice on the device.
- A refused microphone, no speech heard or a recognition error shows a short text that says what to do (type instead); the page keeps working.
- The privacy notice of the start page names the dictation (UC-019).
- The unit and component tests use a replaced recognition; the system test checks that the button is operable by keyboard and that, without recognition in the browser, the page is unchanged; axe, 320 px, 200 percent and keyboard operation stay green.

## Priority

Could: planned for sprint 11, after ITM-266 and ITM-267 (the start page changes in both).
