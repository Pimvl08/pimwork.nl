import type { Bilingual } from "@/i18n/config";

export interface MediaCopy {
  /** Accessible name of the list of screenshots. */
  shots: string;
  /** Accessible name of a thumbnail button. */
  enlarge: (caption: string) => string;
  lightbox: {
    label: string;
    close: string;
    previous: string;
    next: string;
    counter: (index: number, total: number) => string;
    hint: string;
  };
  player: {
    region: (title: string) => string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    fullscreen: string;
    exitFullscreen: string;
    position: string;
    valueText: (current: string, total: string) => string;
    unavailable: string;
  };
}

export const mediaCopy: Bilingual<MediaCopy> = {
  nl: {
    shots: "Schermafbeeldingen",
    enlarge: (caption) => `Vergroot: ${caption}`,
    lightbox: {
      label: "Beeldweergave",
      close: "Sluiten",
      previous: "Vorig beeld",
      next: "Volgend beeld",
      counter: (index, total) => `${index} / ${total}`,
      hint: "Pijltjestoetsen bladeren, Esc sluit.",
    },
    player: {
      region: (title) => `Videospeler: ${title}`,
      play: "Afspelen",
      pause: "Pauzeren",
      mute: "Geluid uit",
      unmute: "Geluid aan",
      fullscreen: "Volledig scherm",
      exitFullscreen: "Volledig scherm verlaten",
      position: "Afspeelpositie",
      valueText: (current, total) => `${current} van ${total}`,
      unavailable: "Video niet beschikbaar",
    },
  },
  en: {
    shots: "Screenshots",
    enlarge: (caption) => `Enlarge: ${caption}`,
    lightbox: {
      label: "Image viewer",
      close: "Close",
      previous: "Previous image",
      next: "Next image",
      counter: (index, total) => `${index} / ${total}`,
      hint: "Arrow keys browse, Esc closes.",
    },
    player: {
      region: (title) => `Video player: ${title}`,
      play: "Play",
      pause: "Pause",
      mute: "Mute",
      unmute: "Unmute",
      fullscreen: "Full screen",
      exitFullscreen: "Exit full screen",
      position: "Playback position",
      valueText: (current, total) => `${current} of ${total}`,
      unavailable: "Video not available",
    },
  },
};
