# Presentation

[`DAIY_presentation_v6.pptx`](DAIY_presentation_v6.pptx) is the current team deck. The repository is the source of truth; the deck follows it. [`DAIY_pre-presentation_v5.pptx`](DAIY_pre-presentation_v5.pptx) is kept for reference.

v6 (2026-11-06) is the team's deck of 6 Nov, aligned with the repository:

- Concept flow redrawn from the Mermaid diagram in `README.md`; MoSCoW from `docs/Requirements_EN.md` v0.4 with the status of release v2026.1.0.
- Agent M slides: 12 sprints (sprint 12 added), tests and release filled from the test records, `docs/backlog/sprints/daiy/12.md` and `CHANGELOG.md`.
- The scrum-loop slide shows a real case (CO alarm → HAZARD-SAFETY-MEASURES → sprint 2); the performance slide shows the evaluation of 5 Nov.
- Outro: method, conscious decisions (with chapters of *Vibe Coding*), the project in numbers, tool journey, what went wrong, lessons learned, closing.
- Consistent title positions, presenter names on every divider, placeholders and highlights removed. The two lecture-note slides on architecture decisions stay hidden at the end.

The checklist below was written for v4 and is kept for history.

## Slides that no longer match the repository (checked 2026-10-24)

- [ ] **Slide 7 · Personas:** rename "Lena, 28, Berlin" to **Sophie Keller, 28, Nuremberg** and "David, 22" to **Emre Yildiz, 22, Erlangen**. Jonas Weber stays. Andreas: add surname **Roth**. See [`docs/Personas_EN.md`](../docs/Personas_EN.md).
- [ ] **Slide 8 · User story:** "Lena" → Sophie. Acceptance criterion "FR-01 asks skill level and tools first" → "offers to ask skill and tools; skipping is possible" (User Story 6, NFR-03).
- [ ] **Slide 12 · Requirement counts:** v0.1 numbers (34 requirements, 7 FR, 8 NFR, 8 AIR, 5 SAF, 6 SUS). Current v0.4: **49 requirements** — 15 FR, 10 NFR, 10 AIR, 7 SAF, 7 SUS.
- [ ] **Slide 14 · MoSCoW:** v0.1 priorities. Current *Must* also includes FR-10 skill profile, FR-11 material inventory, FR-14 work-package classification and SAF-02/06/07. FR-08 accounts moved from *Won't* to *Should*. See [`docs/Requirements_EN.md`](../docs/Requirements_EN.md) §6.
- [ ] **Slide 16 · Tool journey:** prototype tool = Lovable (prototype), Agent M + Claude Code (implementation).
- [ ] **Slides 19–20 · Architecture:** footer date reads "28. & 29.10.2022".
- [ ] **Slide 23 · Test cases:** TC-01 to TC-06 differ from the persona test cases TC-A1 to TC-D3 in `docs/Personas_EN.md`. Use the same IDs in both places.
