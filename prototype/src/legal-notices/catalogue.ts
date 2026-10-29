import type { Notice, NoticeKind } from "../case-model";

export type CatalogueEntry = {
  applies: string;
  possible: string;
  marks: Notice["marks"];
};

/** Per notice kind, the fixed texts and marks. The key order is the catalogue order. */
export const CATALOGUE: Record<NoticeKind, CatalogueEntry> = {
  "location-dependent-rule": {
    applies: "This rule depends on the location. Check locally before you rely on it.",
    possible:
      "A rule here may depend on the location. Check locally before you rely on anything about it.",
    marks: ["check-locally"],
  },
  "permit-free": {
    applies:
      "No building permit does not mean no rules. Other requirements still apply: neighbour law, fire protection and product rules.",
    possible:
      "This project may need no building permit. Even then, other requirements may still apply: neighbour law, fire protection and product rules.",
    marks: [],
  },
  "heating-or-flue-change": {
    applies:
      "When you install, change or recommission a heating appliance or flue system, you as the owner must notify the district chimney sweep.",
    possible:
      "If you install, change or recommission a heating appliance or flue system, you as the owner may have to notify the district chimney sweep.",
    marks: [],
  },
  "heating-or-flue-decommission": {
    applies:
      "When you permanently take a heating appliance or flue system out of operation, you as the owner must notify the district chimney sweep.",
    possible:
      "If you permanently take a heating appliance or flue system out of operation, you as the owner may have to notify the district chimney sweep.",
    marks: [],
  },
  "firing-installation": {
    applies:
      "After you install a firing installation, change it substantially or switch its fuel, a chimney sweep must verify that it meets its requirements.",
    possible:
      "After you install a firing installation, change it substantially or switch its fuel, a chimney sweep may have to verify that it meets its requirements.",
    marks: [],
  },
  "planting-near-boundary": {
    applies: "Boundary distances apply when you plant near a property boundary.",
    possible: "Boundary distances may apply when you plant near a property boundary.",
    marks: ["check-locally"],
  },
  "boundary-installation": {
    applies:
      "The neighbour's consent may be required to remove or change an installation that separates two properties.",
    possible:
      "The neighbour's consent might be required to remove or change an installation that separates two properties.",
    marks: [],
  },
  "rented-property": {
    applies: "This concerns rented property. Inform the landlord.",
    possible: "This may concern rented property. If it does, inform the landlord.",
    marks: [],
  },
  "tenant-modification-right": {
    applies:
      "For accessibility, EV charging, burglary protection or plug-in solar, the tenant can demand the landlord's permission.",
    possible:
      "If this is for accessibility, EV charging, burglary protection or plug-in solar, the tenant may be able to demand the landlord's permission.",
    marks: [],
  },
  "warranty-or-funding": {
    applies:
      "This work has an effect on warranty or funding. Check with the manufacturer or funding body.",
    possible:
      "This work may have an effect on warranty or funding. Check with the manufacturer or funding body.",
    marks: ["check-with-manufacturer-or-funding-body"],
  },
};
