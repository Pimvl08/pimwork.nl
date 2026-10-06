import type { SVGProps } from "react";

/**
 * Authored icon set: 24px grid, 1.25 stroke, round caps. One family for the
 * whole site; no emoji or unicode glyphs stand in for icons.
 */
const paths = {
  arrowNE: "M7 17 17 7M9 7h8v8",
  arrowSE: "M7 7l10 10M17 9v8H9",
  arrowRight: "M4 12h15M13 6l6 6-6 6",
  arrowLeft: "M20 12H5M11 6l-6 6 6 6",
  arrowDown: "M12 4v15M6 13l6 6 6-6",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  sun: "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  moon: "M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3.5 9h17M3.5 15h17M12 3c-2.6 2.6-3.6 5.6-3.6 9s1 6.4 3.6 9M12 3c2.6 2.6 3.6 5.6 3.6 9s-1 6.4-3.6 9",
  terminal: "M4 5.5h16v13H4zM7.5 10l2.5 2-2.5 2M12.5 14.5h4",
  play: "M8 5.5v13l10.5-6.5L8 5.5Z",
  pause: "M8.5 5.5v13M15.5 5.5v13",
  fullscreen: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  exitFullscreen: "M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5",
  volume: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
  mute: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5",
  github:
    "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  chevronLeft: "M15 5l-7 7 7 7",
  chevronRight: "M9 5l7 7-7 7",
  download: "M12 4v11M7 10l5 5 5-5M5 19.5h14",
  reset: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4",
  phone: "M7.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 5.5 5.5a2 2 0 0 1 2-2Z",
  mail: "M3.5 6h17v12h-17zM3.5 6.5l8.5 6.5 8.5-6.5",
  command: "M9 9h6v6H9zM9 9V7a2 2 0 1 0-2 2h2ZM15 9V7a2 2 0 1 1 2 2h-2ZM9 15v2a2 2 0 1 1-2-2h2ZM15 15v2a2 2 0 1 0 2-2h-2Z",
  keyboard: "M3 6.5h18v11H3zM6.5 10h1M10 10h1M13.5 10h1M17 10h.5M6.5 13.5h.5M9.5 13.5h5M17 13.5h.5",
  crease: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM5.5 18.2C9 15.5 13.8 9.8 15.2 3.6",
  pin: "M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11ZM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  shuffle: "M4 7h3.5c4.5 0 4.5 10 9 10H20M4 17h3.5c1.6 0 2.6-1.3 3.4-3M14 10c.8-1.7 1.8-3 3.5-3H20M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5",
  lock: "M6.5 10.5h11v9h-11zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5",
  unlock: "M6.5 10.5h11v9h-11zM8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2",
} as const;

export type IconName = keyof typeof paths;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number | string;
  /** Accessible name. Without it the icon is decorative and hidden. */
  title?: string;
}

export function Icon({ name, size = 20, title, strokeWidth = 1.25, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={paths[name]} />
    </svg>
  );
}
