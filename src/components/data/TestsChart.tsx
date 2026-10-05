"use client";

import type { Locale } from "@/i18n/config";
import { dataCopy } from "./copy";
import type { NamedStats } from "./LinesChart";
import { ChartFrame, Legend, Swatch, Tip, TipRow, fillClass, styles, useActive } from "./parts";
import { TEST_KINDS, formatInt, niceMax, segmentRuns, testRows } from "./stats";

const D = { w: 1000, top: 44, row: 50, label: 236, x0: 256, len: 620 };
const M = { w: 340, top: 30, row: 58 };

export function TestsChart({ lang, rows: input }: { lang: Locale; rows: NamedStats[] }) {
  const c = dataCopy[lang];
  const t = c.tests;
  const { active, bind } = useActive<string>();
  const rows = testRows(input.map((r) => r.stats));
  const names = new Map(input.map((r) => [r.slug, r.name]));
  const max = Math.max(0, ...rows.map((r) => r.total));
  const scaleMax = niceMax(max, 50);
  const ticks: number[] = [];
  for (let v = 0; v <= scaleMax; v += 50) ticks.push(v);
  const kinds = TEST_KINDS.filter((k) => rows.some((r) => r.parts.some((p) => p.kind === k.id)));
  const dh = D.top + rows.length * D.row;
  const mh = M.top + rows.length * M.row;

  const label = (slug: string) => {
    const r = rows.find((x) => x.slug === slug)!;
    if (r.total === 0) return `${names.get(slug)}: ${t.none}.`;
    const parts = r.parts.map((p) => `${c.testKinds[p.kind]} ${formatInt(p.n, lang)}`).join(", ");
    return `${names.get(slug)}: ${formatInt(r.total, lang)} ${t.total.toLowerCase()}. ${parts}.`;
  };

  const ai = rows.findIndex((r) => r.slug === active);
  const aRow = ai >= 0 ? rows[ai] : null;
  const tipBody = aRow ? (
    <>
      <p className="italic text-ink">{names.get(aRow.slug)}</p>
      {aRow.total === 0 ? (
        <p className="text-ink-soft">{t.none}</p>
      ) : (
        <>
          {aRow.parts.map((p) => (
            <TipRow key={p.kind} label={c.testKinds[p.kind]} value={formatInt(p.n, lang)} swatch={p.fill} />
          ))}
          <div className="my-1.5 border-t border-rule" />
          <TipRow label={t.total} value={formatInt(aRow.total, lang)} />
        </>
      )}
    </>
  ) : null;

  const table = (
    <table className={styles.table}>
      <caption>{t.title}</caption>
      <thead>
        <tr>
          <th scope="col">{t.project}</th>
          {kinds.map((k) => (
            <th key={k.id} scope="col" className={styles.r}>
              {c.testKinds[k.id]}
            </th>
          ))}
          <th scope="col" className={styles.r}>
            {t.total}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.slug}>
            <th scope="row">{names.get(r.slug)}</th>
            {kinds.map((k) => (
              <td key={k.id} className={styles.r}>
                {formatInt(r.parts.find((p) => p.kind === k.id)?.n ?? 0, lang)}
              </td>
            ))}
            <td className={styles.r}>{r.total > 0 ? formatInt(r.total, lang) : `0 (${t.none})`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const legend = (
    <Legend label={t.legend} items={kinds.map((k) => ({ key: k.id, node: <Swatch fill={k.fill} />, text: c.testKinds[k.id] }))} />
  );

  return (
    <ChartFrame title={t.title} guide={t.guide} describe={t.describe} showTable={c.showTable} hideTable={c.hideTable} legend={legend} table={table}>
      {({ titleId, descId }) => (
        <>
          <div className="relative hidden md:block">
            <svg className={styles.svg} viewBox={`0 0 ${D.w} ${dh}`} role="group" aria-labelledby={titleId} aria-describedby={descId}>
              <g aria-hidden="true">
                {ticks.map((v) => {
                  const x = D.x0 + (v / scaleMax) * D.len;
                  return (
                    <g key={v}>
                      <line className={v === 0 ? styles.ruleStrong : styles.rule} x1={x} y1={D.top - 12} x2={x} y2={dh - 6} />
                      <text className={styles.num} x={x} y={D.top - 20} textAnchor="middle" fontSize="13">
                        {formatInt(v, lang)}
                      </text>
                    </g>
                  );
                })}
              </g>
              {rows.map((r, i) => {
                const y = D.top + i * D.row;
                const len = (r.total / scaleMax) * D.len;
                const runs = segmentRuns(
                  r.parts.map((p) => p.n),
                  D.x0,
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
                    aria-label={label(r.slug)}
                    {...bind(r.slug)}
                  >
                    <rect className={styles.hit} x={0} y={y + 2} width={D.w} height={D.row - 4} rx="4" />
                    <line className={styles.rule} x1={0} y1={y + D.row} x2={D.label} y2={y + D.row} />
                    <text className={styles.name} x={D.label} y={y + 30} textAnchor="end" fontSize="17">
                      {names.get(r.slug)}
                    </text>
                    {r.total > 0 ? (
                      <>
                        {r.parts.map((p, k) => (
                          <rect key={p.kind} className={fillClass(p.fill)} x={runs[k].from} y={y + 14} width={runs[k].to - runs[k].from} height={22} />
                        ))}
                        <text className={styles.numStrong} x={D.x0 + len + 12} y={y + 30} fontSize="15">
                          {formatInt(r.total, lang)}
                        </text>
                      </>
                    ) : (
                      <text className={`${styles.note} ${styles.halo}`} x={D.x0 + 12} y={y + 30} fontSize="15">
                        {t.none}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            {aRow ? (
              <Tip x={((D.x0 + (aRow.total / scaleMax) * D.len) / D.w) * 100} y={((D.top + ai * D.row + 12) / dh) * 100}>
                {tipBody}
              </Tip>
            ) : null}
          </div>

          <div className={`relative md:hidden ${styles.narrow}`}>
            <svg className={styles.svg} viewBox={`0 0 ${M.w} ${mh}`} role="group" aria-labelledby={titleId} aria-describedby={descId}>
              <g aria-hidden="true">
                {ticks.map((v) => {
                  const x = (v / scaleMax) * M.w;
                  return (
                    <g key={v}>
                      <line className={styles.rule} x1={x} y1={M.top - 8} x2={x} y2={mh} />
                      {v > 0 ? (
                        <text className={styles.num} x={x} y={M.top - 14} textAnchor={x > M.w - 14 ? "end" : "middle"} fontSize="10">
                          {formatInt(v, lang)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
              {rows.map((r, i) => {
                const y = M.top + i * M.row;
                const len = (r.total / scaleMax) * M.w;
                const runs = segmentRuns(
                  r.parts.map((p) => p.n),
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
                    aria-label={label(r.slug)}
                    {...bind(r.slug)}
                  >
                    <rect className={styles.hit} x={-4} y={y} width={M.w + 8} height={M.row - 4} rx="4" />
                    <text className={`${styles.name} ${styles.halo}`} x={2} y={y + 18} fontSize="14">
                      {names.get(r.slug)}
                    </text>
                    <text className={`${r.total > 0 ? styles.numStrong : styles.note} ${styles.halo}`} x={M.w - 2} y={y + 18} textAnchor="end" fontSize={r.total > 0 ? 12 : 11.5}>
                      {r.total > 0 ? formatInt(r.total, lang) : t.none}
                    </text>
                    {r.parts.map((p, k) => (
                      <rect key={p.kind} className={fillClass(p.fill)} x={runs[k].from} y={y + 28} width={runs[k].to - runs[k].from} height={16} />
                    ))}
                  </g>
                );
              })}
            </svg>
            {aRow ? (
              <Tip x={50} y={((M.top + ai * M.row + 6) / mh) * 100}>
                {tipBody}
              </Tip>
            ) : null}
          </div>
        </>
      )}
    </ChartFrame>
  );
}
