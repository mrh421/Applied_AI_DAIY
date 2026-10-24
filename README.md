# Applied AI · Project · D.AI.Y

An AI-powered DIY platform that helps people, regardless of their technical skills, safely repair household items and carry out small home projects themselves.

> This README is a summary. The binding source is [`docs/Requirements_EN.md`](docs/Requirements_EN.md) (v0.3). Full personas, traceability and test cases: [`docs/Personas_EN.md`](docs/Personas_EN.md).

## Overview

Applied AI · D.AI.Y supports users through the full repair or project journey:
- describe a problem or project in everyday language
- upload a photo or provide a text description
- receive follow-up questions when important details are missing
- see which work packages are DIY and which need a qualified professional
- get structured, step-by-step instructions adapted to their skill level
- reuse materials and tools they already own before buying anything
- compare suitable new and second-hand alternatives for missing items
- identify unsafe or high-risk cases before any instructions are given

The goal is not just to generate a guide, but to provide safe, understandable, and actionable guidance based on the user's actual situation, skills, and inventory.

---

## Concept Flow

```mermaid
flowchart TD
    P["0. Profile and inventory<br/>Skill level, materials, tools (optional at start)"] --> A
    A["1. Capture the problem or project<br/>Photo or text description"] --> R{"Risk check"}

    R -->|Immediate hazard| X["Safety notice and professional<br/>No DIY instructions"]
    R -->|Unclear or OK| B["2. Create an AI plan<br/>Diagnosis, follow-up questions, work packages"]

    B --> W{"Classify each work package"}
    W -->|Professional only| Y["Handover brief<br/>for a qualified professional"]
    W -->|DIY or DIY with preparation| M["3. Match materials and tools<br/>against inventory"]

    M --> C{"Source missing items"}
    C --> D["Buy new<br/>e.g. OBI"]
    C --> E["Buy second-hand<br/>e.g. Kleinanzeigen"]
    C --> F["3D printing<br/>Non-safety-critical parts"]

    D --> G["4. Compare the options<br/>Compatibility, price and sustainability"]
    E --> G
    F --> G

    G --> H{"Is the solution suitable and safe?"}
    H -->|Yes| I["5. Carry out the work<br/>Step-by-step instructions"]
    H -->|No| J["Gather more information<br/>Find an alternative or recommend a professional"]

    J --> B
    I --> K["Completed<br/>Result, feedback, inventory updated, saved to history"]
```

---

## Why this project matters

Many people face common household repairs or small home projects such as sticking drawers, loose shelves, a garden fence, or a smart-home integration. Often, they do not know:
- what the actual problem is
- which tools or materials are needed, and which they already own
- whether the work is safe and whether they are allowed to do it themselves
- whether a second-hand or replacement part is a better option

This project aims to provide an accessible, guided, and safety-conscious assistant that helps both beginners and experienced DIYers make confident decisions.

---

## Target Users

| Persona | Role in product | Needs |
|---|---|---|
| **A · Sophie Keller**, 28, rents a flat, beginner | Primary (default experience) | Simple language, photo input, clear stop when something is dangerous |
| **B · Jonas Weber**, 35, homeowner, advanced DIYer | Secondary (extended depth) | Inventory, skill-based depth, clear DIY vs. professional split with reasons |
| **C · Emre Yildiz**, 22, student in a shared flat, beginner | Secondary (budget and reuse) | Low total cost, own and second-hand items first, beginner instructions |
| **D · Andreas Roth**, 45, professor, expert in another field | Secondary (critical expert) | Exact parts for a specific device, verified and sourced data, fast answers |

All personas use the same flow. A higher skill level changes detail and language, never the safety limits.

---

## Core Features

### 1. Skill profile and inventory
Users can optionally state their experience per area (e.g. woodwork, plumbing, electrical, network, heating) and record the materials and tools they own. Without a profile, the app assumes "beginner". Profile and inventory never block the start of a case.

### 2. Problem and project input
Users describe a repair issue or a small project in plain language and optionally upload a photo.

### 3. Interactive diagnosis
If the problem is unclear, the AI asks targeted follow-up questions instead of making assumptions.

### 4. Work-package classification
Projects are split into work packages, each labelled **DIY**, **DIY preparation for a professional**, **professional only**, or **not recommended**, with a short reason. Uncertain cases get the stricter label.

### 5. Step-by-step instructions
Easy-to-follow instructions with required tools, materials, estimated time, warnings, and safety notes. Basic steps are collapsed for experienced users but always expandable.

### 6. Materials and product suggestions
The system creates a bill of materials, matches it against the user's inventory, and suggests new and second-hand products only for missing items.

### 7. Sustainability awareness
The app prioritizes repair and reuse and compares options by price, condition, compatibility, and sustainability impact.

### 8. Safety and risk detection
Before providing instructions, the app checks whether the case involves danger, unclear conditions, or work reserved for qualified professionals.

### 9. Guided execution
Users can mark steps as complete, request repeat or simpler explanations, and ask follow-up questions during the work.

---

## Scope

**In scope:** repairs of household items and fixtures, small home and garden projects, low-voltage and digital projects (e.g. router, smart home, heat-pump data interface), and planning support that splits a project into DIY and professional work.

**Out of scope** (the app informs and escalates, but gives no instructions): fixed 230/400 V installations, gas, refrigerant circuits, load-bearing structures, chimneys, full energy-renovation planning, and in-app purchasing.

---

## MVP Prioritization (MoSCoW)

- **Must:** problem and project input, follow-up questions, structured instructions, materials list matched against inventory (sample product data), guided execution, local skill profile, local material inventory, work-package classification, risk detection and escalation
- **Should:** real retailer and second-hand search, user accounts and sync, tool inventory, project history
- **Could:** 3D model library, handover brief for professionals
- **Won't:** in-app purchasing

---

## Non-Functional Requirements

The project aims to deliver a product that is:
- easy to use for non-experts, tested with both persona groups
- understandable in plain language
- low-complexity and fast to start (no more than 3 required input steps)
- adaptive in depth while keeping safety content identical across skill levels
- reliable in results and validation
- protective of user data
- accessible and readable
- maintainable through versioned prompts and test cases

---

## AI Requirements

The AI should not simply provide the most detailed answer possible. It should generate useful, structured, and verifiable support.

The system should:
- summarize the problem clearly
- ask for missing information when needed
- return consistent, structured output
- account for the user's skill level
- only mark items as available if they are in the inventory in sufficient quantity
- mark location-dependent rules (e.g. fence height, permits) as "check locally"
- evaluate products against practical requirements
- clearly separate verified information from AI estimates
- handle errors and uncertainty transparently

---

## Safety Requirements

Because users work on real objects, bad guidance can lead to injuries, property damage, or unsafe construction.

The app should:
- detect risk signals before presenting instructions
- avoid providing improvised advice in hazardous situations
- choose the more restrictive classification when a work package is uncertain
- never unlock restricted work because of a high self-assessed skill level
- validate AI output structure and completeness
- avoid recommending unsafe 3D-printed parts for safety-critical uses
- not claim compatibility or quality without sufficient evidence

---

## Sustainability and Marketplace Support

The project differs from a conventional chatbot by considering sustainable repair and sourcing options.

It should:
- propose matching items from the user's own inventory before any purchase
- promote second-hand alternatives where suitable
- compare new and used options transparently
- explain sustainability reasoning without unsupported claims
- show product availability and data freshness clearly
- link users to retailers or sellers for purchase

---

## Project Status

Requirements v0.3, personas v0.5 and a clickable prototype exist. **Next step: sprint planning with Agent M** (sprint 0 in the implementation plan): register the requirements as a source, derive use cases and architecture, write the AI test cases, decide open questions G1–G4.

Plan, sprints and testing (implementation from Wed 28.10, MVP demo 04.11, remaining features after that): [`docs/Implementation_Plan_EN.md`](docs/Implementation_Plan_EN.md).

---

## Repository Structure

| Path | Content |
|---|---|
| [`docs/Requirements_EN.md`](docs/Requirements_EN.md) | **Binding.** Requirements v0.3: scope, stakeholders, FR/NFR/AIR/SAF/SUS, MoSCoW, epics, user stories, open questions |
| [`docs/Personas_EN.md`](docs/Personas_EN.md) | Personas A–D: profiles, user journeys, traceability, persona test cases, coverage gaps |
| [`docs/Implementation_Plan_EN.md`](docs/Implementation_Plan_EN.md) | Process (Agent M), schedule (phase 1 MVP, phase 2 remaining features), use-case coverage, testing, Definition of Done, prototype gap list |
| [`prototype/`](prototype/) | Clickable prototype (TanStack Start, React); the codebase the MVP is built on. How to run: [`prototype/README.md`](prototype/README.md) |
| [`presentation/`](presentation/) | Team slide deck and the list of slides to update |

**Rules:** requirements change only in `docs/Requirements_EN.md`, with a change-log row and its own commit. Everything else refers to requirement IDs instead of repeating them.

---

## License

This project does not yet specify a license. Add a license file and update this section once the project direction is finalized.

---

## Contributing

Start with `docs/Requirements_EN.md` and `docs/Personas_EN.md`. Code changes go through the sprint process in `docs/Implementation_Plan_EN.md`.
