import type { Bilingual } from "@/i18n/config";

export type ShellStateKey = "flat" | "curving" | "stable" | "buckled" | "reversed";

export const shellCopy = {
  surface: {
    nl: "Gevouwen papieren schaal in 3D. Pijltjes draaien, plus en min zoomen.",
    en: "Folded paper shell in 3D. Arrow keys turn it, plus and minus zoom.",
  },
  cursor: { nl: "Draai", en: "Turn" },
  bend: { nl: "Buigen", en: "Bend" },
  flip: { nl: "Omkeren", en: "Flip" },
  lock: { nl: "Vastzetten", en: "Hold still" },
  compare: { nl: "Vergelijk", en: "Compare" },
  wire: { nl: "Draadmodel", en: "Wireframe" },
  reset: { nl: "Reset camera", en: "Reset camera" },
  states: {
    flat: { nl: "Vlak", en: "Flat" },
    curving: { nl: "Buigend", en: "Curving" },
    stable: { nl: "Stabiel", en: "Stable" },
    buckled: { nl: "Geknikt", en: "Buckled" },
    reversed: { nl: "Omgekeerd", en: "Reversed" },
  } satisfies Record<ShellStateKey, Bilingual<string>>,
  stateNote: {
    flat: { nl: "plat vel, de vouw ligt nog stil", en: "a flat sheet, the crease is still at rest" },
    curving: { nl: "de flap komt omhoog en begint te krullen", en: "the flap lifts and starts to curl" },
    stable: { nl: "een stijve schaal die zichzelf draagt", en: "a stiff shell that carries itself" },
    buckled: { nl: "te ver gevouwen, de rand rolt om", en: "folded too far, the edge rolls over" },
    reversed: { nl: "de vouw springt naar de andere kant", en: "the crease snaps to the other side" },
  } satisfies Record<ShellStateKey, Bilingual<string>>,
  custom: { nl: "eigen stand", en: "custom pose" },
  up: { nl: "flap omhoog", en: "flap up" },
  down: { nl: "flap omgekeerd", en: "flap reversed" },
  locked: { nl: "vastgezet", en: "held still" },
  free: { nl: "ademt mee", en: "breathing" },
  wireOn: { nl: "draadmodel aan", en: "wireframe on" },
  noWebgl: {
    nl: "WebGL is niet beschikbaar in deze browser, dus de schaal blijft plat. De knoppen hieronder beschrijven wat je zou zien.",
    en: "WebGL is not available in this browser, so the shell stays flat. The controls below still describe what you would see.",
  },
} as const;

/** Sentence for the polite live region after a control change. */
export function describeShell(
  lang: "nl" | "en",
  s: { state: ShellStateKey | null; fold: number; side: 1 | -1; locked: boolean; wire: boolean },
): string {
  const c = shellCopy;
  const pose = s.state ? `${c.states[s.state][lang]}: ${c.stateNote[s.state][lang]}` : c.custom[lang];
  const pct = Math.round(s.fold * 100);
  const bend = lang === "nl" ? `buiging ${pct} procent` : `bend ${pct} percent`;
  const parts = [pose, bend, s.side === 1 ? c.up[lang] : c.down[lang], s.locked ? c.locked[lang] : c.free[lang]];
  if (s.wire) parts.push(c.wireOn[lang]);
  return `${parts.join(", ")}.`;
}
