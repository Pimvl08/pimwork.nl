import type { Bilingual } from "@/i18n/config";

export interface ExperimentCopy {
  name: string;
  /** Short kind, shown under the name on wide screens. */
  kind: string;
  question: string;
  /** How to interact, per input. */
  mouse: string;
  touch: string;
  keyboard: string;
  /** Text alternative for the canvas or WebGL scene. */
  alt: string;
}

export const labCopy = {
  title: { nl: "Lab", en: "Lab" } satisfies Bilingual<string>,
  lead: {
    nl: "Experimenten waarin ik uitprobeer wat er in een browser kan: deeltjes, 3D, natuurkunde, generatief ontwerp en typografie.",
    en: "Experiments where I try out what a browser can do: particles, 3D, physics, generative design and typography.",
  } satisfies Bilingual<string>,
  tablist: { nl: "Proeven", en: "Experiments" } satisfies Bilingual<string>,
  proef: { nl: "Proef", en: "Experiment" } satisfies Bilingual<string>,
  questionLabel: { nl: "De vraag", en: "The question" } satisfies Bilingual<string>,
  howLabel: { nl: "Zo werkt het", en: "How it works" } satisfies Bilingual<string>,
  inputs: {
    nl: { mouse: "Muis", touch: "Touch", keyboard: "Toetsenbord" },
    en: { mouse: "Mouse", touch: "Touch", keyboard: "Keyboard" },
  } satisfies Bilingual<{ mouse: string; touch: string; keyboard: string }>,
  fullscreen: { nl: "Volledig scherm", en: "Full screen" } satisfies Bilingual<string>,
  stageRole: { nl: "interactief vlak", en: "interactive stage" } satisfies Bilingual<string>,
  exitFullscreen: { nl: "Volledig scherm sluiten", en: "Exit full screen" } satisfies Bilingual<string>,
  loading: { nl: "Proef wordt geladen", en: "Loading experiment" } satisfies Bilingual<string>,
  waiting: { nl: "De proef start zodra je hier bent", en: "The experiment starts when you get here" } satisfies Bilingual<string>,
  experiments: {
    nl: [
      {
        name: "Grafietstof",
        kind: "Deeltjes",
        question: "Wat gebeurt er als een woord uit duizenden korrels grafiet bestaat en je erdoorheen veegt?",
        mouse: "Beweeg om het stof weg te duwen, klik voor een schokgolf, houd ingedrukt om alles te verzamelen.",
        touch: "Veeg over het woord, tik voor een schokgolf, houd je vinger stil om te verzamelen.",
        keyboard: "Pijltjes verplaatsen een cursor, spatie geeft een schokgolf. Kies of typ een woord onder het vlak.",
        alt: "Duizenden grafietkorrels die samen een woord vormen in cursieve Bodoni.",
      },
      {
        name: "De schaal in de hand",
        kind: "3D",
        question: "Wat gebeurt er als je een gevouwen papieren schaal oppakt en draait?",
        mouse: "Sleep om de schaal te draaien.",
        touch: "Sleep met een vinger om te draaien.",
        keyboard: "Focus de schaal: pijltjes draaien hem, plus en min zoomen.",
        alt: "Een driedimensionale schaal van gevouwen papier.",
      },
      {
        name: "Stapel",
        kind: "Natuurkunde",
        question: "Wat gebeurt er als papieren schijven met gewicht in een pot vallen en op elkaar blijven liggen?",
        mouse: "Sleep en gooi een schijf, klik ernaast om te duwen.",
        touch: "Sleep en gooi een schijf, tik ernaast om te duwen.",
        keyboard: "Focus de pot: pijltjes kantelen de zwaartekracht, spatie schudt.",
        alt: "Papieren schijven die door zwaartekracht op elkaar stapelen in een pot.",
      },
      {
        name: "Passerwerk",
        kind: "Generatief",
        question: "Wat gebeurt er als een passer zelf tekent, met alleen een getal als plan?",
        mouse: "Kies een nieuwe tekening, de dichtheid en de symmetrie. Bewaar wat je mooi vindt.",
        touch: "Dezelfde knoppen, met een tik.",
        keyboard: "Tab langs de knoppen, pijltjes voor de dichtheid.",
        alt: "Een tekening van passerbogen en cirkels met een enkele vouwlijn.",
      },
      {
        name: "Letters met massa",
        kind: "Typografie",
        question: "Wat gebeurt er als letters gewicht krijgen en reageren op hoe snel je beweegt?",
        mouse: "Kom dichtbij voor zwaardere letters, beweeg snel om ze te laten hellen.",
        touch: "Sleep met je vinger langs de letters. Scrollen rekt ze uit.",
        keyboard: "Focus de zin en gebruik de pijltjes om een cursor te bewegen.",
        alt: "De zin Vorm uit één lijn in Bodoni, letters die dikker worden bij de cursor.",
      },
    ],
    en: [
      {
        name: "Graphite dust",
        kind: "Particles",
        question: "What happens when a word is made of thousands of grains of graphite and you sweep through it?",
        mouse: "Move to push the dust away, click for a shockwave, press and hold to gather it all.",
        touch: "Swipe across the word, tap for a shockwave, hold your finger still to gather.",
        keyboard: "Arrow keys move a cursor, Space sends a shockwave. Pick or type a word below the stage.",
        alt: "Thousands of graphite grains forming a word in Bodoni italic.",
      },
      {
        name: "The shell in hand",
        kind: "3D",
        question: "What happens when you pick up a folded paper shell and turn it around?",
        mouse: "Drag to turn the shell.",
        touch: "Drag with one finger to turn it.",
        keyboard: "Focus the shell: arrow keys turn it, plus and minus zoom.",
        alt: "A three-dimensional shell of folded paper.",
      },
      {
        name: "Stack",
        kind: "Physics",
        question: "What happens when paper discs with weight fall into a jar and come to rest on each other?",
        mouse: "Drag and throw a disc, click beside one to push.",
        touch: "Drag and throw a disc, tap beside one to push.",
        keyboard: "Focus the jar: arrow keys tilt gravity, Space shakes it.",
        alt: "Paper discs stacking on each other under gravity in a jar.",
      },
      {
        name: "Compass work",
        kind: "Generative",
        question: "What happens when a compass draws on its own, with nothing but a number as its plan?",
        mouse: "Pick a new drawing, the density and the symmetry. Save the ones you like.",
        touch: "The same controls, with a tap.",
        keyboard: "Tab through the controls, arrow keys for the density.",
        alt: "A drawing of compass arcs and circles with a single fold line.",
      },
      {
        name: "Letters with mass",
        kind: "Typography",
        question: "What happens when letters gain weight and respond to how fast you move?",
        mouse: "Come close for heavier letters, move fast to make them lean.",
        touch: "Drag your finger along the letters. Scrolling stretches them.",
        keyboard: "Focus the phrase and use the arrow keys to move a cursor.",
        alt: "The phrase Form from one line in Bodoni, letters growing heavier near the cursor.",
      },
    ],
  } satisfies Bilingual<ExperimentCopy[]>,

  dust: {
    nl: { words: "Woord", custom: "Eigen woord", apply: "Toon dit woord", hint: "Letters en cijfers, maximaal 8", fallback: "Geen WebGL: het stof ligt stil.", stage: "Grafietstof, interactief vlak" },
    en: { words: "Word", custom: "Your own word", apply: "Show this word", hint: "Letters and digits, up to 8", fallback: "No WebGL: the dust lies still.", stage: "Graphite dust, interactive stage" },
  } satisfies Bilingual<Record<string, string>>,

  passer: {
    nl: { redraw: "Nieuwe tekening", density: "Dichtheid", symmetry: "Symmetrie", none: "Geen", mirror: "Spiegel", rotational: "Draai", png: "Bewaar PNG", svg: "Bewaar SVG", plate: "Plaat", drawing: "Passerwerk wordt getekend", done: "Tekening klaar" },
    en: { redraw: "New drawing", density: "Density", symmetry: "Symmetry", none: "None", mirror: "Mirror", rotational: "Rotate", png: "Save PNG", svg: "Save SVG", plate: "Plate", drawing: "Drawing in progress", done: "Drawing finished" },
  } satisfies Bilingual<Record<string, string>>,

  mass: {
    nl: { phrase: "Vorm uit één lijn", stage: "Letters met massa, interactief vlak" },
    en: { phrase: "Form from one line", stage: "Letters with mass, interactive stage" },
  } satisfies Bilingual<Record<string, string>>,
};

export const DUST_WORDS = ["Pim", "Lab", "Vorm"] as const;
