import type { HazardKind } from "../case-model";

export type CatalogueEntry = {
  kind: HazardKind;
  /** Name of the kind in the reason of an escalation. */
  label: string;
  emergency: boolean;
  en: RegExp[];
  de: RegExp[];
  actions: string[];
  professional: string;
  /** Why no instructions are given for this kind. */
  why: string;
};

/**
 * One entry per kind, in the order of `HazardKind`: emergencies first, then out-of-scope work.
 * The patterns do not match installation work that can be one package of a larger project
 * (new socket, ceiling light, wallbox), so that the packages of such a project can still be labelled.
 */
export const CATALOGUE: CatalogueEntry[] = [
  {
    kind: "gas",
    label: "possible gas leak",
    emergency: true,
    en: [/\bgas (smell|leak)|\bsmell\w*\b.{0,15}\bgas\b(?! (lift|spring))/i],
    de: [/\bgasgeruch|\bgasleck|\briecht\w*\b.{0,15}\bgas\b/i],
    actions: [
      "Do not use switches, flames or phones inside",
      "Open windows and leave the building",
      "Call the gas emergency line from outside",
    ],
    professional: "Gas emergency service / licensed gas fitter",
    why: "a gas leak is an immediate danger to life.",
  },
  {
    kind: "carbon-monoxide",
    label: "carbon monoxide",
    emergency: true,
    en: [/\b(carbon monoxide|co (alarm|detector))/i],
    de: [/\b(co-melder|kohlenmonoxid)/i],
    actions: [
      "Open windows to ventilate and leave the building",
      "Call the emergency number 112 if anyone has a headache, dizziness or nausea",
      "Do not use the boiler or stove until it has been checked",
    ],
    professional: "Heating technician (emergency services 112 if anyone feels unwell)",
    why: "carbon monoxide is an odourless poison and an immediate danger to life.",
  },
  {
    kind: "fire-or-smoke",
    label: "fire or smoke",
    emergency: true,
    en: [
      /\b(smoke(?! (detector|alarm))|burning smell|smells? burn(t|ed|ing)|on fire|catch(es|ing)? fire)\b/i,
    ],
    de: [/\b(rauch|brandgeruch|riecht verbrannt|qualmt)\b/i],
    actions: [
      "If there is fire or heavy smoke, leave the building and call the fire brigade (112)",
      "Do not try to put out a fire that is spreading",
      "Do not use the device or the room again until it has been checked",
    ],
    professional: "Fire brigade (112), then a licensed electrician",
    why: "fire and smoke are an immediate danger to life and property.",
  },
  {
    kind: "overheating-electrics",
    label: "overheating or scorched electrics",
    emergency: true,
    en: [
      /\b(exposed|frayed|damaged|burnt|burned|melted|scorched|charred)\b.{0,25}\b(wire|wiring|cable|cord|socket|outlet|plug|switch)\b/i,
      /\b(socket|outlet|plug|cable|cord|wire|wiring|switch)\b.{0,30}\b(burnt|burned|melted|scorched|charred)\b|\b(socket|outlet)\b.{0,30}\bblack(ened)?\b/i,
      /\b(socket|outlet|plug)\b.{0,30}\b(gets? hot|is hot|hot|warm)\b/i,
      /\b(sparks?|sparking|electric shock|shocked me)\b/i,
    ],
    de: [
      /\b(steckdose|stecker|kabel|schalter|leitung)\w*\b.{0,40}\b(verschmort|geschmolzen|verbrannt|schwarz)|\bverschmort/i,
      /\b(steckdose|stecker)\w*\b.{0,30}\b(heiß|warm)\b/i,
      /\b(funken|stromschlag)\b/i,
    ],
    actions: [
      "Do not touch the damaged part and stop using it",
      "Keep children and pets away",
      "Do not use the socket, cable or device again until an electrician has checked it",
    ],
    professional: "Licensed electrician",
    why: "overheated or scorched electrics can cause fire and electric shock.",
  },
  {
    kind: "water-near-electrics",
    label: "water near electrics",
    emergency: true,
    en: [
      /\b(water|wet|flood\w*)\b.{0,40}\b(socket|outlet|fuse box|electrics|wiring)\b|\b(socket|outlet|fuse box|electrics|wiring)\b.{0,40}\b(under water|wet|flooded)\b/i,
    ],
    de: [
      /\b(wasser|nass)\b.{0,40}\b(steckdose|sicherungskasten|elektrik|strom)|\b(steckdose|sicherungskasten|elektrik)\w*\b.{0,40}\b(nass|überflutet|unter wasser)\b/i,
    ],
    actions: [
      "Close the main water valve",
      "Do not touch sockets, devices or the fuse box while standing in water or with wet hands",
      "Do not use any socket or device that the water may have reached until an electrician has checked it",
    ],
    professional: "Licensed electrician (and a plumber for the water)",
    why: "water on live electrics can cause electric shock and fire.",
  },
  {
    kind: "water-leak-in-wall",
    label: "water leak in a wall or ceiling",
    emergency: true,
    en: [
      /\b(burst pipe|pipe burst|flood(ed|ing)?)\b|\bleak\w*\b.{0,40}\b(wall|ceiling)\b|\b(wall|ceiling)\b.{0,30}\bleak\w*/i,
    ],
    de: [/\b(rohrbruch|wasserschaden)\b|\b(wand|decke)\b.{0,30}\b(nass|tropft|leck)/i],
    actions: [
      "Close the main water valve",
      "Do not open the wall or ceiling yourself",
      "Keep away from sockets and devices the water may have reached",
    ],
    professional: "Plumber",
    why: "a pipe leaking inside a wall or ceiling needs to be found and repaired by a professional.",
  },
  {
    kind: "structural-damage",
    label: "structural damage",
    emergency: true,
    en: [
      /\b(structural (crack|damage)|(sagging|collapsing) ceiling|ceiling (is )?(sagging|collapsing)|wall (is )?(bulging|leaning|collapsing)|foundation crack)/i,
    ],
    de: [
      /\b(statischer riss|setzrisse?|(decke|wand)\b.{0,15}\b(hängt durch|senkt sich|wölbt sich|neigt sich))/i,
    ],
    actions: [
      "Leave the affected room and keep others out",
      "Do not load, cut or remove anything from the damaged wall, ceiling or beam",
      "Call the emergency number 112 if parts are falling or have collapsed",
    ],
    professional: "Structural engineer",
    why: "damage to a building's structure can lead to collapse.",
  },
  {
    kind: "distribution-board",
    label: "distribution board",
    emergency: false,
    en: [/\b(fuse box|breaker panel|distribution board|consumer unit)\b/i],
    de: [/\b(sicherungskasten|verteilerkasten|zählerschrank|unterverteilung)\b/i],
    actions: ["Do not open the distribution board or work on fixed wiring"],
    professional: "Licensed electrician",
    why: "work on the distribution board is reserved to licensed electricians.",
  },
  {
    kind: "fixed-installation",
    label: "fixed 230/400 V installation",
    emergency: false,
    en: [
      /\b(fixed (electrical )?(wiring|installation)|house wiring|mains wiring|rewir\w+|(add|install|lay|run|put in)\w* (a |an )?(new )?(power |electrical )?circuits?|(230|400) ?v (installation|wiring|line|circuit)|three-phase (line|circuit|cable))\b/i,
    ],
    de: [
      /\b(festinstallation|elektroinstallation|hausverkabelung|drehstromleitung|stromkreis\w*|neu verdrahten)\b/i,
    ],
    actions: ["Do not work on fixed wiring or on the 230/400 V installation"],
    professional: "Licensed electrician",
    why: "work on fixed 230/400 V installations is reserved to licensed electricians.",
  },
  {
    kind: "grid-connection",
    label: "grid connection",
    emergency: false,
    en: [
      /\b(grid connection|mains connection|house connection|service cable|electricity meter)\b/i,
    ],
    de: [/\b(hausanschluss|netzanschluss|stromzähler)\b/i],
    actions: [
      "Do not touch the grid connection, the meter or the service cable",
      "Contact the grid operator",
    ],
    professional: "Licensed electrician registered with the grid operator",
    why: "the grid connection belongs to the grid operator and is reserved to registered electricians.",
  },
  {
    kind: "gas-installation",
    label: "gas installation",
    emergency: false,
    en: [
      /\bgas (pipe|line|installation|meter)s?\b|\b(install|connect|move|replace|fit|lay|change)\w*\b.{0,30}\bgas (hose|connection|boiler|stove|cooker|hob|fitting)/i,
    ],
    de: [
      /\b(gasleitung|gasanschluss|gasinstallation|gaszähler|gastherme|gasherd (anschließen|installieren))\b/i,
    ],
    actions: ["Do not install, change or connect gas pipes or gas appliances yourself"],
    professional: "Licensed gas fitter",
    why: "work on gas installations is reserved to licensed gas fitters.",
  },
  {
    kind: "refrigerant-circuit",
    label: "refrigerant circuit",
    emergency: false,
    en: [/\b(refrigerant|freon)\b/i],
    de: [/\bkältemittel\b/i],
    actions: [
      "Do not open or refill the refrigerant circuit",
      "You may clean filters and keep the outdoor unit free",
    ],
    professional: "Certified refrigeration / air-conditioning technician",
    why: "work on refrigerant circuits requires a certificate by law.",
  },
  {
    kind: "load-bearing-structure",
    label: "load-bearing structure",
    emergency: false,
    en: [
      /\bload[- ]bearing\b|\b(remove|knock (down|out)|tear down|demolish|take out|break through)\s+(the |a |an |this |that |my |our )?(interior |inner |partition |brick |concrete )?walls?\b(?!\s*(mount|plug|anchor|tile|cabinet|light|lamp|bracket|paint))/i,
    ],
    de: [
      /\btragende\w* wand\b|\bwand\b.{0,20}\b(entfernen|abreißen|herausreißen|durchbrechen)|\bwanddurchbruch\b/i,
    ],
    actions: [
      "Do not remove, cut into or drill through the wall before it has been checked",
      "A building permit may be needed – check locally",
    ],
    professional: "Structural engineer",
    why: "work on load-bearing structures can only be judged and approved by a structural engineer.",
  },
  {
    kind: "chimney",
    label: "chimney",
    emergency: false,
    en: [/\b(chimney(?! sweep)|flue)\b/i],
    de: [/\b(schornstein(?!feger)|abgasrohr|ofenrohr)\w*/i],
    actions: ["Do not change, seal or connect to the chimney or flue yourself"],
    professional: "Chimney sweep or heating installer",
    why: "work on chimneys and flues is regulated and must be approved by the chimney sweep.",
  },
  {
    kind: "energy-renovation",
    label: "energy renovation",
    emergency: false,
    en: [
      /\b(energy[- ](efficient )?(renovation|retrofit)|(whole|entire|full)[- ]house (retrofit|renovation)|funding application)\b/i,
    ],
    de: [/\b(energetische\w* sanierung|gebäudesanierung|förderantrag)\b/i],
    actions: [
      "Do not start a full renovation without a plan from an energy consultant",
      "Ask the energy consultant which funding applies",
    ],
    professional: "Certified energy consultant",
    why: "the app does not plan or certify a full energy renovation or its funding application.",
  },
];

const EITHER_ORDER = (a: string, b: string, gap: number) =>
  new RegExp(`(?:${a}).{0,${gap}}(?:${b})|(?:${b}).{0,${gap}}(?:${a})`, "i");

const BOARDS = "fuse box|consumer unit|distribution board|breaker panel";
const MAINS_PARTS =
  "power supply|psu|power adapter|power pack|charger|transformer|kettle|toaster|microwave|washing machine|dishwasher|dryer|oven|hob|fridge|freezer|television|\\btv\\b|hairdryer|vacuum cleaner|mixer";
const DE_BOARDS =
  "sicherungskasten|verteilerkasten|zählerschrank|unterverteilung|sicherungsschrank";
const DE_MAINS_PARTS =
  "netzteil|netzgerät|ladegerät|trafo|transformator|wasserkocher|toaster|mikrowelle|waschmaschine|geschirrspüler|trockner|backofen|herd|kühlschrank|gefrierschrank|fernseher|föhn|staubsauger|mixer";

/** Step texts that tell the reader to open a mains housing: a distribution board or the housing of a mains-powered device. */
export const OPENS_HOUSING: { en: RegExp[]; de: RegExp[] } = {
  en: [
    new RegExp(
      `\\b(open|opening|remove|removing|take off|unscrew|lift off|pry off)\\b.{0,40}\\b(${BOARDS})\\b`,
      "i",
    ),
    new RegExp(
      `\\b(open|opening|remove|removing|take off|unscrew|take apart|disassemble|dismantle)\\b.{0,30}\\b(housing|casing|case|enclosure|back cover|cover)\\b.{0,30}\\b(${MAINS_PARTS})`,
      "i",
    ),
    new RegExp(
      `\\b(take apart|disassemble|dismantle|open up|unscrew)\\b.{0,30}\\b(${MAINS_PARTS})`,
      "i",
    ),
  ],
  de: [
    EITHER_ORDER(
      "öffn\\w*|aufschraub\\w*|abschraub\\w*|abnehm\\w*|entfern\\w*|schrauben sie",
      `\\b(${DE_BOARDS})\\b`,
      40,
    ),
    EITHER_ORDER(
      "öffn\\w*|aufschraub\\w*|abschraub\\w*|abnehm\\w*|zerleg\\w*|auseinander\\w*|aufschrauben|schrauben sie",
      `(gehäuse|abdeckung|deckel)\\w*.{0,30}(${DE_MAINS_PARTS})`,
      40,
    ),
  ],
};
