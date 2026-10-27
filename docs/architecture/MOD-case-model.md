---
id: MOD-case-model
title: Case vocabulary and schemas
folder: prototype/src/case-model/
realises:
  - PACKAGE-LABEL
  - STRICTER-LABEL-IF-UNCERTAIN
  - REPAIR-FIRST
  - REUSE-FIRST
  - INSTRUCTION-STRUCTURE
  - WORK-PACKAGES
  - OUTPUT-FORMAT-CHECK
  - REDUNDANT-ENTRY
  - MODEL-BEFORE-PARTS
  - PERSON-FURNITURE-LOAD-QUESTION
  - PERSON-FURNITURE-DIMENSION-QUESTION
  - ESCALATION-REASON
  - UNDERSTANDABLE-ERROR-NOTICE
follows:
  - ARC-002
  - ARC-009
uses:
provides:
  - SKILL_AREAS
  - SkillArea
  - SkillLevel
  - RiskLevel
  - PackageLabel
  - LABEL_STRICTNESS
  - stricterLabel
  - Unit
  - Quantity
  - Money
  - HazardKind
  - Escalation
  - NoticeKind
  - Notice
  - FactTopic
  - FIXED_TOPICS
  - PhotoInput
  - Answer
  - FollowUpQuestion
  - InventorySnapshot
  - CaseRequest
  - PartSpec
  - MaterialNeed
  - ToolNeed
  - Step
  - Guide
  - PackageFlags
  - WorkPackage
  - OptionKind
  - SolutionOption
  - AssessmentDraft
  - UserNotice
  - CaseOutcome
  - ExplainRequest
  - ExplanationDraft
  - ExplainOutcome
  - StepQuestionRequest
  - StepAnswerDraft
  - StepAnswerOutcome
  - schemas
  - rankOptions
---
# MOD-case-model Case vocabulary and schemas

## Responsibility

It belongs to the Case domain (ARC-002). It defines once every case datum that crosses a module boundary, as TypeScript types with zod schemas. It also defines the two ordering rules of the vocabulary: the strictness of labels and the rank of option kinds.

## Parts

- `index.ts`: the interface.
- `vocabulary.ts`: skill areas, levels, risk levels, labels, units, hazard kinds, notice kinds, fixed fact topics.
- `request.ts`: case, explanation and step-question requests.
- `draft.ts`: the AI draft schemas.
- `outcome.ts`: outcomes and escalations.
- `ordering.ts`: `stricterLabel` and `rankOptions`.
- `*.test.ts`: unit tests. `stricterLabel` for all pairs; `rankOptions` keeps repair and reuse ahead of buy-new and keeps the order within a kind; the schemas accept a valid example and reject one missing field per type.

## Data

None stored. The constant lists `SKILL_AREAS`, `LABEL_STRICTNESS` and `FIXED_TOPICS` are data, given under Interfaces.

## Interfaces

- `SKILL_AREAS` — `['plumbing', 'electrical-devices', 'woodwork', 'walls-and-floors', 'furniture', 'garden', 'bikes', 'textiles', 'other'] as const`.
- `SkillArea` — `typeof SKILL_AREAS[number]`.
- `SkillLevel` — `'beginner' | 'some-experience' | 'experienced'`.
- `RiskLevel` — `'low' | 'medium' | 'high' | 'critical'`.
- `PackageLabel` — `'diy' | 'diy-preparation' | 'professional-only' | 'not-recommended'`.
- `LABEL_STRICTNESS: readonly PackageLabel[]` — `['diy', 'diy-preparation', 'professional-only', 'not-recommended']`, least to most restrictive.
- `stricterLabel(a: PackageLabel, b: PackageLabel): PackageLabel` — the more restrictive of the two.
- `Unit` — `'piece' | 'mm' | 'cm' | 'm' | 'm2' | 'ml' | 'l' | 'g' | 'kg'`.
- `Quantity` — `{ amount: number; unit: Unit }`.
- `Money` — `{ amount: number; currency: 'EUR' }`.
- `HazardKind` — `'gas' | 'carbon-monoxide' | 'fire-or-smoke' | 'overheating-electrics' | 'water-near-electrics' | 'water-leak-in-wall' | 'structural-damage' | 'distribution-board' | 'fixed-installation' | 'grid-connection' | 'gas-installation' | 'refrigerant-circuit' | 'load-bearing-structure' | 'chimney' | 'energy-renovation'`.
- `Escalation` — `{ risk: 'high' | 'critical'; reason: string; hazards: HazardKind[]; actions: string[]; professionals: string[]; origin: 'precheck' | 'output' }`.
- `NoticeKind` — `'location-dependent-rule' | 'permit-free' | 'heating-or-flue-change' | 'heating-or-flue-decommission' | 'firing-installation' | 'planting-near-boundary' | 'boundary-installation' | 'rented-property' | 'tenant-modification-right' | 'warranty-or-funding'`.
- `Notice` — `{ kind: NoticeKind; certainty: 'applies' | 'possible'; text: string; marks: ('check-locally' | 'check-with-manufacturer-or-funding-body')[] }`.
- `FactTopic` — `string`, the topic a question asks about, by which answers are filled in again.
- `FIXED_TOPICS` — `{ deviceModel: 'device.model'; deviceVariant: 'device.variant'; furnitureLoad: 'furniture.load'; furnitureDimensions: 'furniture.dimensions' }`.
- `PhotoInput` — `{ mediaType: 'image/jpeg'; dataBase64: string }`.
- `Answer` — `{ questionId: string; topic: FactTopic; text: string; notSure: boolean }`.
- `FollowUpQuestion` — `{ id: string; topic: FactTopic; text: string; termExplanations: { term: string; explanation: string }[]; prefill?: string }`.
- `InventorySnapshot` — `{ materials: { name: string; quantity: Quantity }[]; tools: { name: string }[] }`.
- `CaseRequest` — `{ description: string; photo?: PhotoInput; answers: Answer[]; round: 0 | 1 | 2; inventory: InventorySnapshot }`.
- `PartSpec` — `{ dimensionsMm?: { length?: number; width?: number; height?: number; diameter?: number }; material?: string; function?: string }`.
- `MaterialNeed` — `{ id: string; name: string; quantity: Quantity; spec: PartSpec; replacementPart: boolean; safetyCritical: 'yes' | 'no' | 'unclear'; printable: boolean }`.
- `ToolNeed` — `{ id: string; name: string; rentable: boolean }`.
- `Step` — `{ n: number; text: string; opensDevice: boolean; switchesOffCircuit: boolean; fixedSafetyStep: boolean; imageIds: string[] }`.
- `Guide` — `{ diagnosis: string; tools: ToolNeed[]; materials: MaterialNeed[]; steps: Step[]; estimatedMinutes: { min: number; max: number }; warnings: string[] }`.
- `PackageFlags` — `{ opensMainsHousing: boolean; carriesPerson: boolean; waterRelated: boolean }`.
- `WorkPackage` — `{ id: string; title: string; area: SkillArea; label: PackageLabel; alternativeLabel?: PackageLabel; reason: string; labelUncertain: boolean; decidingInformation: string[]; handoverBrief: string; agreeBeforehand?: string; flags: PackageFlags; guide?: Guide }`.
- `OptionKind` — `'repair' | 'reuse' | 'buy-new'`.
- `SolutionOption` — `{ id: string; kind: OptionKind; title: string; packages: WorkPackage[] }`.
- `AssessmentDraft` — `{ kind: 'questions' | 'answer'; missing: string[]; questions: FollowUpQuestion[]; device: { concernsDevice: boolean; modelKnown: boolean }; outOfScope: HazardKind | null; risk: RiskLevel; riskUncertain: boolean; hazards: HazardKind[]; summary: string; photoDescription: string | null; assumptions: string[]; options: SolutionOption[]; notices: { kind: NoticeKind; certainty: 'applies' | 'possible' }[] }`.
- `UserNotice` — `{ reason: 'insufficient-information' | 'output-rejected' | 'technical-error' | 'offline'; text: string; missing: string[] }`.
- `CaseOutcome` — `{ type: 'questions'; round: 1 | 2; missing: string[]; questions: FollowUpQuestion[] } | { type: 'escalation'; escalation: Escalation } | { type: 'guidance'; summary: string; assumptions: string[]; options: SolutionOption[]; notices: Notice[]; photoAlt: string | null } | { type: 'notice'; notice: UserNotice }`.
- `ExplainRequest` — `{ packageId: string; area: SkillArea; level: SkillLevel; steps: { n: number; text: string }[]; onlyStep: number | null; simpler: boolean }`.
- `ExplanationDraft` — `{ steps: { n: number; basics: string }[] }`.
- `ExplainOutcome` — `{ type: 'explanation'; packageId: string; steps: { n: number; basics: string }[] } | { type: 'notice'; notice: UserNotice }`.
- `StepQuestionRequest` — `{ summary: string; pkg: WorkPackage; currentStep: number; question: string }`.
- `StepAnswerDraft` — `{ answer: string; risk: RiskLevel; hazards: HazardKind[] }`.
- `StepAnswerOutcome` — `{ type: 'answer'; text: string } | { type: 'escalation'; escalation: Escalation } | { type: 'notice'; notice: UserNotice }`.
- `schemas` — `{ caseRequest: ZodType<CaseRequest>; assessmentDraft: ZodType<AssessmentDraft>; explainRequest: ZodType<ExplainRequest>; explanationDraft: ZodType<ExplanationDraft>; stepQuestionRequest: ZodType<StepQuestionRequest>; stepAnswerDraft: ZodType<StepAnswerDraft> }`.
- `rankOptions(options: SolutionOption[]): SolutionOption[]` — repair, then reuse, then buy-new; stable within a kind.

**Errors a caller handles:** none. The functions are total. Callers use the schemas' `safeParse` and handle its failure.

## Files

It reads and writes no file.

## Uses

No DAIY module. It uses the library `zod` only.
