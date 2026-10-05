import { HeroActions } from "@/components/hero/HeroActions";
import { HeroParallax } from "@/components/hero/HeroParallax";
import { IntroLine } from "@/components/hero/IntroLine";
import { ShellStage } from "@/components/hero/ShellStage";
import { shellSilhouette, STAGE_ASPECT } from "@/components/hero/camera";
import { heroCopy, introLine2, introPhrases, LAB_EXPERIMENT_COUNT } from "@/components/hero/copy";
import styles from "@/components/hero/hero.module.css";
import { ArcRule } from "@/components/ui/ArcRule";
import { person } from "@/content/person";
import { getProject, projects } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/** One compass arc from the top centre, sweeping down through the name. */
const COVER_ARC = "M480 -10 A1150 1150 0 0 0 20 1010";
const COVER_ARC_NARROW = "M1010 40 A1300 1300 0 0 1 560 1010";

/** The resting outline of the shell, computed once per server process. */
const silhouette = shellSilhouette(STAGE_ASPECT);

/**
 * Plate 00, the cover. "Pim" is server rendered (the LCP element, no JS
 * needed to see it); the intro line, actions and the live shell hydrate
 * on top of complete HTML.
 */
export function HeroPlate({ lang }: { lang: Locale }) {
  const projectNames = Object.fromEntries(
    introPhrases.map((phrase) => [phrase.slug, getProject(phrase.slug)?.name ?? ""]).filter(([, name]) => name),
  );
  const lines = {
    line1: heroCopy.intro.line1[lang],
    line2: introLine2(projects.length, LAB_EXPERIMENT_COUNT, lang),
  };

  return (
    <section id="cover" className={cn("plate", styles.cover)} aria-labelledby="cover-title">
      <div className={styles.arcLayer} data-depth="-10">
        <ArcRule className={cn("inset-0 hidden h-full w-full lg:block", styles.arc)} d={COVER_ARC} />
        {/* Single column: the arc keeps to the right edge so it never crosses the copy or the buttons. */}
        <ArcRule className={cn("inset-0 h-full w-full lg:hidden", styles.arc)} d={COVER_ARC_NARROW} />
      </div>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h1 id="cover-title" className={styles.name} data-depth="5">
            {person.name}
          </h1>
          <IntroLine lang={lang} name={person.name} projectNames={projectNames} />
          <HeroActions lang={lang} lines={lines} />
        </div>
        <div className={styles.visual}>
          <p className="sr-only">{heroCopy.shellDescription[lang]}</p>
          <ShellStage lang={lang} silhouette={silhouette} />
        </div>
      </div>
      <HeroParallax />
    </section>
  );
}
