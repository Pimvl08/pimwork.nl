"use client";

import type { ExperimentProps } from "./types";

/** Placeholder: replaced by the lab build. */
export default function PhysicsJar({ lang }: ExperimentProps) {
  return <p className="text-ink-mute">{lang === "nl" ? "Proef wordt geladen" : "Experiment loading"}</p>;
}
