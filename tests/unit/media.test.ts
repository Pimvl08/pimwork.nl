import { describe, expect, it } from "vitest";
import {
  formatTime,
  playerKeyAction,
  shortCaption,
  sliderKeyTarget,
  swipeStep,
  timeFromPointer,
  wrapIndex,
} from "@/components/media/logic";
import { images, imagesFor, videoFor, videos } from "@/content/media";
import { projects } from "@/content/projects";

describe("media logic", () => {
  it("formats times", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(14.7)).toBe("0:14");
    expect(formatTime(75)).toBe("1:15");
    expect(formatTime(3725)).toBe("1:02:05");
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(-3)).toBe("0:00");
  });

  it("wraps indices both ways", () => {
    expect(wrapIndex(0, -1, 5)).toBe(4);
    expect(wrapIndex(4, 1, 5)).toBe(0);
    expect(wrapIndex(2, 7, 5)).toBe(4);
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });

  it("maps pointer position to time and clamps", () => {
    expect(timeFromPointer(150, 100, 200, 20)).toBe(5);
    expect(timeFromPointer(50, 100, 200, 20)).toBe(0);
    expect(timeFromPointer(999, 100, 200, 20)).toBe(20);
    expect(timeFromPointer(150, 100, 0, 20)).toBe(0);
  });

  it("seeks with slider keys by 5 seconds and clamps", () => {
    expect(sliderKeyTarget("ArrowRight", 3, 14)).toBe(8);
    expect(sliderKeyTarget("ArrowLeft", 3, 14)).toBe(0);
    expect(sliderKeyTarget("ArrowUp", 12, 14)).toBe(14);
    expect(sliderKeyTarget("Home", 7, 14)).toBe(0);
    expect(sliderKeyTarget("End", 7, 14)).toBe(14);
    expect(sliderKeyTarget("a", 7, 14)).toBeNull();
    expect(sliderKeyTarget("ArrowRight", 0, 0)).toBeNull();
  });

  it("maps player shortcuts", () => {
    expect(playerKeyAction(" ")).toBe("toggle");
    expect(playerKeyAction("K")).toBe("toggle");
    expect(playerKeyAction("f")).toBe("fullscreen");
    expect(playerKeyAction("m")).toBe("mute");
    expect(playerKeyAction("j")).toBe("back");
    expect(playerKeyAction("l")).toBe("forward");
    expect(playerKeyAction("Enter")).toBeNull();
  });

  it("detects horizontal swipes only", () => {
    expect(swipeStep(-80, 4)).toBe(1);
    expect(swipeStep(80, 4)).toBe(-1);
    expect(swipeStep(30, 0)).toBe(0);
    expect(swipeStep(60, 90)).toBe(0);
  });

  it("shortens alt text to its first clause", () => {
    expect(shortCaption("Inlogscherm van Strength Tracker: een oranje logo")).toBe("Inlogscherm van Strength Tracker");
    expect(shortCaption("Zonder dubbelepunt")).toBe("Zonder dubbelepunt");
  });
});

describe("media content", () => {
  const slugs = new Set(projects.map((project) => project.slug));
  const banned = /[\u2013\u2014]/;

  it("has complete, bilingual, honest entries", () => {
    for (const image of images) {
      expect(image.src.startsWith("/media/")).toBe(true);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(image.width).toBeLessThanOrEqual(2000);
      expect(image.alt.nl.length).toBeGreaterThan(20);
      expect(image.alt.en.length).toBeGreaterThan(20);
      expect(image.provenance.length).toBeGreaterThan(10);
      expect(image.blurDataURL?.startsWith("data:image/")).toBe(true);
      expect(banned.test(image.alt.nl + image.alt.en + image.provenance)).toBe(false);
      if (image.project) expect(slugs.has(image.project)).toBe(true);
    }
    for (const video of videos) {
      expect(video.sources.length).toBeGreaterThan(0);
      expect(video.durationSeconds).toBeGreaterThanOrEqual(12);
      expect(video.durationSeconds).toBeLessThanOrEqual(16);
      expect(banned.test(video.title.nl + video.title.en + video.description.nl + video.description.en)).toBe(false);
      if (video.project) expect(slugs.has(video.project)).toBe(true);
    }
  });

  it("only holds media of projects that are still on the site", () => {
    for (const item of [...images, ...videos]) {
      expect(item.project === undefined || slugs.has(item.project)).toBe(true);
      expect("src" in item ? item.src : item.poster).not.toMatch(/capcraft|paletteforge/);
    }
  });

  it("never includes the private projects", () => {
    const privateSlugs = ["teamsync", "belhulp", "solana-forensics"];
    for (const slug of privateSlugs) {
      expect(imagesFor(slug)).toHaveLength(0);
      expect(videoFor(slug)).toBeUndefined();
    }
  });
});
