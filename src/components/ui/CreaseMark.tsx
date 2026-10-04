import { useId } from "react";

/**
 * The mark: a paper disc with one curved crease, the folded flap shaded in
 * graphite. Used as logo, favicon source and loading symbol.
 */
export function CreaseMark({ size = 32, className, title }: { size?: number; className?: string; title?: string }) {
  const gradient = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradient} x1="0.15" y1="0.2" x2="0.85" y2="0.9">
          <stop offset="0" stopColor="var(--shade-1)" />
          <stop offset="0.55" stopColor="var(--shade-2)" />
          <stop offset="1" stopColor="var(--shade-3)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="var(--paper-raised)" stroke="var(--ink)" strokeWidth="1.25" />
      <path d="M12 52 C 22 44 36 26 42 4.5 A 29 29 0 0 1 12 52 Z" fill={`url(#${gradient})`} opacity="0.9" />
      <path d="M12 52 C 22 44 36 26 42 4.5" fill="none" stroke="var(--ink)" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
