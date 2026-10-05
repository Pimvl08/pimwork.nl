"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { projects, statusLabel, type Project } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { aboutCopy } from "./copy";
import {
  arcPath,
  axisT,
  formatPeriod,
  monthAxis,
  packLanes,
  periodDays,
  polar,
  spanOf,
  tToDeg,
} from "./logic";
import styles from "./about.module.css";

/* Geometry of the compass, in viewBox units. */
const W = 1100;
const H = 520;
const CX = 560;
const CY = 468;
const R = 400;
const LANE = 62;
const AXIS = monthAxis("2026-03", "2026-10");

interface Placed {
  project: Project;
  lane: number;
  r: number;
  degFrom: number;
  degTo: number;
  degMid: number;
  single: boolean;
}

function place(): Placed[] {
  const spans = projects.map((p) => spanOf(p.slug, p.period));
  const lanes = packLanes(spans, 8);
  return projects
    .map((project, i) => {
      const span = spans[i];
      const lane = lanes[project.slug] ?? 0;
      const degFrom = tToDeg(axisT(AXIS, span.from));
      const degTo = tToDeg(axisT(AXIS, span.to));
      return {
        project,
        lane,
        r: R - lane * LANE,
        degFrom,
        degTo,
        degMid: (degFrom + degTo) / 2,
        single: span.to - span.from === 1,
      };
    })
    .sort((a, b) => b.degMid - a.degMid);
}

function months() {
  const list: { index: number; from: number; to: number }[] = [];
  for (let m = 2; m <= 9; m += 1) {
    const a = monthAxis(`2026-${String(m + 1).padStart(2, "0")}`, `2026-${String(m + 1).padStart(2, "0")}`);
    list.push({ index: m, from: tToDeg(axisT(AXIS, a.start)), to: tToDeg(axisT(AXIS, a.end)) });
  }
  return list;
}

const PLACED = place();
const MONTHS = months();

function labelAnchor(deg: number, outside: boolean): { anchor: "start" | "middle" | "end"; dx: number; dy: number } {
  if (deg > 104) return { anchor: outside ? "end" : "start", dx: outside ? -4 : 4, dy: 0 };
  if (deg < 76) return { anchor: outside ? "start" : "end", dx: outside ? 4 : -4, dy: 0 };
  return { anchor: "middle", dx: 0, dy: outside ? -10 : 14 };
}

/**
 * Plate 01 timeline: a compass arc from March to October 2026 with every
 * project on its real period. A dot is a single day, an arc segment a range.
 * Hover or focus swings the compass arm to the project and fills the readout.
 * Below 1024px the same data runs down a curved rule as a list.
 */
export function Timeline({ lang }: { lang: Locale }) {
  const t = aboutCopy.timeline;
  const router = useRouter();
  const placed = PLACED;
  const monthList = MONTHS;
  const [active, setActive] = useState<string | null>(null);
  const current = placed.find((p) => p.project.slug === active) ?? null;

  const describe = (project: Project) => {
    const days = periodDays(project.period);
    return {
      period: formatPeriod(project.period, t.months[lang], t.until[lang]),
      days: `${days} ${days === 1 ? t.day[lang] : t.days[lang]}`,
    };
  };

  const go = (event: MouseEvent<Element>, href: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(href);
  };

  return (
    <div>
      {/* Desktop: the compass. */}
      <div className="hidden lg:block">
        <svg
          className={styles.compass}
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={t.figure[lang]}
          onPointerLeave={() => setActive(null)}
        >

          <g aria-hidden="true">
            <line x1={CX - R - 40} y1={CY} x2={CX + R + 40} y2={CY} className={styles.tick} />
            {Array.from({ length: placed.reduce((n, p) => Math.max(n, p.lane), 0) }, (_, i) => (
              <path key={i} d={arcPath(CX, CY, R - (i + 1) * LANE, 180, 0)} className={styles.lane} />
            ))}
            <path d={arcPath(CX, CY, R, 180, 0)} className={`${styles.axis} arc-draw`} pathLength={1} />
            {monthList.map((m) => {
              const a = polar(CX, CY, R - 7, m.from);
              const b = polar(CX, CY, R + 7, m.from);
              const label = polar(CX, CY, R - 26, (m.from + m.to) / 2);
              return (
                <g key={m.index}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.tick} />
                  <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className={styles.monthLabel}>
                    {t.monthsShort[lang][m.index]}
                  </text>
                </g>
              );
            })}
            {(() => {
              const a = polar(CX, CY, R - 7, 0);
              const b = polar(CX, CY, R + 7, 0);
              return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.tick} />;
            })()}
            <text x={CX - R} y={CY + 28} textAnchor="middle" className={styles.endLabel}>
              1 {t.monthsShort[lang][2]} 2026
            </text>
            <text x={CX + R} y={CY + 28} textAnchor="middle" className={styles.endLabel}>
              31 {t.monthsShort[lang][9]} 2026
            </text>
            <g
              className={styles.arm}
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: `rotate(${-(current?.degMid ?? 90)}deg)`,
                opacity: current ? 1 : 0,
              }}
            >
              <line x1={CX + 10} y1={CY} x2={CX + R + 14} y2={CY} strokeDasharray="1 5" />
            </g>
            <circle cx={CX} cy={CY} r={3.5} className={styles.pivot} />
            <circle cx={CX} cy={CY} r={9} className={styles.lane} style={{ strokeDasharray: "none" }} />
          </g>

          {placed.map((p) => {
            const href = `/${lang}/werk/${p.project.slug}`;
            const d = describe(p.project);
            const mid = polar(CX, CY, p.r, p.degMid);
            const outside = p.lane === 0;
            const labelPoint = polar(CX, CY, outside ? p.r + 30 : p.r - 28, p.degMid);
            const anchor = labelAnchor(p.degMid, outside);
            const isActive = active === p.project.slug;
            return (
              <a
                key={p.project.slug}
                href={href}
                className={styles.marker}
                data-cursor="view"
                data-active={isActive || undefined}
                aria-label={`${p.project.name}, ${p.project.category[lang]}, ${d.period}`}
                onPointerEnter={() => setActive(p.project.slug)}
                onFocus={() => setActive(p.project.slug)}
                onBlur={() => setActive((s) => (s === p.project.slug ? null : s))}
                onClick={(event) => go(event, href)}
              >
                <circle cx={mid.x} cy={mid.y} r={27} className={styles.hit} />
                {p.single ? (
                  <circle cx={mid.x} cy={mid.y} r={isActive ? 6.5 : 5.5} className={styles.dot} />
                ) : (
                  <path d={arcPath(CX, CY, p.r, p.degFrom, p.degTo)} className={styles.seg} />
                )}
                <circle cx={mid.x} cy={mid.y} r={13} className={styles.ring2} />
                <text
                  x={labelPoint.x + anchor.dx}
                  y={labelPoint.y + anchor.dy}
                  textAnchor={anchor.anchor}
                  dominantBaseline="middle"
                  className={styles.name}
                >
                  {p.project.name}
                </text>
              </a>
            );
          })}
        </svg>

        <div className={`${styles.readout} mx-auto -mt-1 max-w-[34rem] text-center`}>
          {current ? (
            <>
              <span className="block text-[length:var(--step-2)] italic leading-tight text-ink">{current.project.name}</span>
              <span className="mt-1 block text-ink-soft">{current.project.category[lang]}</span>
              <span className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-3 text-ink-mute">
                <span className="data">
                  {describe(current.project).period} · {describe(current.project).days}
                </span>
                <span className="label">{statusLabel[current.project.status][lang]}</span>
              </span>
            </>
          ) : (
            <span className="block pt-3 italic text-ink-mute">{t.idle[lang]}</span>
          )}
        </div>
      </div>

      {/* Phone and tablet: a list down a curved rule. */}
      <TimelineList lang={lang} placed={[...placed].sort((a, b) => a.project.period.from.localeCompare(b.project.period.from))} describe={describe} />
    </div>
  );
}

/** x of the curved rule (quadratic, 36 to 6 to 36 over the height) at fraction t. */
function ruleX(t: number): number {
  const u = 1 - t;
  return u * u * 36 + 2 * u * t * 6 + t * t * 36;
}

function TimelineList({
  lang,
  placed,
  describe,
}: {
  lang: Locale;
  placed: Placed[];
  describe: (p: Project) => { period: string; days: string };
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [xs, setXs] = useState<number[] | null>(null);

  // Put every dot exactly on the curve once real item positions are known.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const height = list.offsetHeight;
      if (!height) return;
      const next = Array.from(list.children).map((child) => {
        const el = child as HTMLElement;
        return ruleX(Math.min(1, (el.offsetTop + 22) / height));
      });
      setXs((prev) => (prev && prev.every((x, i) => Math.abs(x - next[i]) < 0.5) ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative lg:hidden">
      <svg className={styles.listRule} viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 36 0 Q 6 500 36 1000" fill="none" stroke="currentColor" strokeWidth={1} pathLength={1} className="arc-draw" />
      </svg>
      <ol ref={listRef} className={styles.list}>
      {placed.map((p, i) => {
        const d = describe(p.project);
        const x = xs?.[i] ?? ruleX((i + 0.3) / placed.length);
        return (
          <li key={p.project.slug} className={`${styles.listItem} relative pb-6`}>
            <span
              className={styles.listDot}
              data-range={!p.single || undefined}
              style={{ left: `calc(${x}px - 3.25rem)` }}
              aria-hidden="true"
            />
            <Link href={`/${lang}/werk/${p.project.slug}`} data-cursor="link" className="inline-flex min-h-11 items-center text-[length:var(--step-1)] italic text-ink no-underline hover:underline">
              {p.project.name}
            </Link>
            <span className="block text-[length:var(--step--1)] text-ink-soft">{p.project.category[lang]}</span>
            <span className="data mt-0.5 block text-[0.72rem] text-ink-mute">
              {d.period} · {d.days}
            </span>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
