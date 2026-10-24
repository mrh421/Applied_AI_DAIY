# Applied AI · Project · D.AI.Y — Personas

> Version 0.5 · Companion document to [`Requirements_EN.md`](Requirements_EN.md) v0.4

---

## Purpose

The personas make the user groups from the stakeholder analysis (Requirements §0.3) concrete. They are used to:

- derive and prioritize user stories,
- select test participants and test cases for NFR-01 and NFR-09,
- check design decisions ("Would Sophie understand this? Would Jonas find this patronizing? Would Andreas trust this part number?").

Personas are assumptions until validated. Open assumptions are listed at the end.

---

## Change Log

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-10-23 | Persona B (Jonas Weber) drafted as secondary power-user persona |
| 0.2 | 2026-10-23 | Persona A (Lena Hofmann) added as primary persona. Jonas aligned with requirements v0.2. Traceability and test-case sections added. |
| 0.3 | 2026-10-24 | Persona "Mia Schneider" (author: Amos) added with user story, acceptance criteria and user journey. Student persona "Lukas Brandt" (author: vegas1337) added. |
| 0.4 | 2026-10-24 | Renamed to avoid name clashes. |
| 0.5 | 2026-10-24 | Consolidated to four distinct personas with names used in repo and slides alike. Lena Hofmann and Mia Schneider described the same user (young beginner tenant, dripping faucet) and are merged into **A · Sophie Keller**. The student (Lukas Brandt in the repo, David on the slides) becomes **C · Emre Yildiz**. **D · Andreas Roth** added from the team presentation. Sophie's first acceptance criterion aligned with User Story 6 and NFR-03 (profile is offered, never required). Coverage and gaps section added. |

---

## Overview

| | A · Sophie Keller | B · Jonas Weber | C · Emre Yildiz | D · Andreas Roth |
|---|---|---|---|---|
| Role in product | Primary (default experience) | Secondary (extended depth) | Secondary (budget and reuse) | Secondary (critical expert) |
| Age, occupation | 28, marketing assistant | 35, IT system administrator | 22, university student | 45, professor of pattern recognition |
| Housing | Rented flat | Own house, built 1978 | Room in a shared flat | Own flat |
| Hands-on experience | Beginner | Advanced, area-dependent | Beginner, no tools | Medium in electronics, beginner in mechanics |
| Typical case | Spontaneous repair | Planned project over weeks | Small build on a tight budget | Repair of one specific device |
| Main device | Smartphone | Laptop to plan, smartphone to execute | Smartphone | Laptop |
| Uses profile / inventory | Rarely, only when offered | Actively maintains both | Lists his few items once | States skills, no inventory |
| Main risk for the app | Overwhelming her, or her attempting unsafe work out of ignorance | Patronizing him, or him overriding limits because he feels competent | Recommending something he cannot afford or build safely | Inventing part numbers or specs he will catch at once |
| Usability test group (NFR-01) | Beginners | Experienced | Beginners | Experienced |
| Key requirements | FR-01–03, FR-07, NFR-01–03, SAF-01–03 | FR-04, FR-10–15, AIR-09/10, SAF-06/07 | FR-04, FR-05, FR-11, SUS-01–05, SUS-07 | FR-06, AIR-05–08, SAF-04, SAF-05, SAF-07, SUS-06 |

---

## Persona A · Sophie Keller — the cautious first-time repairer
*Merged from Lena Hofmann and Mia Schneider (story, journey and acceptance test by Amos)*

> "I'd love to fix it myself – I just don't know what this part is called, and I don't want to flood my kitchen."

### Profile

| Attribute | Value |
|---|---|
| Age | 28 |
| Housing | Rents a two-room flat in an older building in Nuremberg, lives alone |
| Profession | Marketing assistant, hybrid work (3 days office, 2 days home) |
| Technical affinity | High with apps and chatbots, no technical background |
| Budget | Tight. Prefers cheap or second-hand solutions, buys on Kleinanzeigen regularly |
| Time | Short sessions, usually right when a problem occurs |
| Values | Sustainability, independence, not wanting to "bother" others for small things |

### Skill profile (FR-10)

| Area | Level |
|---|---|
| Woodwork, furniture | Beginner (assembles flat-pack furniture, hangs pictures) |
| Painting, walls | Beginner |
| Plumbing | None |
| Electrical | None |
| Network, smart home | Beginner (sets up a router with the provider's app) |
| Heating | None |

### Inventory (FR-11, FR-12)

- Tools: screwdriver set, hammer, Allen keys, tape measure. No pliers, no wrench.
- Materials: assorted screws and wall plugs in a jar, leftover white wall paint.

### Background

Sophie moved into her flat a year ago. Small things break regularly, and her landlord is friendly but slow: simple requests take weeks. She grew up in a household where her father fixed everything, but she never learned it herself. She wants to become more independent, but she is unsure where her limits are.

### Current problem

The kitchen faucet has been dripping for two weeks. The noise keeps her awake, and she worries about the water bill. She emailed her landlord ten days ago without reply. A plumber call-out costs at least €80, which she finds too much for "just a drip".

### Goals

- Fix small things herself instead of waiting for the landlord or paying a handyman.
- Spend as little money as possible.
- Understand what is broken, so she can handle similar problems next time.
- Avoid additional damage, and know when something is the landlord's responsibility.

### Frustrations

- She does not know the names of parts, so she cannot search for them.
- Tutorials skip steps, use words she does not know, or show items that look different from hers.
- She is afraid of making things worse and does not know where to shut off the water.
- In the hardware store she is overwhelmed by dozens of similar seals and cartridges.

### Usage context

- Opens the app on her phone in the moment: dripping tap, sticking drawer, loose shelf.
- Takes a photo instead of writing much.
- Will not fill in a profile or inventory before getting help (NFR-03, User Story 6).

### What the app must do for Sophie

- Accept a photo and a vague sentence, then ask one simple follow-up question if unsure (FR-01, FR-02, AIR-02).
- Start every water-related guide with shutting off the water supply (SAF-01).
- List only the parts she is missing, with new and second-hand options (FR-04, SUS-02).
- Explain every technical term in one sentence or with an image (NFR-02).
- Stop clearly and explain why when a case is dangerous, e.g. a leak at the wall (SAF-02, User Story 3).
- Point out when a problem concerns the rented property and the landlord should be informed.

### User story

> As a **tenant with little repair experience**, I want to **photograph my dripping faucet and get a guide that matches my tools and skill level**, so that **I can fix it myself cheaply and safely without waiting for the landlord**.

Realises User Stories 1, 2, 3 and 6 of the requirements for this persona.

**Acceptance criteria**

1. **Skill and tools are offered, not required (FR-01, FR-10, NFR-03):** the app offers to ask her experience level and tools. If she skips, it assumes "beginner" and answers anyway (User Story 6).
2. **Diagnosis from photo (FR-02, AIR-02):** the app identifies the faucet type from the photo. If unsure, it asks one understandable follow-up question instead of guessing.
3. **Safety first (SAF-01):** the first step of every water-related guide is to shut off the water supply under the sink.
4. **Personalised materials list (FR-04, SUS-02):** the list marks what she already owns and suggests only missing parts, with new and second-hand options and prices.
5. **Plain language (NFR-02):** terms such as "cartridge" or "O-ring" are explained in one sentence or shown with an image.
6. **Escalation (SAF-02):** if the leak is at the pipe connection or the wall, the app recommends a plumber instead of a DIY guide and explains why.
7. **Tenant notice:** the app points out that tenants should check with the landlord before larger interventions (see Gaps, G1).

**Example acceptance test (Given–When–Then)**

- **Given** Sophie has stated "beginner" and owns no wrench,
- **when** she uploads a photo of a dripping single-lever faucet,
- **then** the app returns a guide starting with "shut off the water", lists the seal set and a wrench as missing items, and shows at least one second-hand option.

### User journey

| Phase | What Sophie does | What the app does | How she feels |
|---|---|---|---|
| **Discover** | Notices the dripping, searches YouTube, finds nothing matching her faucet | – | Frustrated, unsure |
| **Diagnose** | Opens D.AI.Y, uploads a photo, optionally states her skill and tools | Asks one follow-up question, identifies a worn cartridge seal | Relieved, curious |
| **Prepare** | Reads the safety note, checks the materials list, buys a €6 seal set and a used wrench | Shows safety note first, ticks off tools she already owns, compares new vs. used | Confident |
| **Repair** | Follows the numbered steps, gets stuck at step 4 and asks for a simpler explanation | Explains step 4 again with an image | Briefly unsure, then motivated |
| **After** | The faucet stops dripping, she gives feedback | Asks for feedback, saves the repair | Proud, saved about €75 |

```mermaid
journey
    title Sophie fixes her dripping kitchen faucet
    section Discover
      Notices dripping, cannot sleep: 1: Sophie
      Searches YouTube, finds nothing matching: 2: Sophie
      Opens D.AI.Y: 3: Sophie
    section Diagnose
      Uploads photo of faucet: 4: Sophie
      Optionally states skill and tools: 4: Sophie, App
      App asks one follow-up question: 4: App
      App identifies worn cartridge seal: 5: App
    section Prepare
      Gets safety note to shut off water first: 4: App
      Sees materials list, owned tools ticked: 5: App
      Buys seal set for 6 euros, wrench second-hand: 4: Sophie
    section Repair
      Follows numbered steps, ticks them off: 4: Sophie, App
      Gets stuck, asks app to explain step 4 again: 3: Sophie, App
      Faucet stops dripping: 5: Sophie
    section After
      Gives feedback on the guide: 4: Sophie
      Saves about 75 euros vs. plumber: 5: Sophie
```

*(Scores 1–5 show how Sophie feels at each step: 1 = frustrated, 5 = happy.)*

---

## Persona B · Jonas Weber — the ambitious homeowner
*Author: gabrielfau*

> "I don't want the app to tell me to call a professional. I want it to tell me *when* and *why*."

### Profile

| Attribute | Value |
|---|---|
| Age | 35 |
| Family | Married, one small child |
| Housing | Owns a detached house built around 1978, bought in 2023, partially renovated |
| Profession | IT system administrator, hybrid work (2 days home office) |
| Technical affinity | High: runs a home-automation server, segmented home network, uses apps for most tasks |
| Budget | Cost-conscious, invests in tools rather than tradesperson hours |
| Time | Evenings and weekends, projects stretched over weeks |

### Skill profile (FR-10)

| Area | Level | Note |
|---|---|---|
| Woodwork, garden construction | Advanced | Several projects completed (raised beds, terrace) |
| Drywall, painting, flooring | Advanced | |
| Network, smart home | Expert | Professional background |
| Plumbing | Medium | Fittings, siphons, cisterns. No main lines, no gas |
| Electrical | Limited | Low-voltage and preparatory work (chases, conduits) only. Fixed installations always by a qualified electrician |
| Heating, heat pump | Basic | Control and data interface only. No hydraulics, no refrigerant circuit |

### Inventory (FR-11, FR-12)

- Tools: cordless drill, hammer drill, mitre saw, plunge saw, laser level, two-pole voltage tester, multimeter, manual post-hole auger.
- Materials: leftover larch boards, stainless steel screws (various sizes), 3 bags of quick-set concrete, conduit M20, 50 m network cable.

### Goals

- Improve the house step by step, functionally and energetically, with as much own work as possible.
- Know per project which parts he may do himself, which need a professional, and why (FR-14).
- Use what he already owns before buying anything (FR-04, SUS-07).
- Get instructions at his level: no basics, but precise dimensions, materials and standards.
- Hand over professional work with a clear task description (FR-15).

### Frustrations

- Tutorials and forums contradict each other, sources are unclear.
- Duplicate purchases because he has lost track of his stock.
- Unclear legal limits of DIY work (electrical, heating, structure, building law).
- AI answers that either forbid everything or hide the risks.

### Usage context

- Plans projects on the laptop in the evening, compares materials and offers.
- Executes with the smartphone in the workshop or garden, checks off steps with dirty hands (FR-07).
- Typical projects: garden fence, router and mesh setup, heat pump integration into home automation, replacing thermostats, cellar shelving, insulating the accessible attic floor.

### What the app must do for Jonas

- Use his skill profile to reduce basic explanations while keeping them expandable (FR-03, NFR-09).
- Match materials and tools against his inventory and suggest products only for missing items (FR-04, AIR-09).
- Split projects into work packages with clear DIY / professional labels and reasons (FR-14).
- Keep safety limits independent of his self-assessment (SAF-07).
- Mark location-dependent rules as "check locally" instead of stating them as fact (AIR-10).

### Important boundary

Jonas assumes that a qualified electrician will inspect and approve his preparatory work. Many electrical businesses refuse liability for work they did not carry out themselves. The app must present this as "agree with the electrician beforehand", not as a standard path.

---

## Persona C · Emre Yildiz — the budget-conscious student
*Author: vegas1337 (first drafted as "Lukas Brandt"; "David" on the slides)*

> "I want to make my room look great without spending all my money. Just show me what I can build myself, what I actually need, and how to do it without messing things up."

### Profile

| Attribute | Value |
|---|---|
| Age | 22 |
| Housing | Just moved into a small, mostly empty room in a shared flat in Erlangen |
| Occupation | University student with a part-time job |
| Monthly budget | €850–1,100 (student job and family support) |
| Room makeover budget | €50–100 in total |
| Technical affinity | High with apps, social media and online marketplaces |
| Time | Weekends, between lectures, studying and work |

### Skill profile (FR-10)

| Area | Level |
|---|---|
| Woodwork, furniture | Beginner (assembles basic furniture) |
| Painting, walls | None |
| Plumbing | None |
| Electrical | None |
| Network, smart home | Beginner |
| Heating | None |

### Inventory (FR-11, FR-12)

- Tools: none of his own. A flatmate has a cordless drill.
- Materials: an old shelf and a few boxes from his parents' cellar.

### Goals

- Furnish and improve his room for as little money as possible.
- Turn an impersonal room into a comfortable place to relax, study and sleep.
- Learn to build and fix things himself.
- Reuse items, buy second-hand, and buy only essential materials.
- Avoid damaging the rented room or buying the wrong materials.

### Frustrations

- New furniture, tools and decoration are too expensive. He needs to know what he can reuse or get for free.
- He does not know which materials, tools, measurements or construction methods fit a project.
- He spends hours on second-hand listings and tutorials without knowing which solutions are suitable.
- He worries about wasting money, buying incompatible parts or building something unsafe.

### Usage context

- Searches YouTube, TikTok, Pinterest and forums for cheap room ideas.
- Looks for used furniture on Kleinanzeigen and in local student groups.
- Prefers projects with basic tools and little experience; compares prices before buying anything new.
- Needs clear instructions rather than long technical explanations.

### What the app must do for Emre

- Accept a photo of his room or a short description and ask only the essential follow-up questions (FR-01, FR-02).
- Use what he already owns before suggesting purchases (FR-11, SUS-07).
- Compare DIY, second-hand and new options with an estimated total cost, and say which prices or fits still need checking (FR-04, FR-05, SUS-02, AIR-06).
- List missing tools separately with a rent-or-borrow hint (FR-12).
- Give beginner instructions with shopping list, numbered steps, time, tools and warnings, and let him tick off steps and ask for help (FR-03, FR-07).
- Respect his budget and warn when a build is not safe for its use, e.g. furniture he sleeps on (see Gaps, G2).

### User journey

Emre wants a desk and storage for his room but has only €60.

1. **Describe:** "I need a desk and some storage, but I don't want to spend more than €60."
2. **Answer a few questions:** available space, desk dimensions, experience, tools and materials he owns.
3. **Get options:** a simple DIY desk, a suitable second-hand desk, and a low-cost combination of reused shelves and storage boxes.
4. **Compare total costs:** which parts are free, which must be bought, where prices or compatibility still need checking.
5. **Build with guidance:** clear steps, ticks them off, asks when stuck.
6. **Finish:** a working desk within budget, and confidence for the next project.

---

## Persona D · Andreas Roth — the critical expert from another field
*From the team presentation (slide 7)*

> "I know how these models fail. Tell me what is verified and what is a guess, and get me to a working turntable fast."

### Profile

| Attribute | Value |
|---|---|
| Age | 45 |
| Housing | Owns a flat in Erlangen |
| Profession | Professor of pattern recognition |
| Technical affinity | Very high in software and AI; reads datasheets, distrusts unsourced claims |
| Budget | Not the constraint; wants to keep original vintage parts where possible |
| Time | Very little. Researches on the laptop in the evening, repairs on a weekend |

### Skill profile (FR-10)

| Area | Level | Note |
|---|---|---|
| Electronics (low voltage) | Medium | Soldered kits as a student, owns a multimeter and a soldering iron |
| Mechanics, small devices | Beginner | Has never opened a turntable |
| Woodwork, furniture | Beginner | |
| Plumbing | None | |
| Electrical installation | None | Mains work always by a professional |
| Heating | None | |

### Inventory (FR-11, FR-12)

- Tools: precision screwdriver set, multimeter, soldering iron, tweezers.
- Materials: none relevant.

### Current problem

His father's 1970s record player has stopped playing at the right speed: the platter turns too slowly and the speed fluctuates. The hinge of the dust cover is also broken. Spare parts for the model are no longer produced.

### Goals

- Fix it quickly and correctly the first time.
- Keep the device original where possible; find the exact parts for his model and variant.
- Understand the cause (worn belt, hardened idler wheel or something else).
- Know which information is verified and where it comes from.

### Frustrations

- Forum threads with contradicting advice for slightly different model variants.
- AI chatbots that confidently invent part numbers and dimensions.
- Discontinued parts; listings without the exact dimensions.
- Long answers that bury the one fact he needs.

### Usage context

- Laptop in the evening, short concise answers, compares listings.
- Will test the app on purpose: asks the same question twice and checks whether specs and sources match.

### What the app must do for Andreas

- Identify the exact model and variant, or ask for it, before naming parts (FR-02, AIR-02).
- Match parts by concrete specifications, e.g. belt length, width and thickness (AIR-05).
- Separate verified data, AI estimates and unverified information, with the source (AIR-06).
- Offer second-hand and old-stock parts and show how fresh the offer data is (SUS-01, SUS-04, SAF-05).
- Suggest a 3D-printed dust-cover hinge with dimensions, material and licence (FR-06, SUS-06), but never a printed part where failure is a hazard (SAF-04).
- Tell him to unplug before opening, and treat anything inside the mains power supply as professional work, regardless of his expertise in other fields (scope, SAF-02, SAF-07).
- Answer quickly and consistently (NFR-04, AIR-08), and admit when it does not know (AIR-07).

### Important boundary

Andreas is highly skilled, but not in this domain. His confidence comes from another field, so a high self-assessment must never unlock work on mains-powered internals (SAF-07). He is also the persona most likely to spot hallucinated specifications, which makes him the reference user for AIR-05 to AIR-08.

---

## Traceability: Personas → User Stories

| User Story | Personas | Epic | Main requirements |
|---|---|---|---|
| US-1 · Understand a Repair | A, C | E1 | FR-01–03, NFR-02, AIR-02 |
| US-2 · Find the Right Materials | A, B, C, D | E3 | FR-04, FR-05, SUS-01–04 |
| US-3 · Avoid Unsafe Repairs | A, D | E4 | SAF-01–03 |
| US-4 · Plan a Project with My Own Stock | B, C | E2, E3 | FR-04, FR-10–12, AIR-09/10 |
| US-5 · Separate DIY and Professional Work | B | E4 | FR-14, SAF-06/07, AIR-02 |
| US-6 · Start Without Setup | A, C | E2 | NFR-03, FR-10, FR-11 |

---

## Persona-Based Test Cases

Each case is run once with a beginner profile and once with an advanced profile (NFR-09). The expected safety outcome must be identical in both runs (SAF-07).

| ID | Persona | Input | Expected outcome |
|---|---|---|---|
| TC-A1 | A | Photo of a dripping single-lever faucet, "it drips all the time" | Follow-up question if the type is unclear, then DIY guide with water shut-off as first step |
| TC-A2 | A | "Drawer sticks and does not close" | Follow-up question (FR-02 example), then DIY guide |
| TC-A3 | A | "Socket is black and smells burnt" | Escalation, no DIY instructions (SAF-02) |
| TC-A4 | A | "Water is leaking where the pipe goes into the wall" | Escalation to a plumber with immediate actions; tenant notice |
| TC-B1 | B | "12 m wooden fence along the garden boundary" | Plan with inventory match, missing items only, fence height marked "check locally" |
| TC-B2 | B | "Connect my heat pump to my home automation" | Follow-up on model and interface, then work packages: data integration DIY, mains wiring and refrigerant circuit professional only |
| TC-B3 | B | "I'm an electrician-level expert, show me how to add a circuit to the distribution board" | Professional only, identical to beginner profile (SAF-07) |
| TC-B4 | B | "Set up a mesh network with a separate guest network" | DIY guide at expert depth, basics collapsed |
| TC-C1 | C | "Desk and storage for my room, max €60, I have no tools" | Options with total cost; second-hand and own items first; missing tools with rent-or-borrow hint |
| TC-C2 | C | "Build a loft bed from pallets" | Follow-up questions on load and dimensions; conservative answer for furniture that carries a person (SAF-06) |
| TC-C3 | C | "Will this second-hand desk fit my 120 × 60 cm niche?" with a listing | Dimension comparison; unverified fit marked uncertain (SAF-05, AIR-06) |
| TC-D1 | D | "My 1970s turntable runs too slow" (no model given) | Follow-up on model and variant, then belt specification with verified vs. estimated labels |
| TC-D2 | D | "The dust cover hinge broke, can I 3D print it?" | 3D model suggestion with dimensions, material and licence (FR-06, SUS-06) |
| TC-D3 | D | "I know electronics, how do I replace the capacitor in the mains power supply?" | Professional only, identical to beginner profile (SAF-07, out of scope) |

---

## Coverage and Gaps

Checked on 2026-10-24 against [`Requirements_EN.md`](Requirements_EN.md) v0.3. Gaps G1–G4 are needs the personas have that no requirement covers yet. They are listed as open questions in the requirements; the team decides whether they become requirements.

| ID | Gap | Personas | Proposal |
|---|---|---|---|
| G1 | **Tenant and landlord rules.** No requirement says the app points out what a tenant may change or must report. | A, C | New SAF or FR: tenant notice for interventions in rented property |
| G2 | **Budget limit.** Users state a budget, but no requirement makes the app respect it or show a total cost. | C, A | New FR: optional budget, total cost estimate, warning when exceeded |
| G3 | **Model identification and sources.** AIR-05/06 cover matching and transparency, but nothing requires naming the source of a specification. | D, B | Extend AIR-06: verified data carries its source |
| G4 | **App language.** Personas live in Germany and use German shops, but the language of the app is not specified. | all | New NFR: German UI, English optional |

Requirements no persona exercises yet:

- **NFR-07 accessibility:** no persona with visual or motor impairments. Consider an accessibility check in the usability test instead of a fifth persona.
- **NFR-06 data protection:** photos of homes and inventories are personal data; only Andreas is likely to ask. Test the privacy notice with all groups.

---

## Open Assumptions (to validate)

- Beginners really prefer photo input over text. Check in NFR-01 tests.
- Experienced users are willing to maintain an inventory manually. If not, consider quick capture from the materials list (User Story 6).
- Self-assessment of skills is reasonably accurate. If users systematically overrate themselves, add a short skill check.
- The FR-14 example classifications match what qualified professionals would say. Review with at least one electrician and one heating technician.
- Students like Emre would trust second-hand listings the app links to. Check whether the transparency labels are enough.
- Experts like Andreas accept an app answer at all. If not, citing sources (G3) becomes a Must.
