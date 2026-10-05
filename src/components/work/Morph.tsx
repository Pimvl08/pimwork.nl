"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";
import { morphClass, projectTransitionName } from "./transition";

/**
 * Names a project figure for the shared-element morph, but only while no
 * project is open. Opening one unnames this copy in the same transition, so
 * React pairs it with the figure in the sheet instead of naming it twice.
 */
export function Morph({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const projectOpen = /\/werk\/[^/?#]+/.test(pathname);
  if (projectOpen) return <div className={className}>{children}</div>;
  return (
    <ViewTransition name={projectTransitionName(slug)} share={morphClass} default="none">
      <div className={className}>{children}</div>
    </ViewTransition>
  );
}
