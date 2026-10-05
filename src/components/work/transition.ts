import styles from "./work.module.css";

/**
 * Shared view transition identity of a project figure, used by the index
 * preview, the modal sheet and the project page so the figure morphs.
 */
export function projectTransitionName(slug: string): string {
  return `project-${slug}`;
}

/** Class handed to <ViewTransition share>; the morph is styled in work.module.css. */
export const morphClass: string = styles.morph;
