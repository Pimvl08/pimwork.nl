"use client";

import { useCallback, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArchButton } from "@/components/ui/ArchButton";
import { cn } from "@/lib/cn";
import type { FillId } from "./stats";
import styles from "./data.module.css";

export { styles };

export function fillClass(fill: FillId): string {
  return styles[`fill-${fill}`] ?? styles["fill-solid"];
}

/**
 * Hatching and stipple patterns, defined once per page. Lives in a zero-size
 * SVG that is never display:none, so patterns keep rendering for every chart.
 */
export function FillDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <pattern id="pw-fill-hatch45" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <rect className={styles.patPaper} width="5" height="5" />
          <line className={styles.patInk} x1="1" y1="0" x2="1" y2="5" strokeWidth="1.6" />
        </pattern>
        <pattern id="pw-fill-hatch135" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(135)">
          <rect className={styles.patPaper} width="5" height="5" />
          <line className={styles.patInk} x1="1" y1="0" x2="1" y2="5" strokeWidth="1.6" />
        </pattern>
        <pattern id="pw-fill-cross" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect className={styles.patPaper} width="6" height="6" />
          <line className={styles.patInk} x1="1" y1="0" x2="1" y2="6" strokeWidth="1.1" />
          <line className={styles.patInk} x1="0" y1="1" x2="6" y2="1" strokeWidth="1.1" />
        </pattern>
        <pattern id="pw-fill-dots" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect className={styles.patPaper} width="4" height="4" />
          <circle className={styles.patDot} cx="2" cy="2" r="1.05" />
        </pattern>
      </defs>
    </svg>
  );
}

/** A small filled key beside a legend label: identity never rides on text colour. */
export function Swatch({ fill }: { fill: FillId }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true" focusable="false" className="shrink-0">
      <rect className={fillClass(fill)} x="0" y="1" width="22" height="12" rx="2" />
    </svg>
  );
}

export function Legend({ label, items }: { label: string; items: { key: string; node: ReactNode; text: string; value?: string }[] }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-x-6 gap-y-2 text-[length:var(--step--1)] text-ink-soft">
      {items.map((it) => (
        <li key={it.key} className="flex items-center gap-2">
          {it.node}
          <span className="italic">{it.text}</span>
          {it.value ? <span className="data text-ink-mute">{it.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** Shared hover and focus state: one active mark per chart. */
export function useActive<T extends string>() {
  const [active, setActive] = useState<T | null>(null);
  const bind = useCallback(
    (key: T) => ({
      tabIndex: 0,
      onPointerEnter: () => setActive(key),
      onPointerLeave: () => setActive((cur) => (cur === key ? null : cur)),
      onFocus: () => setActive(key),
      onBlur: () => setActive((cur) => (cur === key ? null : cur)),
      onKeyDown: (e: KeyboardEvent<SVGElement>) => {
        if (e.key === "Escape") {
          setActive(null);
          e.currentTarget.blur();
        }
      },
    }),
    [],
  );
  return { active, setActive, bind };
}

/** Tooltip anchored to a point in the chart, given in percent of its box. */
export function Tip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  const left = Math.min(86, Math.max(14, x));
  const below = y < 22;
  return (
    <div className={cn(styles.tip, below && styles.tipBelow)} style={{ left: `${left}%`, top: `${y}%` }} aria-hidden="true">
      {children}
    </div>
  );
}

export function TipRow({ label, value, swatch }: { label: string; value: string; swatch?: FillId }) {
  return (
    <div className={styles.tipRow}>
      <span className="flex items-center gap-1.5 italic">
        {swatch ? <Swatch fill={swatch} /> : null}
        {label}
      </span>
      <span className="data">{value}</span>
    </div>
  );
}

interface ChartFrameProps {
  title: string;
  guide: string;
  describe: string;
  showTable: string;
  hideTable: string;
  legend?: ReactNode;
  /** Render prop: receives the ids the chart's SVG should point at. */
  children: (ids: { titleId: string; descId: string }) => ReactNode;
  table: ReactNode;
  footnote?: ReactNode;
  className?: string;
}

/** Title, one-line reading guide, legend, chart, and a real table behind a toggle. */
export function ChartFrame({ title, guide, describe, showTable, hideTable, legend, children, table, footnote, className }: ChartFrameProps) {
  const uid = useId();
  const titleId = `${uid}-t`;
  const descId = `${uid}-d`;
  const tableId = `${uid}-table`;
  const [open, setOpen] = useState(false);
  return (
    <figure className={cn("flex flex-col gap-5", className)} aria-labelledby={titleId}>
      <div className="flex flex-col gap-2">
        <h3 id={titleId} className="text-[length:var(--step-2)] italic leading-tight text-ink">
          {title}
        </h3>
        <p className="measure text-ink-soft">{guide}</p>
        <p id={descId} className="sr-only">
          {describe}
        </p>
      </div>
      {legend}
      <div className="relative">{children({ titleId, descId })}</div>
      {footnote}
      <div className="flex flex-col gap-4">
        <div>
          <ArchButton
            variant="secondary"
            icon={open ? "minus" : "plus"}
            aria-expanded={open}
            aria-controls={tableId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? hideTable : showTable}
          </ArchButton>
        </div>
        <div id={tableId} hidden={!open} className={styles.tableWrap}>
          {table}
        </div>
      </div>
    </figure>
  );
}
