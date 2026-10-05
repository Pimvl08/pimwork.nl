"use client";

import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition, useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { ArcCard } from "@/components/ui/ArcCard";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks";
import { clampPreview } from "./lib";
import { morphClass, projectTransitionName } from "./transition";
import styles from "./work.module.css";

/** Must match the index-mode media query in work.module.css. */
const INDEX_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 56rem)";

export interface WorkRow {
  slug: string;
  href: string;
  numeral: string;
  name: string;
  category: string;
  year: string;
  period: string;
  status: string;
  short: string;
  stack: string[];
  /** Server-rendered decorative ProjectFigure for the preview and the card. */
  figure: ReactNode;
}

const ARCH = "M0 23 Q500 1 1000 23";

function ArchedRule({ className, ink = false }: { className?: string; ink?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={ARCH} className={styles.rule} />
      {ink ? <path d={ARCH} className={styles.ruleInk} /> : null}
    </svg>
  );
}

/**
 * The editorial index of plate 02. On a fine pointer each row opens on hover
 * or focus: a floating figure follows the pointer with lag, the name turns
 * from italic to roman and the details slide in. On touch the rows are
 * stacked arched cards with the figure inline.
 */
export function WorkIndex({ rows, cursorLabel, listLabel }: { rows: WorkRow[]; cursorLabel: string; listLabel: string }) {
  const pathname = usePathname() ?? "";
  const openSlug = /\/werk\/([^/?#]+)/.exec(pathname)?.[1] ?? null;
  const onIndex = openSlug === null;
  const indexMode = useMediaQuery(INDEX_QUERY, false);
  const reduce = useReducedMotion();

  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  // After a plate opened, figures stay unnamed until the visitor touches the
  // list again, so closing the sheet never pairs with a stale preview.
  const [dormant, setDormant] = useState(false);
  if (!onIndex && !dormant) setDormant(true);
  if (active !== null && active !== shown) setShown(active);

  const visible = indexMode && onIndex && !dormant && active !== null;
  const cardsNamed = !indexMode && onIndex && !dormant;

  const indexRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, row: -1, live: false });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 170, damping: 24, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 150, damping: 24, mass: 0.8 });
  const velocity = useVelocity(sx);
  const rotate = useSpring(useTransform(velocity, [-1800, 0, 1800], [-7, 0, 7], { clamp: true }), { stiffness: 220, damping: 30 });
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const stx = useSpring(tiltX, { stiffness: 120, damping: 20 });
  const sty = useSpring(tiltY, { stiffness: 120, damping: 20 });
  const rotateY = useTransform(stx, [-1, 1], [-9, 9]);
  const rotateX = useTransform(sty, [-1, 1], [7, -7]);
  const imageX = useTransform(stx, [-1, 1], [12, -12]);
  const imageY = useTransform(sty, [-1, 1], [9, -9]);

  /** Places the preview just above the active row, following the pointer. */
  const place = useCallback(
    (clientX: number, clientY: number, rowIndex: number, jump: boolean) => {
      const box = indexRef.current?.getBoundingClientRect();
      const row = listRef.current?.children[rowIndex]?.getBoundingClientRect();
      const preview = previewRef.current;
      if (!box || !row || !preview) return;
      const w = preview.offsetWidth;
      const h = preview.offsetHeight;
      const rawX = clientX - box.left + 28;
      const rawY = row.top - box.top - h + 30 + (clientY - (row.top + row.height / 2)) * 0.25;
      const [px, py] = clampPreview(rawX, rawY, w, h, box.width, -h * 0.65, box.height);
      x.set(px);
      y.set(py);
      if (jump) {
        sx.jump(px);
        sy.jump(py);
      }
      const nx = (clientX - (row.left + row.width / 2)) / (row.width / 2);
      const ny = (clientY - (row.top + row.height / 2)) / (row.height / 2);
      tiltX.set(Math.max(-1, Math.min(1, nx)));
      tiltY.set(Math.max(-1, Math.min(1, ny)));
    },
    [x, y, sx, sy, tiltX, tiltY],
  );

  const rowFromTarget = (target: EventTarget | null): number => {
    const el = target instanceof Element ? target.closest<HTMLElement>("[data-row]") : null;
    return el ? Number(el.dataset.index) : -1;
  };

  const onPointerMove = (event: PointerEvent<HTMLOListElement>) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const index = rowFromTarget(event.target);
    if (index < 0) return;
    if (dormant) setDormant(false);
    const fresh = !pointer.current.live || active === null;
    pointer.current = { x: event.clientX, y: event.clientY, row: index, live: true };
    if (index !== active) setActive(index);
    place(event.clientX, event.clientY, index, fresh);
  };

  const onPointerLeave = () => {
    pointer.current.live = false;
    setActive(null);
  };

  const onPointerDown = () => {
    if (dormant) setDormant(false);
  };

  const onRowFocus = (index: number) => (event: FocusEvent<HTMLAnchorElement>) => {
    if (!event.currentTarget.matches(":focus-visible")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (dormant) setDormant(false);
    setActive(index);
    pointer.current = { x: rect.left + rect.width * 0.5, y: rect.top + rect.height / 2, row: index, live: false };
    place(pointer.current.x, pointer.current.y, index, true);
  };

  const onRowBlur = (event: FocusEvent<HTMLAnchorElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && listRef.current?.contains(next)) return;
    if (!pointer.current.live) setActive(null);
  };

  // Rows move under a still pointer while the page scrolls: follow along.
  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      const p = pointer.current;
      if (!p.live) return;
      const under = document.elementFromPoint(p.x, p.y);
      const index = under && listRef.current?.contains(under) ? rowFromTarget(under) : -1;
      if (index < 0) {
        p.live = false;
        setActive(null);
        return;
      }
      if (index !== p.row) {
        p.row = index;
        setActive(index);
      }
      place(p.x, p.y, index, false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible, place]);

  const current = shown !== null ? rows[shown] : null;

  return (
    <div ref={indexRef} className={styles.index}>
      <ArchedRule className={styles.topRule} />
      <ol
        ref={listRef}
        className={styles.list}
        aria-label={listLabel}
        data-has-active={visible || undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        {rows.map((row, i) => {
          const isActive = visible && active === i;
          return (
            <li key={row.slug} className={styles.item} data-row data-index={i}>
              <ArcCard className={styles.card} active={isActive}>
                <Link
                  href={row.href}
                  scroll={false}
                  className={styles.row}
                  data-active={isActive || undefined}
                  data-cursor="view"
                  data-cursor-label={cursorLabel}
                  onFocus={onRowFocus(i)}
                  onBlur={onRowBlur}
                >
                  <span className={styles.numeral} aria-hidden="true">
                    {row.numeral}
                  </span>
                  <div className={styles.main}>
                    <h3 className={styles.nameStack}>
                      <span className={styles.nameItalic}>{row.name}</span>
                      <span className={styles.nameRoman} aria-hidden="true">
                        {row.name}
                      </span>
                    </h3>
                    <p className={styles.short}>{row.short}</p>
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.category}>{row.category}</span>
                    <span className={styles.status}>
                      {row.year} · {row.status}
                    </span>
                    <span className={styles.more}>
                      <span className={styles.period}>{row.period}</span>
                      <span className={styles.stack}>{row.stack.join(" · ")}</span>
                    </span>
                  </div>
                  <div className={styles.inline}>
                    {cardsNamed ? (
                      <ViewTransition name={projectTransitionName(row.slug)} share={morphClass} default="none">
                        <div>{row.figure}</div>
                      </ViewTransition>
                    ) : (
                      <div>{row.figure}</div>
                    )}
                  </div>
                  <ArchedRule className={styles.hairline} ink />
                </Link>
              </ArcCard>
            </li>
          );
        })}
      </ol>

      {indexMode ? (
        <motion.div
          ref={previewRef}
          className={styles.preview}
          style={reduce ? { x, y } : { x: sx, y: sy, rotate }}
          aria-hidden="true"
        >
          <div className={styles.previewInner} data-visible={visible || undefined}>
            <motion.div className={styles.previewTilt} style={reduce ? undefined : { rotateX, rotateY }}>
              <motion.div className={styles.previewImage} style={reduce ? undefined : { x: imageX, y: imageY, scale: 1.08 }}>
                {current && visible ? (
                  <ViewTransition key={current.slug} name={projectTransitionName(current.slug)} share={morphClass} default="none">
                    <div className={styles.previewSwap}>{current.figure}</div>
                  </ViewTransition>
                ) : current ? (
                  <div>{current.figure}</div>
                ) : null}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
