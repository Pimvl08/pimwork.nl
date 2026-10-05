"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { dataCopy } from "./copy";
import type { NamedStats } from "./LinesChart";
import { ChartFrame, Tip, TipRow, styles, useActive } from "./parts";
import { arcPath, sectorPath, dotRadius, formatDay, formatInt, maxWeekCommits, monthTicks, polar, timelineRows, weeksBetween, type TimelineRow, type Week } from "./stats";

/** The window this plate looks at: Pim's working year so far. */
export const RANGE = { from: "2026-03-01", to: "2026-10-31" } as const;

/* Desktop arc geometry. */
const VB = { x: 0, y: 10, w: 1000, h: 442 };
const CX = 560;
const CY = 520;
const R_OUT = 480;
const STEP = 38;
const A_FROM = 150;
const A_TO = 30;

/* Phone strips. */
const M_W = 340;
const M_ROW = 62;
const M_TOP = 30;

export function TimelineChart({ lang, rows: input }: { lang: Locale; rows: NamedStats[] }) {
  const c = dataCopy[lang];
  const t = c.timeline;
  const { active, bind } = useActive<string>();
  const weeks = weeksBetween(RANGE.from, RANGE.to);
  const W = weeks.length;
  const names = new Map(input.map((r) => [r.slug, r.name]));
  const rows = timelineRows(
    input.map((r) => r.stats),
    weeks,
  );
  const max = maxWeekCommits(rows);
  const months = monthTicks(weeks).filter((m) => m.year === 2026 && m.month >= 2 && m.month <= 9);
  const angle = (pos: number) => A_FROM - (pos / W) * (A_FROM - A_TO);
  const radius = (i: number) => R_OUT - i * STEP;
  const mx = (pos: number) => (pos / W) * M_W;
  const mh = M_TOP + rows.length * M_ROW + 8;
  const monthName = (m: number) => t.months[m];

  const day = (iso: string | null) => (iso ? formatDay(iso, lang, false) : "");
  const weekLabel = (wk: Week) => t.weekOf(day(wk.start));
  const commitsText = (n: number) => t.commitsN(formatInt(n, lang), n === 1);

  // Keys: "<slug>|<week key>" for a dot, "<slug>|band" for a file-dated band.
  const [aSlug, aPart] = active ? active.split("|") : [null, null];
  const aRowIndex = rows.findIndex((r) => r.slug === aSlug);
  const aRow = aRowIndex >= 0 ? rows[aRowIndex] : null;
  let tip: { desk: { x: number; y: number }; phone: { x: number; y: number }; body: ReactNode } | null = null;
  if (aRow && aPart) {
    const name = names.get(aRow.slug) ?? aRow.slug;
    if (aPart === "band" && aRow.band) {
      const mid = (aRow.band.from + aRow.band.to) / 2;
      const [x, y] = polar(CX, CY, radius(aRowIndex), angle(mid));
      tip = {
        desk: { x: ((x - VB.x) / VB.w) * 100, y: ((y - VB.y) / VB.h) * 100 },
        phone: { x: (mx(mid) / M_W) * 100, y: ((M_TOP + aRowIndex * M_ROW + 36) / mh) * 100 },
        body: (
          <>
            <p className="italic text-ink">{name}</p>
            <p className="text-ink-soft">{t.filesSpan(day(aRow.firstDate), day(aRow.lastDate))}</p>
          </>
        ),
      };
    } else {
      const wkc = aRow.commits.find((x) => x.key === aPart);
      if (wkc) {
        const [x, y] = polar(CX, CY, radius(aRowIndex), angle(wkc.index + 0.5));
        tip = {
          desk: { x: ((x - VB.x) / VB.w) * 100, y: ((y - VB.y) / VB.h) * 100 },
          phone: { x: (mx(wkc.index + 0.5) / M_W) * 100, y: ((M_TOP + aRowIndex * M_ROW + 36) / mh) * 100 },
          body: (
            <>
              <p className="italic text-ink">{name}</p>
              <TipRow label={weekLabel(weeks[wkc.index])} value={commitsText(wkc.n)} />
              <TipRow label={t.total} value={commitsText(aRow.totalCommits)} />
            </>
          ),
        };
      }
    }
  }

  const dimFor = (slug: string) => aSlug !== null && aSlug !== slug;

  const dotLabel = (r: TimelineRow, wk: { index: number; n: number }) =>
    `${names.get(r.slug)}, ${weekLabel(weeks[wk.index])}: ${commitsText(wk.n)}.`;
  const bandLabel = (r: TimelineRow) => `${names.get(r.slug)}: ${t.filesSpan(day(r.firstDate), day(r.lastDate))}.`;

  const table = (
    <table className={styles.table}>
      <caption>{t.title}</caption>
      <thead>
        <tr>
          <th scope="col">{t.project}</th>
          <th scope="col">{t.source}</th>
          <th scope="col">{t.weeks}</th>
          <th scope="col" className={styles.r}>
            {t.commits}
          </th>
          <th scope="col">{t.period}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.slug}>
            <th scope="row">{names.get(r.slug)}</th>
            <td>{r.dateSource === "git" ? t.sourceGit : t.sourceFiles}</td>
            <td>
              {r.dateSource === "git" ? (
                <span className="data">
                  {r.commits.map((x) => `${x.key.slice(5)}: ${x.n}`).join(", ")}
                  {r.commitsOutside > 0 ? ` (${t.outside(formatInt(r.commitsOutside, lang))})` : ""}
                </span>
              ) : (
                <span className="italic text-ink-mute">{t.noCommits}</span>
              )}
            </td>
            <td className={styles.r}>{r.dateSource === "git" ? formatInt(r.totalCommits, lang) : "0"}</td>
            <td>
              {r.firstDate ? (r.firstDate === r.lastDate ? day(r.firstDate) : `${day(r.firstDate)} · ${day(r.lastDate)}`) : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const keyDots = max > 0 ? [1, max] : [];
  const legend = (
    <ul aria-label={t.title} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[length:var(--step--1)] text-ink-soft">
      <li className="flex items-center gap-2">
        <svg width="54" height="28" viewBox="0 0 54 28" aria-hidden="true" focusable="false">
          {keyDots.map((n, k) => (
            <circle key={n} className={styles.dot} cx={k === 0 ? 8 : 34} cy="14" r={dotRadius(n, max, 3.5, 13)} />
          ))}
        </svg>
        <span className="italic">{t.dotKey}</span>
        {max > 0 ? <span className="data text-ink-mute">1 · {formatInt(max, lang)}</span> : null}
      </li>
      <li className="flex items-center gap-2">
        <svg width="40" height="14" viewBox="0 0 40 14" aria-hidden="true" focusable="false">
          <line className={styles.band} x1="5" y1="7" x2="35" y2="7" />
        </svg>
        <span className="italic">{t.fileBand}</span>
      </li>
    </ul>
  );

  return (
    <ChartFrame title={t.title} guide={t.guide} describe={t.describe} showTable={c.showTable} hideTable={c.hideTable} legend={legend} table={table}>
      {({ titleId, descId }) => (
        <>
          <div className="relative hidden md:block">
            <svg className={styles.svg} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} role="group" aria-labelledby={titleId} aria-describedby={descId}>
              <g aria-hidden="true">
                {months.map((m) => {
                  const a = angle(m.pos);
                  const [x0, y0] = polar(CX, CY, radius(rows.length - 1) - 18, a);
                  const [x1, y1] = polar(CX, CY, R_OUT + 14, a);
                  const [tx, ty] = polar(CX, CY, R_OUT + 30, angle(m.pos + 2.1));
                  return (
                    <g key={`${m.year}-${m.month}`}>
                      <line className={styles.rule} x1={x0} y1={y0} x2={x1} y2={y1} />
                      <text className={styles.note} x={tx} y={ty + 5} textAnchor="middle" fontSize="15">
                        {monthName(m.month)}
                      </text>
                    </g>
                  );
                })}
              </g>
              {rows.map((r, i) => {
                const rad = radius(i);
                const [lx, ly] = polar(CX, CY, rad, A_FROM);
                return (
                  <g key={r.slug} className={styles.dimmable} data-dim={dimFor(r.slug)}>
                    <path className={styles.ruleStrong} d={arcPath(CX, CY, rad, A_FROM, A_TO)} aria-hidden="true" />
                    <text className={`${styles.name} ${styles.halo}`} x={lx - 12} y={ly + 5} textAnchor="end" fontSize="15" aria-hidden="true">
                      {names.get(r.slug)}
                    </text>
                    {r.commits.map((wk) => {
                      const [x, y] = polar(CX, CY, rad, angle(wk.index + 0.5));
                      const dr = dotRadius(wk.n, max, 3.5, 15);
                      const key = `${r.slug}|${wk.key}`;
                      return (
                        <g key={wk.key} className={styles.mark} role="img" aria-label={dotLabel(r, wk)} {...bind(key)}>
                          <circle className={styles.hit} cx={x} cy={y} r={Math.max(dr + 5, 16)} />
                          <circle className={styles.dot} cx={x} cy={y} r={dr} />
                        </g>
                      );
                    })}
                    {r.band
                      ? (() => {
                          const a0 = angle(r.band.from);
                          const a1 = angle(Math.max(r.band.to, r.band.from + 0.35));
                          const [ex, ey] = polar(CX, CY, rad, a1 - 1.2);
                          return (
                            <g className={styles.mark} role="img" aria-label={bandLabel(r)} {...bind(`${r.slug}|band`)}>
                              <path className={styles.hit} d={sectorPath(CX, CY, rad - 16, rad + 16, a0 + 2.5, a1 - 2.5)} />
                              <path className={styles.band} d={arcPath(CX, CY, rad, a0, a1)} />
                              <text className={`${styles.note} ${styles.halo}`} x={ex + 8} y={ey + 4} fontSize="12.5">
                                {t.sourceFiles}
                              </text>
                            </g>
                          );
                        })()
                      : null}
                    {r.dateSource === "git" && r.commits.length === 0 ? (
                      <text className={styles.note} x={lx + 14} y={ly - 8} fontSize="12.5">
                        {t.noCommits}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            {tip ? (
              <Tip x={tip.desk.x} y={tip.desk.y}>
                {tip.body}
              </Tip>
            ) : null}
          </div>

          <div className={`relative md:hidden ${styles.narrow}`}>
            <svg className={styles.svg} viewBox={`0 0 ${M_W} ${mh}`} role="group" aria-labelledby={titleId} aria-describedby={descId}>
              <g aria-hidden="true">
                {months.map((m) => (
                  <g key={`${m.year}-${m.month}`}>
                    <line className={styles.rule} x1={mx(m.pos)} y1={M_TOP - 8} x2={mx(m.pos)} y2={mh - 4} />
                    <text className={styles.note} x={mx(m.pos) + 3} y={M_TOP - 12} fontSize="11">
                      {monthName(m.month)}
                    </text>
                  </g>
                ))}
              </g>
              {rows.map((r, i) => {
                const y = M_TOP + i * M_ROW;
                const base = y + 40;
                return (
                  <g key={r.slug} className={styles.dimmable} data-dim={dimFor(r.slug)}>
                    <line className={styles.ruleStrong} x1={0} y1={base} x2={M_W} y2={base} aria-hidden="true" />
                    <text className={`${styles.name} ${styles.halo}`} x={2} y={y + 18} fontSize="14" aria-hidden="true">
                      {names.get(r.slug)}
                    </text>
                    <text
                      className={`${r.dateSource === "git" ? styles.num : styles.note} ${styles.halo}`}
                      x={M_W - 2}
                      y={y + 18}
                      textAnchor="end"
                      fontSize={r.dateSource === "git" ? 10.5 : 12}
                      aria-hidden="true"
                    >
                      {r.dateSource === "git" ? commitsText(r.totalCommits) : t.sourceFiles}
                    </text>
                    {r.commits.map((wk) => {
                      const x = mx(wk.index + 0.5);
                      const key = `${r.slug}|${wk.key}`;
                      return (
                        <g key={wk.key} className={styles.mark} role="img" aria-label={dotLabel(r, wk)} {...bind(key)}>
                          <rect className={styles.hit} x={x - 6} y={base - 20} width={12} height={40} />
                          <circle className={styles.dot} cx={x} cy={base} r={dotRadius(wk.n, max, 2.5, 9)} />
                        </g>
                      );
                    })}
                    {r.band ? (
                      <g className={styles.mark} role="img" aria-label={bandLabel(r)} {...bind(`${r.slug}|band`)}>
                        <rect className={styles.hit} x={mx(r.band.from) - 14} y={base - 20} width={Math.max(28, mx(r.band.to) - mx(r.band.from) + 28)} height={40} />
                        <line className={styles.band} x1={mx(r.band.from)} y1={base} x2={Math.max(mx(r.band.to), mx(r.band.from) + 3)} y2={base} />
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            {tip ? (
              <Tip x={tip.phone.x} y={tip.phone.y}>
                {tip.body}
              </Tip>
            ) : null}
          </div>
        </>
      )}
    </ChartFrame>
  );
}
