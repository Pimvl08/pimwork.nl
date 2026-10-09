import type { ReactNode } from "react";
import styles from "./work.module.css";

const ARCH = "M0 23 Q500 1 1000 23";

/** Slightly arched hairline above every numbered item. */
export function FigureRule() {
  return (
    <svg viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={ARCH} className={styles.rule} />
    </svg>
  );
}

/** A titled block of a detail page: the title in a narrow column beside the body on wide screens. */
export function Section({ id, title, as: H, children }: { id: string; title: string; as: "h2" | "h3"; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <H id={id} className={styles.sectionTitle}>
        {title}
      </H>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
