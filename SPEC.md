# mrh421/Applied_AI_DAIY — Specification

**VERBINDLICH (SPEC)**

This is the single binding document of mrh421/Applied_AI_DAIY. A sentence belongs here when its violation would be a defect;
everything else — how something is built, what was measured, what is planned — belongs elsewhere and does not bind.

No section of this file is written by hand. Each change is proposed as an entry of a change queue in
`docs/spec-freigaben/`, shown beside the text it would replace, and written here only after a person has accepted it
by an approval record in `docs/approvals/`.

**Form of a requirement:** a **name** in bold capitals, which is its identifier and never changes, followed by its
**source** in italics in parentheses; on the next line its **rule**, one statement that can be shown to hold or not to
hold; then a line beginning with `*Check:*` that names the test guarding the rule, or says that it is checked only at
review. A rule that states two things is two requirements.

## Requirements

**FREE-TEXT-INPUT** *(SRC-daiy-project, FR-01)*
The user describes a repair problem or a small project in plain-language free text.
*Check:* no automatic check; at review. A reviewer submits a free-text description of a problem and verifies that the app accepts it and starts a case.

**OPTIONAL-PHOTO** *(SRC-daiy-project, FR-01)*
The user can attach a photo to a case without having to.
*Check:* no automatic check; at review. A reviewer starts one case with a photo and one without, and verifies that both are accepted.

**INPUT-USES-PROFILE** *(SRC-daiy-project, FR-01)*
If a skill profile exists, the app interprets the case input in the context of that profile.
*Check:* no automatic check; at review. A reviewer submits the same input with different skill profiles and verifies that the interpretation reflects the stored profile.

**INPUT-USES-INVENTORY** *(SRC-daiy-project, FR-01)*
If an inventory exists, the app interprets the case input in the context of that inventory.
*Check:* no automatic check; at review. A reviewer submits the same input with and without inventory entries and verifies that the answer reflects the stored inventory.

**FOLLOW-UP-QUESTIONS** *(SRC-daiy-project, FR-02; SRC-daiy-prototype, Ask follow-ups at most twice; after that, give a guide with clearly listed assumptions if safe.)*
The AI asks targeted follow-up questions when it lacks information it needs to find a suitable solution. Keep both sources. Optionally add the two-round limit as a new requirement of its own.
*Check:* no automatic check; at review. A reviewer answers every follow-up question with "not sure" and verifies that no third round of follow-up questions appears.

**NO-ASSUMPTIONS-AS-FACTS** *(SRC-daiy-project, AIR-02)*
The AI does not present assumptions as facts when important information is missing.
*Check:* no automatic check; at review. A reviewer reads the answers to incomplete cases and verifies that no assumed detail is stated as an established fact.

**MODEL-BEFORE-PARTS** *(SRC-daiy-project, Persona D)*
The app identifies the exact model and variant of a device, or asks for them, before it names parts.
*Check:* no automatic check; at review. A reviewer submits a device repair without a model and verifies that the app asks for model and variant before naming any part.

**PROBLEM-SUMMARY** *(SRC-daiy-project, AIR-01)*
The AI summarizes the problem in a way the user can follow.
*Check:* no automatic check; at review. A reviewer verifies that every answered case contains a problem summary, and a usability review confirms that test participants can follow it.

**INSTRUCTION-STRUCTURE** *(SRC-daiy-project, FR-03)*
Every standard set of instructions contains diagnosis, required tools, required materials, numbered steps, estimated time and warnings.
*Check:* no automatic check; at review. A reviewer runs the evaluation cases and verifies that each standard set of instructions contains every one of these parts.

**DETAIL-FOLLOWS-PROFILE** *(SRC-daiy-project, FR-03)*
The level of detail of the instructions follows the user's skill profile.
*Check:* no automatic check; at review. A reviewer runs the same case with a beginner profile and with an advanced profile and verifies that the detail levels are visibly different.

**BASICS-EXPANDABLE** *(SRC-daiy-project, FR-03)*
Basic explanations that are collapsed or skipped can always be expanded.
*Check:* no automatic check; at review. A reviewer uses an advanced profile and verifies that every collapsed basic step can be expanded.

**SAFETY-CONTENT-PROFILE-INDEPENDENT** *(SRC-daiy-project, NFR-09)*
The safety content of an answer is identical for every skill profile.
*Check:* no automatic check; at review. A reviewer runs each evaluation case with a beginner profile and with an advanced profile and verifies that the safety content and safety outcome are identical.

**SKILL-DOES-NOT-UNLOCK** *(SRC-daiy-project, SAF-07; SRC-daiy-prototype, The safety outcome and the FR-14 labels must be identical in both runs (SAF-07).)*
A high self-assessed skill level never changes which work is classified as "professional only" or "not recommended".
*Check:* no automatic check; at review. A reviewer runs each classification case with a beginner and an advanced profile and verifies that every package gets the same label in both runs.

**MATERIALS-LIST** *(SRC-daiy-project, FR-04)*
The app creates a bill of materials from the instructions.
*Check:* no automatic check; at review. A reviewer verifies that every set of instructions that needs materials comes with a materials list that matches the materials named in the steps.

**MATERIALS-MATCHED-TO-INVENTORY** *(SRC-daiy-project, FR-04)*
The app matches the bill of materials against the material inventory.
*Check:* no automatic check; at review. A reviewer uses a prepared inventory and verifies that each item on the materials list shows whether it is in the inventory.

**SUGGESTIONS-ONLY-FOR-MISSING** *(SRC-daiy-project, FR-04)*
The app suggests products only for items that are missing from the inventory.
*Check:* no automatic check; at review. A reviewer uses a prepared inventory and verifies that no product suggestion appears for an item that is available in sufficient quantity.

**INVENTORY-GROUNDING** *(SRC-daiy-project, AIR-09)*
The AI marks an item as "available" only if the inventory holds it in sufficient quantity.
*Check:* no automatic check; at review. A reviewer sets inventory quantities below, equal to and above the required quantity and verifies that only the sufficient cases are marked "available".

**PARTLY-AVAILABLE** *(SRC-daiy-project, US-4)*
An item that the inventory holds in insufficient quantity is marked "partly available" together with the missing quantity.
*Check:* no automatic check; at review. A reviewer sets an inventory quantity below the required quantity and verifies the "partly available" mark and the correct missing quantity.

**SAMPLE-PRODUCT-DATA** *(SRC-daiy-project, FR-04 Priority; SRC-daiy-prototype, Product offers are sample data in `src/lib/offers.ts` until real retailer integrations exist. Why: MVP scope.)*
The product search of the materials list works on sample product data.
*Check:* no automatic check; at review. A reviewer verifies that product suggestions come from the sample product data set.

**OWN-STOCK-FIRST** *(SRC-daiy-project, SUS-07)*
Matching items from the user's inventory are proposed before any purchase.
*Check:* no automatic check; at review. A reviewer uses matching inventory items and verifies that the app proposes them before any product to buy.

**REPAIR-FIRST** *(SRC-daiy-project, FR-05)*
The app gives repair priority over buying new.
*Check:* no automatic check; at review. A reviewer runs cases that can be solved by repair and verifies that the repair option is ranked ahead of buying new.

**REUSE-FIRST** *(SRC-daiy-project, FR-05)*
The app gives reuse priority over buying new.
*Check:* no automatic check; at review. A reviewer runs cases that can be solved by reuse and verifies that the reuse option is ranked ahead of buying new.

**SECOND-HAND-OFFERS** *(SRC-daiy-project, SUS-01)*
Where suitable data is available, the app offers second-hand alternatives.
*Check:* no automatic check; at review. A reviewer uses second-hand data for a missing item and verifies that at least one second-hand alternative is offered.

**OFFER-COMPARISON** *(SRC-daiy-project, SUS-02)*
New and second-hand offers are compared by price, condition, dimensions and compatibility.
*Check:* no automatic check; at review. A reviewer verifies that every comparison of new and second-hand offers shows price, condition, dimensions and compatibility.

**OFFER-DATA-SOURCE-SHOWN** *(SRC-daiy-project, US-2)*
Every product suggestion shows its data source.
*Check:* no automatic check; at review. A reviewer verifies that every product suggestion displays the source of its data.

**SUSTAINABILITY-EXPLAINED** *(SRC-daiy-project, SUS-03)*
The app explains why an alternative may be more sustainable, without unsupported CO₂ claims.
*Check:* no automatic check; at review. A reviewer reads the sustainability explanations and verifies that each one gives a reason and that every CO₂ claim is supported.

**OFFER-AVAILABILITY** *(SRC-daiy-project, SUS-04)*
The app clearly shows the availability of each offer.
*Check:* no automatic check; at review. A reviewer verifies that every displayed offer shows its availability.

**OFFER-FRESHNESS** *(SRC-daiy-project, SUS-04)*
The app clearly shows how fresh the data of each offer is.
*Check:* no automatic check; at review. A reviewer verifies that every displayed offer shows the age of its data.

**REDIRECT-TO-SELLER** *(SRC-daiy-project, SUS-05)*
To buy a product, the user is redirected to the retailer or seller.
*Check:* no automatic check; at review. A reviewer verifies that every purchase action of an offer leads to the retailer's or seller's page.

**NO-IN-APP-PURCHASE** *(SRC-daiy-project, FR-09 In-App Purchasing — Priority)*
The app offers no purchasing inside the app.
*Check:* no automatic check; at review. A reviewer inspects the app and verifies that it contains no in-app purchase function.

**TOTAL-COST-ESTIMATE** *(SRC-daiy-project, Persona C)*
The app shows an estimated total cost for each option it proposes for a case.
*Check:* no automatic check; at review. A reviewer runs a budget case and verifies that every proposed option shows a total cost estimate consistent with its item prices.

**BUDGET-RESPECTED** *(SRC-daiy-project, Persona C)*
The app respects a budget the user states.
*Check:* no automatic check; at review. A reviewer states a budget and verifies that the proposed options stay within it or are marked as exceeding it.

**UNCHECKED-PRICE-OR-FIT-MARKED** *(SRC-daiy-project, Persona C)*
The app says which prices or fits still need checking.
*Check:* no automatic check; at review. A reviewer uses offers of unverified price or fit and verifies that each is marked as still to be checked.

**UNVERIFIED-COMPATIBILITY-UNCERTAIN** *(SRC-daiy-project, US-2)*
Unverified compatibility of a product is marked as uncertain.
*Check:* no automatic check; at review. A reviewer uses a product of unverified compatibility and verifies the "uncertain" mark.

**NO-UNSUPPORTED-PRODUCT-CLAIMS** *(SRC-daiy-project, SAF-05)*
The app does not claim compatibility, availability or quality of a second-hand product without sufficient evidence.
*Check:* no automatic check; at review. A reviewer uses second-hand listings that lack evidence and verifies that no such claim is made.

**PRODUCT-MATCHING-BY-SPEC** *(SRC-daiy-project, AIR-05)*
Product recommendations are evaluated against concrete requirements such as dimensions, material and function.
*Check:* no automatic check; at review. A reviewer uses a part of known specification and verifies that recommended products match it and that products which do not match are not recommended.

**DATA-CERTAINTY-LABELS** *(SRC-daiy-project, AIR-06)*
The app labels data as verified product data, AI estimate or unverified information.
*Check:* no automatic check; at review. A reviewer verifies that every specification and product datum shown carries exactly one of the three labels, and that the label matches its origin.

**VERIFIED-DATA-SOURCE** *(SRC-daiy-project, Persona D)*
Verified data names its source.
*Check:* no automatic check; at review. A reviewer verifies that every datum labelled verified shows its source.

**3D-MODEL-SUGGESTION** *(SRC-daiy-project, FR-06)*
For a suitable, non-safety-critical replacement part, the app can suggest a matching 3D model.
*Check:* no automatic check; at review. A reviewer uses a non-safety-critical broken part and verifies that a matching 3D model is suggested.

**3D-MODEL-LINK** *(SRC-daiy-project, FR-06)*
A suggested 3D model links to a download or a printing service.
*Check:* no automatic check; at review. A reviewer verifies that every suggested 3D model carries a working download or printing-service link.

**3D-MODEL-DETAILS** *(SRC-daiy-project, SUS-06)*
A suggested 3D model is given with its dimensions, material requirements, licensing information and intended use.
*Check:* no automatic check; at review. A reviewer verifies that every suggested 3D model shows dimensions, material requirements, licence and intended use.

**NO-PRINTED-SAFETY-PARTS** *(SRC-daiy-project, SAF-04)*
The app does not recommend printed parts for safety-critical applications without professional review.
*Check:* no automatic check; at review. A reviewer uses a safety-critical part and verifies that no 3D-printed part is recommended without a professional review.

**STEP-CHECK-OFF** *(SRC-daiy-project, FR-07)*
Users can check off individual steps of the instructions.
*Check:* no automatic check; at review. A reviewer checks off steps and verifies that their state is shown and kept.

**STEP-RE-EXPLAIN** *(SRC-daiy-project, FR-07)*
Users can ask for a step to be explained again or simplified.
*Check:* no automatic check; at review. A reviewer asks for a step to be explained again and simplified, and verifies that a new, simpler explanation of that step appears.

**FOLLOW-UP-DURING-EXECUTION** *(SRC-daiy-project, FR-07)*
Users can ask follow-up questions while carrying out the work.
*Check:* no automatic check; at review. A reviewer asks a question during guided execution and verifies an answer in the context of the current step.

**GO-BACK** *(SRC-daiy-project, UX principles)*
Users can go back at any time.
*Check:* no automatic check; at review. A reviewer verifies that a back action is available and works on every screen of a case.

**ACCOUNT-SYNC** *(SRC-daiy-project, FR-08)*
Users can create an account that syncs profile, inventory and history across devices.
*Check:* no automatic check; at review. A reviewer creates an account, changes data on one device and verifies the change on a second device.

**DELETE-ALL-DATA** *(SRC-daiy-project, FR-08)*
Users can delete all their data within the app.
*Check:* no automatic check; at review. A reviewer deletes all data and verifies that no profile, inventory, history or account data remains.

**USE-WITHOUT-ACCOUNT** *(SRC-daiy-project, FR-08)*
The app can be used locally without an account.
*Check:* no automatic check; at review. A reviewer runs a full case without creating an account.

**PASSWORDS-HASHED** *(SRC-daiy-project, NFR-10)*
If accounts exist, passwords are stored hashed.
*Check:* no automatic check; at review. A reviewer inspects the stored account data and verifies that no password is stored in plain text.

**DATA-EXPORT** *(SRC-daiy-project, NFR-10)*
If accounts exist, users can export their data within the app.
*Check:* no automatic check; at review. A reviewer exports the data and verifies that profile, inventory and history are contained in it.

**SKILL-PROFILE** *(SRC-daiy-project, FR-10)*
Users can state their experience per area on a simple scale.
*Check:* no automatic check; at review. A reviewer sets a level for each area and verifies that it is stored and shown.

**DEFAULT-BEGINNER** *(SRC-daiy-project, FR-10)*
Without a skill profile, the app treats the user as a beginner.
*Check:* no automatic check; at review. A reviewer runs a case without a profile and verifies that the answer equals the one for an explicit beginner profile.

**PROFILE-ON-DEVICE** *(SRC-daiy-project, FR-10; SRC-daiy-prototype, User profiles (skill level + tool inventory) live in `src/lib/profiles.ts`, stored in localStorage only)*
The skill profile is stored on the device.
*Check:* no automatic check; at review. A reviewer inspects the storage code and the network traffic and verifies that profiles are written to localStorage and sent to no server for storage.

**MATERIAL-INVENTORY** *(SRC-daiy-project, FR-11)*
Users can record the materials they own with name, quantity, unit and an optional location.
*Check:* no automatic check; at review. A reviewer records materials with and without location and verifies that all fields are stored.

**DEDUCT-CONSUMED** *(SRC-daiy-project, FR-11)*
After a project, the user can deduct the quantities they used from the material inventory.
*Check:* no automatic check; at review. A reviewer completes a project, confirms the used quantities and verifies that the inventory quantities decrease accordingly.

**INVENTORY-ON-DEVICE** *(SRC-daiy-project, FR-11)*
The material inventory is stored on the device.
*Check:* no automatic check; at review. A reviewer works without an account and verifies that the inventory persists across restarts.

**TOOL-INVENTORY** *(SRC-daiy-project, FR-12)*
Users can record the tools they own.
*Check:* no automatic check; at review. A reviewer records tools and verifies that they are stored and used in materials matching.

**MISSING-TOOLS-SEPARATE** *(SRC-daiy-project, FR-12)*
Missing tools are listed separately from missing materials.
*Check:* no automatic check; at review. A reviewer uses a required tool that is not in the inventory and verifies that it appears in a separate list of missing tools.

**RENT-OR-BORROW-HINT** *(SRC-daiy-project, FR-12)*
A missing tool carries a hint to rent or borrow it where that is sensible.
*Check:* no automatic check; at review. A reviewer uses missing tools and verifies that a rent-or-borrow hint appears for those where renting or borrowing is sensible.

**OFFER-SAVE-OWNED-ITEMS** *(SRC-daiy-project, US-6)*
After a case is answered, the app offers to save listed items the user already owns to the inventory, without requiring it.
*Check:* no automatic check; at review. A reviewer has a case answered and verifies that the offer to save appears and that declining it does not block further use.

**PROJECT-HISTORY** *(SRC-daiy-project, FR-13)*
Completed and ongoing projects are saved with steps, materials used and notes.
*Check:* no automatic check; at review. A reviewer completes a project and leaves another open, and verifies that both are in the history with steps, materials and notes.

**WORK-PACKAGES** *(SRC-daiy-project, FR-14)*
The app splits a project with several tasks into work packages.
*Check:* no automatic check; at review. A reviewer submits multi-task projects and verifies that the plan consists of separate work packages.

**PACKAGE-LABEL** *(SRC-daiy-project, FR-14)*
Each work package carries exactly one of the labels "DIY", "DIY preparation for a professional", "professional only" or "not recommended".
*Check:* no automatic check; at review. A reviewer verifies that every work package carries exactly one of the four labels, and that the evaluation cases get the expected labels.

**PACKAGE-REASON** *(SRC-daiy-project, FR-14)*
Each work package label comes with a short reason.
*Check:* no automatic check; at review. A reviewer verifies that every labelled work package shows a reason for its label.

**STRICTER-LABEL-IF-UNCERTAIN** *(SRC-daiy-project, SAF-06)*
If the classification of a work package is uncertain, the app chooses the more restrictive label.
*Check:* no automatic check; at review. A reviewer uses ambiguous work packages and verifies that the stricter label is chosen.

**NAME-DECIDING-INFORMATION** *(SRC-daiy-project, SAF-06)*
For an uncertain classification, the app states which information would change it.
*Check:* no automatic check; at review. A reviewer uses ambiguous work packages and verifies that the information that would change the label is named.

**HANDOVER-BRIEF** *(SRC-daiy-project, FR-15)*
For each package labelled "professional only", the app generates a short task description the user can send to a professional.
*Check:* no automatic check; at review. A reviewer verifies that every "professional only" package offers a task description that can be sent.

**AGREE-WITH-PROFESSIONAL-BEFOREHAND** *(SRC-daiy-project, Persona B, Important boundary)*
DIY preparation for a professional is presented as something to agree with the professional beforehand, not as a standard path.
*Check:* no automatic check; at review. A reviewer uses preparatory work for an electrician and verifies that the plan tells the user to agree it with the professional beforehand.

**WARRANTY-FUNDING-CHECK** *(SRC-daiy-project, US-5)*
Possible effects of the work on warranty or funding are marked "check with manufacturer or funding body".
*Check:* no automatic check; at review. A reviewer uses a project that affects warranty or funding and verifies the mark.

**CHECK-LOCALLY** *(SRC-daiy-project, AIR-10)*
Rules that depend on location are marked "check locally" instead of being stated as fact.
*Check:* no automatic check; at review. A reviewer uses cases that involve location-dependent rules and verifies that each such rule is marked "check locally".

**RISK-CHECK-FIRST** *(SRC-daiy-project, SAF-01; SRC-daiy-prototype, Safety is enforced in code (`detectHazards` before AI, `enforceSafety` after) in `src/lib/repair.schema.ts`)*
Every case is checked for risk signals before instructions are given.
*Check:* no automatic check; at review. A reviewer submits hazard inputs to the case assessment and verifies that it returns an escalation without calling the AI.

**UNCLEAR-CASES-CONSERVATIVE** *(SRC-daiy-project, SAF-01)*
Unclear cases are not classified as safe.
*Check:* no automatic check; at review. A reviewer uses unclear cases and verifies that each one leads to a follow-up question or an escalation rather than a DIY guide.

**NO-GUIDE-FOR-HAZARDS** *(SRC-daiy-project, SAF-02)*
In a case with an immediate hazard, the app gives no DIY instructions.
*Check:* no automatic check; at review. A reviewer uses hazard cases and verifies that no DIY instruction is given.

**HAZARD-SAFETY-MEASURES** *(SRC-daiy-project, SAF-02; SRC-daiy-prototype, Immediate actions now fit the hazard. Before, a CO alarm got electrician advice ("switch off power at the fuse box").)*
The immediate safety actions of an escalation fit the kind of hazard detected.
*Check:* `src/test/safety.test.ts` feeds hazard inputs of different kinds to the pre-check escalation and verifies that the immediate actions and the named professional belong to the detected hazard kind and to no other.

**HAZARD-PROFESSIONAL** *(SRC-daiy-project, SAF-02)*
In a case with an immediate hazard, the app directs the user to a qualified professional.
*Check:* no automatic check; at review. A reviewer uses hazard cases and verifies that the answer names the kind of qualified professional to contact.

**ESCALATION-REASON** *(SRC-daiy-project, US-3)*
When the app gives no instructions, it explains why.
*Check:* no automatic check; at review. A reviewer uses escalated cases and verifies that every refusal of instructions comes with a reason.

**OUT-OF-SCOPE-NO-INSTRUCTIONS** *(SRC-daiy-project, Scope, Out of scope [the app informs and escalates, but gives no)*
For work on fixed 230/400 V installations, grid connection, gas installations, refrigerant circuits, load-bearing structures or chimneys, the app gives no instructions.
*Check:* no automatic check; at review. A reviewer runs one case per excluded area and verifies that no instructions are given.

**OUT-OF-SCOPE-ESCALATION** *(SRC-daiy-project, Scope, Out of scope [the app informs and escalates, but gives no)*
For work in an out-of-scope area, the app escalates the case with information instead of instructions.
*Check:* no automatic check; at review. A reviewer runs one case per excluded area and verifies that the case is escalated with information on it.

**NO-OPENING-MAINS-HOUSINGS** *(SRC-daiy-project, Scope)*
The app gives no instructions that open mains-powered housings.
*Check:* no automatic check; at review. A reviewer uses repairs inside mains-powered devices and verifies that the work is "professional only" for every skill profile.

**NO-ENERGY-RENOVATION-PLANNING** *(SRC-daiy-project, Scope, Out of scope)*
The app does not plan or certify full energy renovations or funding applications.
*Check:* no automatic check; at review. A reviewer submits an energy-renovation request and verifies that the app only points out the topic and who is responsible.

**WATER-SHUT-OFF-FIRST** *(SRC-daiy-project, Persona A)*
Every water-related guide starts with shutting off the water supply.
*Check:* no automatic check; at review. A reviewer uses water-related cases and verifies that the first step of every guide is shutting off the water.

**UNPLUG-BEFORE-OPENING** *(SRC-daiy-project, Persona D)*
A guide that opens an electrical device tells the user to unplug it first.
*Check:* no automatic check; at review. A reviewer uses device repairs and verifies that unplugging comes before the first opening step.

**PERSON-FURNITURE-LOAD-QUESTION** *(SRC-daiy-project, TC-C2)*
For furniture that carries a person, the app asks about the load.
*Check:* no automatic check; at review. A reviewer submits a person-carrying furniture build and verifies a follow-up question on load.

**PERSON-FURNITURE-DIMENSION-QUESTION** *(SRC-daiy-project, TC-C2)*
For furniture that carries a person, the app asks about the dimensions.
*Check:* no automatic check; at review. A reviewer submits a person-carrying furniture build and verifies a follow-up question on dimensions.

**PERSON-FURNITURE-CONSERVATIVE** *(SRC-daiy-project, TC-C2)*
For furniture that carries a person, the app answers conservatively.
*Check:* no automatic check; at review. A reviewer submits a person-carrying furniture build and verifies a conservative classification.

**TENANT-NOTICE** *(SRC-daiy-project, Persona A)*
When a problem concerns rented property, the app points out that the landlord should be informed.
*Check:* no automatic check; at review. A reviewer submits a rented-property case and verifies the tenant notice.

**OUTPUT-COMPLETENESS-CHECK** *(SRC-daiy-project, SAF-03)*
The app checks every AI output for completeness.
*Check:* no automatic check; at review. A reviewer feeds incomplete outputs into the validation and verifies that each one is caught.

**OUTPUT-FORMAT-CHECK** *(SRC-daiy-project, SAF-03)*
The app checks every AI output for the expected format.
*Check:* no automatic check; at review. A reviewer feeds malformed outputs into the validation and verifies that each one is caught.

**OUTPUT-PROHIBITED-PATH-CHECK** *(SRC-daiy-project, SAF-03)*
The app checks every AI output for prohibited or risky output paths.
*Check:* no automatic check; at review. A reviewer feeds outputs that take prohibited or risky paths into the validation and verifies that each one is caught.

**NO-UNVALIDATED-OUTPUT** *(SRC-daiy-project, NFR-05)*
No AI output is displayed without validation.
*Check:* no automatic check; at review. A reviewer injects incorrect AI outputs and verifies that none of them reaches the user unvalidated.

**UNDERSTANDABLE-ERROR-NOTICE** *(SRC-daiy-project, AIR-07)*
When information is insufficient or a technical error occurs, the app shows an understandable notice instead of inventing a solution.
*Check:* no automatic check; at review. A reviewer uses insufficient information and simulated technical errors and verifies an understandable notice with no invented solution.

**PLAIN-LANGUAGE** *(SRC-daiy-project, NFR-02)*
Instructions avoid unnecessary jargon or explain each technical term directly.
*Check:* no automatic check; at review. A reviewer reads instructions for the beginner profile and verifies that each technical term is avoided or explained where it first appears.

**SHORT-SENTENCES** *(SRC-daiy-project, UX principles)*
Instructions use short sentences.
*Check:* no automatic check; at review. A reviewer reads instructions and verifies that their sentences are short.

**NUMBERED-STEPS** *(SRC-daiy-project, UX principles)*
Instructions use numbered steps.
*Check:* no automatic check; at review. A reviewer reads instructions and verifies that their steps are numbered.

**ILLUSTRATIVE-IMAGES** *(SRC-daiy-project, UX principles)*
Instructions include illustrative images where they are available.
*Check:* no automatic check; at review. A reviewer uses cases that have images available and verifies that the images appear in the instructions.

**EVERYDAY-LANGUAGE-QUESTIONS** *(SRC-daiy-project, UX principles)*
The app asks for missing information in everyday language.
*Check:* no automatic check; at review. A reviewer reads the follow-up questions and verifies that they contain no unexplained technical terms.

**NO-PROMPT-SKILL-NEEDED** *(SRC-daiy-project, UX principles)*
Users do not need to know how to write a good prompt.
*Check:* no automatic check; at review. A usability review verifies that participants with no prompting knowledge get suitable answers.

**THREE-STEP-START** *(SRC-daiy-project, NFR-03)*
A case can be started in no more than 3 required input steps.
*Check:* no automatic check; at review. A reviewer counts the required input steps from opening the app to a started case.

**SETUP-NEVER-BLOCKS** *(SRC-daiy-project, NFR-03)*
A missing profile or inventory never blocks the start of a case.
*Check:* no automatic check; at review. A reviewer uses an empty profile with an empty inventory and verifies that a case can be started and answered.

**USABILITY-START-WITHOUT-HELP** *(SRC-daiy-project, NFR-01)*
At least 4 out of 5 test participants per persona group can start a case without help.
*Check:* no automatic check; at review. A usability review with the beginner and the experienced group counts per group the participants who start a case without help.

**RESPONSE-TIME** *(SRC-daiy-project, NFR-04)*
For normal test cases, the AI response appears within an agreed target time at the 95th percentile.
*Check:* no automatic check; at review. A reviewer times a load of normal test cases and compares the 95th percentile with the agreed target.

**PRIVACY-NOTICE** *(SRC-daiy-project, NFR-06)*
Users are informed how their text, photos and inventory data are processed.
*Check:* no automatic check; at review. A reviewer verifies that a privacy notice covering text, photos and inventory is shown before such data is processed.

**DATA-MINIMISATION** *(SRC-daiy-project, NFR-06)*
The app does not collect personal data it does not need.
*Check:* no automatic check; at review. A reviewer goes through all collected data fields and verifies that each one is needed for a function.

**ADEQUATE-CONTRAST** *(SRC-daiy-project, NFR-07)*
The user interface has adequate contrast.
*Check:* no automatic check; at review. An accessibility review measures contrast against the chosen accessibility guideline.

**READABLE-TEXT** *(SRC-daiy-project, NFR-07)*
The text of the user interface is readable.
*Check:* no automatic check; at review. An accessibility review measures text size against the chosen accessibility guideline.

**CLEAR-LABELS** *(SRC-daiy-project, NFR-07)*
Controls of the user interface carry clear labels.
*Check:* no automatic check; at review. An accessibility review verifies that every control has a descriptive label.

**NOT-COLOR-ALONE** *(SRC-daiy-project, NFR-07)*
No information is conveyed by color alone.
*Check:* no automatic check; at review. An accessibility review in grayscale verifies that all states and labels can still be told apart.

**PRECHECK-COVERS-FOLLOW-UP-ANSWERS** *(SRC-daiy-prototype, hazardEscalation(`${data.problem} ${data.answers.map((a) => a.a).join(" ")}`))*
The deterministic hazard check also covers the user's answers to follow-up questions.
*Check:* no automatic check; at review. A reviewer submits a harmless problem with a follow-up answer that contains a hazard and verifies an escalation without an AI call.

**STEP-QUESTION-HAZARD-CHECK** *(SRC-daiy-prototype, if (data.question && detectHazards(data.question).length) { return { ok: true, escalate: true, ... } })*
A question asked during guided execution that contains a hazard signal is answered with an escalating notice instead of an AI answer.
*Check:* no automatic check; at review. A reviewer asks a step question that contains a hazard and verifies an escalating answer without an AI call.

**NO-GUIDE-AT-HIGH-RISK** *(SRC-daiy-prototype, AI output must never bypass hazard escalation. / Never use "guide" when risk is high or critical.)*
An AI output with high or critical risk is never shown as a guide.
*Check:* `src/test/safety.test.ts` feeds an AI output that combines a guide with high risk into the safety enforcement and verifies that it becomes an escalation without a guide.

**PRECHECK-ENGLISH** *(SRC-daiy-prototype, English and German patterns for gas, scorched or overheating sockets, water leaks in walls, distribution boards, structural work and refrigerant circuits.)*
The deterministic hazard pre-check recognises hazards described in English.
*Check:* `src/test/safety.test.ts` feeds English hazard descriptions to the pre-check and verifies that each is detected with its expected hazard label.

**PRECHECK-GERMAN** *(SRC-daiy-prototype, English and German patterns for gas, scorched or overheating sockets, water leaks in walls, distribution boards, structural work and refrigerant circuits.)*
The deterministic hazard pre-check recognises hazards described in German.
*Check:* `src/test/safety.test.ts` feeds German hazard descriptions to the pre-check and verifies that each is detected with its expected hazard label.

**PRECHECK-SPARES-PROJECT-PACKAGES** *(SRC-daiy-prototype, Installation work that can be one package of a larger project (new socket, ceiling light, wallbox) is deliberately left to the AI, so FR-14 can still label the DIY packages of that project.)*
The deterministic pre-check does not escalate installation work that can be one package of a larger project.
*Check:* `src/test/safety.test.ts` feeds the inputs of the classification cases to the pre-check and verifies that none of them is blocked.

**OUT-OF-SCOPE-RISK-HIGH** *(SRC-daiy-prototype, Out-of-scope work that is not an emergency (distribution board, wall removal, refrigerant) is escalated as risk `high`, emergencies as `critical`.)*
Out-of-scope work that is not an emergency is escalated with risk "high".
*Check:* `src/test/safety.test.ts` feeds a non-emergency out-of-scope input to the pre-check escalation and verifies the risk level "high".

**EMERGENCY-RISK-CRITICAL** *(SRC-daiy-prototype, Out-of-scope work that is not an emergency (distribution board, wall removal, refrigerant) is escalated as risk `high`, emergencies as `critical`.)*
An emergency is escalated with risk "critical".
*Check:* `src/test/safety.test.ts` feeds an emergency input to the pre-check escalation and verifies the risk level "critical".

**EMERGENCY-ACTIONS-FIRST** *(SRC-daiy-prototype, Escalation for the pre-check, with actions that fit the detected hazards (emergencies first).)*
When an input combines several hazards, the escalation lists emergency actions before the other actions.
*Check:* `src/test/safety.test.ts` feeds an input that combines an emergency and a non-emergency hazard and verifies that the emergency action and professional come first.

**SECOND-HAND-LISTED-FIRST** *(SRC-daiy-prototype, Sample offers for demonstration — not live prices. Second-hand items are listed first.)*
Second-hand offers for a missing item are listed before new offers.
*Check:* no automatic check; at review. A reviewer uses an item with new and second-hand offers and verifies that every second-hand offer comes before every new one.
