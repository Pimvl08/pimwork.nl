import { cn } from "@/lib/cn";

interface ArcRuleProps {
  /** SVG path in a 0..1000 x 0..1000 box. Defaults to one sweeping compass arc. */
  d?: string;
  className?: string;
  /** Draws the arc in when it scrolls into view (CSS only, no JS). */
  draw?: boolean;
  strokeWidth?: number;
}

/**
 * A hairline compass arc crossing the layout. Purely decorative, so it is
 * hidden from assistive tech and never catches pointer events.
 */
export function ArcRule({ d = "M-20 980 A 1100 1100 0 0 1 1020 120", className, draw = false, strokeWidth = 1 }: ArcRuleProps) {
  return (
    <svg
      className={cn("pointer-events-none absolute overflow-visible text-rule-strong", className)}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        className={draw ? "arc-draw" : undefined}
      />
    </svg>
  );
}
