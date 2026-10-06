import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PlateHeadingProps {
  numeral: string;
  children: ReactNode;
  id?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** One sentence under the heading. Never a label above it. */
  lead?: ReactNode;
}

/**
 * Plate heading: the plate numeral sits inside the heading as part of its
 * name, the way a geometer numbers figures. The optional lead follows below.
 */
export function PlateHeading({ numeral, children, id, as: Tag = "h2", className, lead }: PlateHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Tag id={id} className="flex items-baseline gap-[0.35em] text-[length:var(--step-4)]">
        <span className="numeral text-[0.38em] text-ink-mute" aria-hidden="true">
          {numeral}
        </span>
        <span>{children}</span>
      </Tag>
      {lead ? <p className="measure font-serif text-[length:var(--step-1)] leading-snug text-ink-soft">{lead}</p> : null}
    </div>
  );
}
