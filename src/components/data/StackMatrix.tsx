"use client";

import type { Locale } from "@/i18n/config";
import { dataCopy } from "./copy";
import { ChartFrame, Tip, TipRow, styles, useActive } from "./parts";
import { formatInt, type TechRow } from "./stats";

interface Geo {
  lw: number;
  cw: number;
  head: number;
  rh: number;
  tail: number;
  dot: number;
  font: number;
  colFont: number;
}

const DESK: Geo = { lw: 190, cw: 64, head: 128, rh: 38, tail: 56, dot: 7, font: 16, colFont: 14 };
const PHONE: Geo = { lw: 104, cw: 29, head: 112, rh: 34, tail: 26, dot: 5.5, font: 13, colFont: 11.5 };

export function StackMatrix({ lang, columns, techs }: { lang: Locale; columns: { slug: string; name: string }[]; techs: TechRow[] }) {
  const c = dataCopy[lang];
  const s = c.stack;
  const { active, bind } = useActive<string>();
  const names = new Map(columns.map((p) => [p.slug, p.name]));
  const alone = columns.filter((p) => !techs.some((t) => t.slugs.includes(p.slug)));

  const rowLabel = (t: TechRow) => `${t.tech}: ${t.slugs.map((x) => names.get(x)).join(", ")} (${formatInt(t.slugs.length, lang)}).`;
  const ai = techs.findIndex((t) => t.tech === active);
  const aRow = ai >= 0 ? techs[ai] : null;
  const tipBody = aRow ? (
    <>
      <p className="italic text-ink">{aRow.tech}</p>
      <p className="text-ink-soft">{aRow.slugs.map((x) => names.get(x)).join(", ")}</p>
      <div className="my-1.5 border-t border-rule" />
      <TipRow label={s.count} value={formatInt(aRow.slugs.length, lang)} />
    </>
  ) : null;

  const draw = (g: Geo, titleId: string, descId: string) => {
    const w = g.lw + columns.length * g.cw + g.tail;
    const h = g.head + techs.length * g.rh + 6;
    const cx = (j: number) => g.lw + j * g.cw + g.cw / 2;
    return {
      w,
      h,
      svg: (
        <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} role="group" aria-labelledby={titleId} aria-describedby={descId}>
          <g aria-hidden="true">
            {columns.map((p, j) => (
              <g key={p.slug}>
                <line className={styles.rule} x1={cx(j)} y1={g.head - 4} x2={cx(j)} y2={h - 4} />
                <text
                  className={styles.name}
                  x={cx(j) - 2}
                  y={g.head - 12}
                  fontSize={g.colFont}
                  transform={`rotate(-55 ${cx(j) - 2} ${g.head - 12})`}
                >
                  {p.name}
                </text>
              </g>
            ))}
          </g>
          {techs.map((t, i) => {
            const y = g.head + i * g.rh + g.rh / 2;
            return (
              <g
                key={t.tech}
                className={`${styles.mark} ${styles.dimmable}`}
                data-dim={active !== null && active !== t.tech}
                data-on={active === t.tech}
                role="img"
                aria-label={rowLabel(t)}
                {...bind(t.tech)}
              >
                <rect className={styles.hit} x={0} y={y - g.rh / 2 + 1} width={w} height={g.rh - 2} rx="4" />
                <line className={styles.rule} x1={g.lw - 6} y1={y} x2={g.lw + columns.length * g.cw} y2={y} />
                <text className={`${styles.name} ${styles.halo}`} x={g.lw - 12} y={y + g.font * 0.33} textAnchor="end" fontSize={g.font}>
                  {t.tech}
                </text>
                {columns.map((p, j) =>
                  t.slugs.includes(p.slug) ? (
                    <circle key={p.slug} className={styles.dot} cx={cx(j)} cy={y} r={g.dot} />
                  ) : (
                    <circle key={p.slug} className={styles.empty} cx={cx(j)} cy={y} r={1.6} />
                  ),
                )}
                <text className={styles.num} x={w - 4} y={y + 4} textAnchor="end" fontSize={g.font - 3}>
                  {formatInt(t.slugs.length, lang)}
                </text>
              </g>
            );
          })}
        </svg>
      ),
    };
  };

  const table = (
    <table className={styles.table}>
      <caption>{s.title}</caption>
      <thead>
        <tr>
          <th scope="col">{s.tech}</th>
          <th scope="col">{s.used}</th>
          <th scope="col" className={styles.r}>
            {s.count}
          </th>
        </tr>
      </thead>
      <tbody>
        {techs.map((t) => (
          <tr key={t.tech}>
            <th scope="row">{t.tech}</th>
            <td>{t.slugs.map((x) => names.get(x)).join(", ")}</td>
            <td className={styles.r}>{formatInt(t.slugs.length, lang)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const footnote =
    alone.length > 0 ? (
      <p className="measure text-[length:var(--step--1)] italic text-ink-mute">{alone.map((p) => s.alone(p.name)).join(" ")}</p>
    ) : null;

  return (
    <ChartFrame title={s.title} guide={s.guide} describe={s.describe} showTable={c.showTable} hideTable={c.hideTable} table={table} footnote={footnote}>
      {({ titleId, descId }) => {
        const desk = draw(DESK, titleId, descId);
        const phone = draw(PHONE, titleId, descId);
        const tipY = (g: Geo, total: number) => ((g.head + ai * g.rh + 4) / total) * 100;
        return (
          <>
            <div className="relative hidden max-w-[52rem] md:block">
              {desk.svg}
              {aRow ? (
                <Tip x={50} y={tipY(DESK, desk.h)}>
                  {tipBody}
                </Tip>
              ) : null}
            </div>
            <div className={`relative md:hidden ${styles.narrow}`}>
              {phone.svg}
              {aRow ? (
                <Tip x={50} y={tipY(PHONE, phone.h)}>
                  {tipBody}
                </Tip>
              ) : null}
            </div>
          </>
        );
      }}
    </ChartFrame>
  );
}
