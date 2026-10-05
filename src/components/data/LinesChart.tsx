"use client";

import type { Locale } from "@/i18n/config";
import { dataCopy } from "./copy";
import { ChartFrame, Legend, Swatch, Tip, TipRow, fillClass, styles, useActive } from "./parts";
import { arcPath, codeFiles, codeLines, familySlices, familyTotals, formatInt, niceMax, polar, rayBar, segmentRuns, type ProjectStats } from "./stats";

export interface NamedStats {
  slug: string;
  name: string;
  stats: ProjectStats;
}

/* Desktop fan geometry, in viewBox units. */
const VB = { x: -60, y: 20, w: 1120, h: 570 };
const CX = 500;
const CY = 540;
const R0 = 92;
const LEN = 360;
const R_LABEL = R0 + LEN + 34;
const A_FROM = 160;
const A_TO = 20;
const THICK = 20;

/* Mobile rows geometry. */
const M_W = 340;
const M_ROW = 58;
const M_TOP = 34;

export function LinesChart({ lang, rows }: { lang: Locale; rows: NamedStats[] }) {
  const c = dataCopy[lang];
  const { active, bind } = useActive<string>();
  const totals = familyTotals(rows.map((r) => r.stats));
  const maxLines = Math.max(0, ...rows.map((r) => codeLines(r.stats)));
  const scaleMax = niceMax(maxLines, 5000);
  const rings: number[] = [];
  for (let v = 5000; v <= scaleMax; v += 5000) rings.push(v);
  const n = rows.length;
  const angleOf = (i: number) => (n <= 1 ? 90 : A_FROM - (i * (A_FROM - A_TO)) / (n - 1));

  const activeRow = rows.find((r) => r.slug === active);
  const tipFor = (r: NamedStats) => {
    const lines = codeLines(r.stats);
    return (
      <>
        <p className="italic text-ink">{r.name}</p>
        <TipRow label={c.lines.total} value={lines > 0 ? formatInt(lines, lang) : c.lines.noCode} />
        <TipRow label={c.lines.files} value={formatInt(codeFiles(r.stats), lang)} />
        <div className="my-1.5 border-t border-rule" />
        {familySlices(r.stats).map((s) => (
          <TipRow key={s.family} label={c.families[s.family]} value={formatInt(s.lines, lang)} swatch={s.fill} />
        ))}
        <div className="my-1.5 border-t border-rule" />
        <TipRow label={c.lines.docs} value={formatInt(r.stats.docsLines, lang)} />
        <TipRow label={c.lines.deps} value={r.stats.dependencies === null ? c.lines.noManifest : formatInt(r.stats.dependencies, lang)} />
      </>
    );
  };

  const markLabel = (r: NamedStats) => {
    const lines = codeLines(r.stats);
    if (lines === 0) return `${r.name}: ${c.lines.noCode}.`;
    const parts = familySlices(r.stats)
      .map((s) => `${c.families[s.family]} ${formatInt(s.lines, lang)}`)
      .join(", ");
    return `${r.name}: ${formatInt(lines, lang)} ${c.lines.linesUnit}, ${formatInt(codeFiles(r.stats), lang)} ${c.lines.filesUnit}. ${parts}.`;
  };

  // Tooltip anchor, in percent of each layout's box.
  let tipDesktop: { x: number; y: number } | null = null;
  let tipMobile: { x: number; y: number } | null = null;
  if (activeRow) {
    const i = rows.indexOf(activeRow);
    const len = (codeLines(activeRow.stats) / scaleMax) * LEN;
    const [tx, ty] = polar(CX, CY, R0 + len, angleOf(i));
    tipDesktop = { x: ((tx - VB.x) / VB.w) * 100, y: ((ty - VB.y) / VB.h) * 100 };
    const mh = M_TOP + rows.length * M_ROW;
    tipMobile = { x: 50, y: ((M_TOP + i * M_ROW + 8) / mh) * 100 };
  }

  const table = (
    <table className={styles.table}>
      <caption>{c.lines.title}</caption>
      <thead>
        <tr>
          <th scope="col">{c.lines.project}</th>
          <th scope="col" className={styles.r}>
            {c.lines.total}
          </th>
          <th scope="col" className={styles.r}>
            {c.lines.files}
          </th>
          {totals.map((t) => (
            <th key={t.family} scope="col" className={styles.r}>
              {c.families[t.family]}
            </th>
          ))}
          <th scope="col" className={styles.r}>
            {c.lines.docs}
          </th>
          <th scope="col" className={styles.r}>
            {c.lines.deps}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const slices = familySlices(r.stats);
          return (
            <tr key={r.slug}>
              <th scope="row">{r.name}</th>
              <td className={styles.r}>{formatInt(codeLines(r.stats), lang)}</td>
              <td className={styles.r}>{formatInt(codeFiles(r.stats), lang)}</td>
              {totals.map((t) => {
                const s = slices.find((x) => x.family === t.family);
                return (
                  <td key={t.family} className={styles.r}>
                    {s ? formatInt(s.lines, lang) : "0"}
                  </td>
                );
              })}
              <td className={styles.r}>{formatInt(r.stats.docsLines, lang)}</td>
              <td className={styles.r}>{r.stats.dependencies === null ? c.lines.noManifest : formatInt(r.stats.dependencies, lang)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const legend = (
    <Legend
      label={c.lines.legend}
      items={totals.map((t) => ({
        key: t.family,
        node: <Swatch fill={t.fill} />,
        text: c.families[t.family],
        value: formatInt(t.lines, lang),
      }))}
    />
  );

  return (
    <ChartFrame
      title={c.lines.title}
      guide={c.lines.guide}
      describe={c.lines.describe}
      showTable={c.showTable}
      hideTable={c.hideTable}
      legend={legend}
      table={table}
    >
      {({ titleId, descId }) => (
        <>
          {/* Desktop: rays fanned along a compass arc. */}
          <div className="relative hidden md:block">
            <svg
              className={styles.svg}
              viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
              role="group"
              aria-labelledby={titleId}
              aria-describedby={descId}
            >
              {/* Protractor: scale rings and baseline. */}
              <g aria-hidden="true">
                <line className={styles.ruleStrong} x1={CX - R0 - LEN - 8} y1={CY} x2={CX + R0 + LEN + 8} y2={CY} />
                {rings.map((v) => {
                  const r = R0 + (v / scaleMax) * LEN;
                  return (
                    <g key={v}>
                      <path className={styles.rule} d={arcPath(CX, CY, r, 180, 0)} />
                      <text className={styles.num} x={CX + r} y={CY + 22} textAnchor="middle" fontSize="13">
                        {formatInt(v, lang)}
                      </text>
                    </g>
                  );
                })}
                <path className={styles.hub} d={arcPath(CX, CY, R0 - 10, 180, 0)} />
                <circle className={styles.centre} cx={CX} cy={CY} r="3.5" />
                <text className={styles.note} x={CX} y={CY + 22} textAnchor="middle" fontSize="14">
                  {c.lines.scale}
                </text>
              </g>
              {rows.map((r, i) => {
                const a = angleOf(i);
                const lines = codeLines(r.stats);
                const slices = familySlices(r.stats);
                const len = (lines / scaleMax) * LEN;
                const runs = segmentRuns(
                  slices.map((s) => s.lines),
                  R0,
                  len,
                  2,
                );
                const [lx, ly] = polar(CX, CY, R_LABEL, a);
                const cos = Math.cos((a * Math.PI) / 180);
                const anchor = cos < -0.25 ? "end" : cos > 0.25 ? "start" : "middle";
                const top = anchor === "middle";
                const [ex, ey] = polar(CX, CY, R0 + len + 8, a);
                const [fx, fy] = polar(CX, CY, R_LABEL - 12, a);
                return (
                  <g
                    key={r.slug}
                    className={`${styles.mark} ${styles.dimmable}`}
                    data-dim={active !== null && active !== r.slug}
                    data-on={active === r.slug}
                    role="img"
                    aria-label={markLabel(r)}
                    {...bind(r.slug)}
                  >
                    <path className={styles.hit} d={rayBar(CX, CY, a, R0 - 6, R_LABEL + 10, 44)} />
                    {lines > 0 ? (
                      slices.map((s, k) => <path key={s.family} className={fillClass(s.fill)} d={rayBar(CX, CY, a, runs[k].from, runs[k].to, THICK)} />)
                    ) : (
                      <path className={styles.rule} d={rayBar(CX, CY, a, R0, R0 + 2, THICK)} />
                    )}
                    <line className={styles.leader} x1={ex} y1={ey} x2={fx} y2={fy} />
                    <text
                      className={`${styles.name} ${styles.halo}`}
                      x={lx}
                      y={top ? ly - 20 : ly - 2}
                      textAnchor={anchor}
                      fontSize="17"
                    >
                      {r.name}
                    </text>
                    <text className={`${styles.num} ${styles.halo}`} x={lx} y={top ? ly - 3 : ly + 15} textAnchor={anchor} fontSize="13">
                      {lines > 0 ? formatInt(lines, lang) : c.lines.noCode}
                    </text>
                  </g>
                );
              })}
            </svg>
            {activeRow && tipDesktop ? (
              <Tip x={tipDesktop.x} y={tipDesktop.y}>
                {tipFor(activeRow)}
              </Tip>
            ) : null}
          </div>

          {/* Phone: the same rays laid flat, one under the other. */}
          <div className={`relative md:hidden ${styles.narrow}`}>
            <svg
              className={styles.svg}
              viewBox={`0 0 ${M_W} ${M_TOP + rows.length * M_ROW}`}
              role="group"
              aria-labelledby={titleId}
              aria-describedby={descId}
            >
              <g aria-hidden="true">
                {[0, ...rings].map((v) => {
                  const x = (v / scaleMax) * M_W;
                  return (
                    <g key={v}>
                      <line className={styles.rule} x1={x} y1={M_TOP - 10} x2={x} y2={M_TOP + rows.length * M_ROW} />
                      {v > 0 && v % 10000 === 0 ? (
                        <text className={styles.num} x={Math.min(x, M_W - 2)} y={M_TOP - 16} textAnchor={x > M_W - 20 ? "end" : "middle"} fontSize="10">
                          {formatInt(v, lang)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
              {rows.map((r, i) => {
                const y = M_TOP + i * M_ROW;
                const lines = codeLines(r.stats);
                const slices = familySlices(r.stats);
                const len = (lines / scaleMax) * M_W;
                const runs = segmentRuns(
                  slices.map((s) => s.lines),
                  0,
                  len,
                  2,
                );
                return (
                  <g
                    key={r.slug}
                    className={`${styles.mark} ${styles.dimmable}`}
                    data-dim={active !== null && active !== r.slug}
                    data-on={active === r.slug}
                    role="img"
                    aria-label={markLabel(r)}
                    {...bind(r.slug)}
                  >
                    <rect className={styles.hit} x={-4} y={y} width={M_W + 8} height={M_ROW - 4} rx="4" />
                    <text className={`${styles.name} ${styles.halo}`} x={2} y={y + 20} fontSize="15">
                      {r.name}
                    </text>
                    <text className={`${styles.num} ${styles.halo}`} x={M_W - 2} y={y + 20} textAnchor="end" fontSize="12">
                      {lines > 0 ? formatInt(lines, lang) : c.lines.noCode}
                    </text>
                    {slices.map((s, k) => (
                      <rect key={s.family} className={fillClass(s.fill)} x={runs[k].from} y={y + 29} width={runs[k].to - runs[k].from} height={16} />
                    ))}
                  </g>
                );
              })}
            </svg>
            {activeRow && tipMobile ? (
              <Tip x={tipMobile.x} y={tipMobile.y}>
                {tipFor(activeRow)}
              </Tip>
            ) : null}
          </div>
        </>
      )}
    </ChartFrame>
  );
}

