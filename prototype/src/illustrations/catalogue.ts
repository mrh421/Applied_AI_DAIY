import type { Illustration } from "./index";

export const CATALOGUE: readonly Illustration[] = [
  {
    id: "water-shut-off-valve",
    topic: "Shutting off the water supply at the stop valve",
    src: "/illustrations/water-shut-off-valve.svg",
    alt: "A stop valve on a pipe with a curved arrow showing the handle turned a quarter turn clockwise until it is closed.",
  },
  {
    id: "unplug-device",
    topic: "Unplugging a device from the wall socket before opening it",
    src: "/illustrations/unplug-device.svg",
    alt: "A plug pulled out of a wall socket by its plug body, not by the cable.",
  },
  {
    id: "screw-types",
    topic: "Common screw head types: slotted, Phillips and Torx",
    src: "/illustrations/screw-types.svg",
    alt: "Three screw heads side by side, seen from above: one with a single slot, one with a cross, one with a six-pointed star.",
  },
];
