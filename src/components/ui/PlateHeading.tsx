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

/** The heading face from globals.css, for the row that holds the numeral and the heading. */
const headingFace = { fontFamily: "var(--font-serif)", fontVariationSettings: '"opsz" 18', fontWeight: 500 } as const;

/**
 * Plate heading: the plate numeral sits in front of the heading, the way a
 * geometer numbers figures. It stays outside the heading element, so the
 * heading text is only the name. The optional lead follows below.
 */
export function PlateHeading({ numeral, children, id, as: Tag = "h2", className, lead }: PlateHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-baseline gap-[0.35em] text-[length:var(--step-4)]" style={headingFace}>
        <span className="numeral text-[0.38em] text-ink-mute" aria-hidden="true">
          {numeral}
        </span>
        <Tag id={id}>{children}</Tag>
      </div>
      {lead ? <p className="measure font-serif text-[length:var(--step-1)] leading-snug text-ink-soft">{lead}</p> : null}
    </div>
  );
}
