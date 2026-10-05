import type { Bilingual } from "@/i18n/config";

export interface MediaCopy {
  title: string;
  lead: string;
  galleryTitle: string;
  galleryNote: string;
  filterLabel: string;
  selection: string;
  view: string;
  emptyImages: string;
  videosTitle: string;
  videosNote: string;
  recordingsLabel: string;
  emptyVideos: string;
  absent: string;
  lightbox: {
    label: string;
    close: string;
    previous: string;
    next: string;
    counter: (index: number, total: number) => string;
    source: string;
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
    toProject: string;
    shortcuts: string;
    cursor: string;
    source: string;
    duration: string;
  };
}

export const mediaCopy: Bilingual<MediaCopy> = {
  nl: {
    title: "Beeld",
    lead: "Echte schermafbeeldingen en opnames van Pims eigen projecten, gemaakt van de apps zelf. Niets is nagebootst: bij elk beeld staat hoe het gemaakt is.",
    galleryTitle: "Schermen",
    galleryNote: "Een selectie per project; kies een project om alle beelden te zien. Klik een beeld voor de volledige weergave.",
    filterLabel: "Beelden filteren per project",
    selection: "Selectie",
    view: "Bekijk",
    emptyImages: "Beelden",
    videosTitle: "Opnames",
    videosNote: "Korte schermopnames zonder geluid. Kies een opname in de lijst.",
    recordingsLabel: "Schermopnames",
    emptyVideos: "Opnames",
    absent: "TeamSync, Belhulp en Solana Forensics staan hier bewust niet: hun schermen tonen privé- of campagnegegevens. Bij Werk staan schema's van die projecten.",
    lightbox: {
      label: "Beeldweergave",
      close: "Sluiten",
      previous: "Vorig beeld",
      next: "Volgend beeld",
      counter: (index, total) => `${index} / ${total}`,
      source: "Herkomst",
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
      toProject: "Naar het project",
      shortcuts: "Spatie of K speelt en pauzeert, J en L spoelen 5 seconden, M dempt, F voor volledig scherm.",
      cursor: "Speel",
      source: "Herkomst",
      duration: "Duur",
    },
  },
  en: {
    title: "Media",
    lead: "Real screenshots and recordings of Pim's own projects, taken from the apps themselves. Nothing is mocked up: every image says how it was made.",
    galleryTitle: "Screens",
    galleryNote: "A selection per project; pick a project to see all of its images. Click an image to see it in full.",
    filterLabel: "Filter images by project",
    selection: "Selection",
    view: "View",
    emptyImages: "Images",
    videosTitle: "Recordings",
    videosNote: "Short screen recordings without sound. Pick a recording from the list.",
    recordingsLabel: "Screen recordings",
    emptyVideos: "Recordings",
    absent: "TeamSync, Belhulp and Solana Forensics are left out on purpose: their screens show private or campaign data. The Work plate has diagrams of those projects.",
    lightbox: {
      label: "Image viewer",
      close: "Close",
      previous: "Previous image",
      next: "Next image",
      counter: (index, total) => `${index} / ${total}`,
      source: "Source",
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
      toProject: "Go to the project",
      shortcuts: "Space or K plays and pauses, J and L skip 5 seconds, M mutes, F for full screen.",
      cursor: "Play",
      source: "Source",
      duration: "Length",
    },
  },
};
