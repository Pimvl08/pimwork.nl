import type { Locale } from "@/i18n/config";

/**
 * Contract every Lab experiment implements. The Lab plate mounts an
 * experiment only when it scrolls near the viewport, and passes `active`
 * so animation loops can pause when it is off screen or hidden.
 */
export interface ExperimentProps {
  lang: Locale;
  /** False when the experiment is off screen: stop requestAnimationFrame. */
  active: boolean;
  /** Visitor prefers reduced motion: render a calm, static or step-wise version. */
  reducedMotion: boolean;
}
