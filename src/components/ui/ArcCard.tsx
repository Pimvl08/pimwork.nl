import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A card whose top edge is a shallow compass arc, as on the quality board.
 * The outline is drawn in SVG so the arc stays crisp at every width.
 */
export function ArcCard({ children, className, active = false }: { children: ReactNode; className?: string; active?: boolean }) {
  return (
    <div className={cn("group/arc relative isolate", className)} data-active={active || undefined}>
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0.5 299.5 V22 Q200 -10 399.5 22 V299.5 Z"
          className="fill-[var(--paper-raised)] stroke-[var(--rule-strong)] transition-[fill,stroke] duration-300 group-hover/arc:stroke-[var(--ink)] group-data-[active]/arc:stroke-[var(--ink)]"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {children}
    </div>
  );
}
