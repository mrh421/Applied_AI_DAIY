import type { HazardKind } from "../case-model";

/** The German texts of the catalogue entries: the same rules as the English ones, worded for a person who writes in German. */
export type HazardTexts = {
  label: string;
  actions: string[];
  professional: string;
  why: string;
};

export const GERMAN_TEXTS: Record<HazardKind, HazardTexts> = {
  gas: {
    label: "möglicher Gasaustritt",
    actions: [
      "Benutze drinnen keine Schalter, keine Flammen und kein Telefon",
      "Öffne die Fenster und verlasse das Gebäude",
      "Rufe den Gas-Notdienst von draußen an",
    ],
    professional: "Gas-Notdienst / Gas-Installateur mit Zulassung",
    why: "ein Gasaustritt ist eine unmittelbare Lebensgefahr.",
  },
  "carbon-monoxide": {
    label: "Kohlenmonoxid",
    actions: [
      "Öffne die Fenster zum Lüften und verlasse das Gebäude",
      "Rufe den Notruf 112, wenn jemand Kopfschmerzen, Schwindel oder Übelkeit hat",
      "Benutze Heizung und Herd erst wieder, wenn sie geprüft wurden",
    ],
    professional: "Heizungsfachbetrieb (Notruf 112, wenn jemand sich unwohl fühlt)",
    why: "Kohlenmonoxid ist ein geruchloses Gift und eine unmittelbare Lebensgefahr.",
  },
  "fire-or-smoke": {
    label: "Feuer oder Rauch",
    actions: [
      "Bei Feuer oder starkem Rauch: Verlasse das Gebäude und rufe die Feuerwehr (112)",
      "Versuche nicht, ein sich ausbreitendes Feuer zu löschen",
      "Benutze das Gerät oder den Raum erst wieder, wenn sie geprüft wurden",
    ],
    professional: "Feuerwehr (112), danach eine Elektrofachkraft",
    why: "Feuer und Rauch sind eine unmittelbare Gefahr für Leben und Eigentum.",
  },
  "overheating-electrics": {
    label: "überhitzte oder verschmorte Elektrik",
    actions: [
      "Fasse das beschädigte Teil nicht an und benutze es nicht mehr",
      "Halte Kinder und Haustiere fern",
      "Benutze Steckdose, Kabel oder Gerät erst wieder, wenn eine Elektrofachkraft sie geprüft hat",
    ],
    professional: "Elektrofachkraft",
    why: "überhitzte oder verschmorte Elektrik kann einen Brand oder einen Stromschlag verursachen.",
  },
  "water-near-electrics": {
    label: "Wasser an der Elektrik",
    actions: [
      "Schließe den Haupthahn für das Wasser",
      "Fasse Steckdosen, Geräte und den Sicherungskasten nicht an, wenn du im Wasser stehst oder nasse Hände hast",
      "Benutze keine Steckdose und kein Gerät, die das Wasser erreicht haben könnte, bis eine Elektrofachkraft sie geprüft hat",
    ],
    professional: "Elektrofachkraft (und ein Installateur für das Wasser)",
    why: "Wasser an stromführender Elektrik kann einen Stromschlag und einen Brand verursachen.",
  },
  "water-leak-in-wall": {
    label: "Wasserschaden in Wand oder Decke",
    actions: [
      "Schließe den Haupthahn für das Wasser",
      "Öffne die Wand oder Decke nicht selbst",
      "Halte Abstand zu Steckdosen und Geräten, die das Wasser erreicht haben könnte",
    ],
    professional: "Installateur",
    why: "ein Rohr, das in einer Wand oder Decke leckt, muss von einer Fachperson gesucht und repariert werden.",
  },
  "structural-damage": {
    label: "Schaden an der Bausubstanz",
    actions: [
      "Verlasse den betroffenen Raum und halte andere fern",
      "Belaste die beschädigte Wand, Decke oder den Balken nicht und schneide nichts heraus",
      "Rufe den Notruf 112, wenn Teile herabfallen oder eingestürzt sind",
    ],
    professional: "Statiker",
    why: "ein Schaden an der Bausubstanz eines Gebäudes kann zum Einsturz führen.",
  },
  "distribution-board": {
    label: "Verteilerkasten",
    actions: ["Öffne den Verteilerkasten nicht und arbeite nicht an der festen Verkabelung"],
    professional: "Elektrofachkraft",
    why: "Arbeiten am Verteilerkasten sind Elektrofachkräften vorbehalten.",
  },
  "fixed-installation": {
    label: "feste 230/400-V-Installation",
    actions: ["Arbeite nicht an der festen Verkabelung oder an der 230/400-V-Installation"],
    professional: "Elektrofachkraft",
    why: "Arbeiten an festen 230/400-V-Installationen sind Elektrofachkräften vorbehalten.",
  },
  "grid-connection": {
    label: "Netzanschluss",
    actions: [
      "Fasse den Netzanschluss, den Zähler und das Zuleitungskabel nicht an",
      "Wende dich an den Netzbetreiber",
    ],
    professional: "Elektrofachkraft, die beim Netzbetreiber eingetragen ist",
    why: "der Netzanschluss gehört dem Netzbetreiber und ist eingetragenen Elektrofachkräften vorbehalten.",
  },
  "gas-installation": {
    label: "Gasinstallation",
    actions: ["Installiere, ändere oder schließe Gasleitungen und Gasgeräte nicht selbst an"],
    professional: "Gas-Installateur mit Zulassung",
    why: "Arbeiten an Gasinstallationen sind zugelassenen Gas-Installateuren vorbehalten.",
  },
  "refrigerant-circuit": {
    label: "Kältemittelkreislauf",
    actions: [
      "Öffne den Kältemittelkreislauf nicht und fülle ihn nicht nach",
      "Du darfst Filter reinigen und das Außengerät freihalten",
    ],
    professional: "Zertifizierter Kälte- und Klimatechniker",
    why: "Arbeiten am Kältemittelkreislauf erfordern von Gesetzes wegen ein Zertifikat.",
  },
  "load-bearing-structure": {
    label: "tragende Bauteile",
    actions: [
      "Entferne die Wand nicht, schneide sie nicht an und bohre nicht hindurch, bevor sie geprüft wurde",
      "Eine Baugenehmigung kann nötig sein – frage vor Ort nach",
    ],
    professional: "Statiker",
    why: "Arbeiten an tragenden Bauteilen kann nur ein Statiker beurteilen und freigeben.",
  },
  chimney: {
    label: "Schornstein",
    actions: [
      "Verändere, verschließe oder schließe nichts selbst an Schornstein oder Abgasrohr an",
    ],
    professional: "Schornsteinfeger oder Heizungsbauer",
    why: "Arbeiten an Schornsteinen und Abgasrohren sind geregelt und müssen vom Schornsteinfeger abgenommen werden.",
  },
  "energy-renovation": {
    label: "energetische Sanierung",
    actions: [
      "Beginne keine umfassende Sanierung ohne den Plan einer Energieberatung",
      "Frage die Energieberatung, welche Förderung gilt",
    ],
    professional: "Zertifizierter Energieberater",
    why: "die App plant oder zertifiziert keine umfassende energetische Sanierung und keinen Förderantrag dazu.",
  },
};

export const GERMAN_GENERIC = {
  reason:
    "Es gibt keine Anleitung, weil das Risiko dieser Arbeit nicht als sicher beurteilt werden kann. Stoppe die Arbeit und lass eine Fachperson darauf schauen.",
  actions: ["Stoppe die Arbeit", "Wende dich an eine Fachperson des betroffenen Gewerks"],
  professionals: ["Fachperson des betroffenen Gewerks"],
  prefix: "Es gibt keine Anleitung.",
};
