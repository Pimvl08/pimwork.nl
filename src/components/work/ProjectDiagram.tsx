import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { diagramCopy, isDiagramSlug, type DiagramSlug } from "./copy";
import { polar, r2 } from "./lib";
import s from "./diagram.module.css";

/**
 * One authored plate per project. Each draws the project's real mechanism in
 * the world's grammar: hairlines, italic labels, a numbered figure and the
 * crease ink only on the element that matters. Drawn in a 480 x 360 box.
 * No hooks, so it renders on the server and never ships as client code.
 */

type CopyOf<K extends DiagramSlug> = (typeof diagramCopy)[K]["nl"] | (typeof diagramCopy)[K]["en"];

/** Arrow head at (x, y) pointing along `angle` (degrees, 0 = right, 90 = down). */
function Head({ x, y, angle, ink = false }: { x: number; y: number; angle: number; ink?: boolean }) {
  const len = 7;
  const spread = 28;
  const a = ((angle + 180 - spread) * Math.PI) / 180;
  const b = ((angle + 180 + spread) * Math.PI) / 180;
  const p1 = `${r2(x + len * Math.cos(a))} ${r2(y + len * Math.sin(a))}`;
  const p2 = `${r2(x + len * Math.cos(b))} ${r2(y + len * Math.sin(b))}`;
  return <path d={`M${p1} L${x} ${y} L${p2}`} className={ink ? s.inkThin : s.mute} />;
}

/** Word-like strokes inside one transcript window. */
function Words({ x0, y, widths, className, until }: { x0: number; y: number; widths: number[]; className: string; until?: number }) {
  let x = x0;
  const segments: string[] = [];
  for (const w of widths) {
    const end = Math.min(x + w, until ?? Infinity);
    if (end <= x) break;
    segments.push(`M${x} ${y} H${end}`);
    x += w + 6;
  }
  return <path d={segments.join(" ")} className={className} />;
}

function TeamSync({ t }: { t: CopyOf<"teamsync"> }) {
  const inputs = [
    { y: 108, label: t.local },
    { y: 180, label: t.base },
    { y: 252, label: t.cloud },
  ];
  return (
    <>
      {inputs.map((input) => (
        <g key={input.y}>
          <text x={134} y={input.y + 5} textAnchor="end">
            {input.label}
          </text>
          <circle cx={148} cy={input.y} r={5} className={s.node} />
        </g>
      ))}
      <text x={134} y={292} textAnchor="end" className={s.mono}>
        SHA-256
      </text>
      <path className={s.mute} d="M153 108 C 205 108, 222 180, 258 180" />
      <path className={s.mute} d="M153 180 H 258" />
      <path className={s.mute} d="M153 252 C 205 252, 222 180, 258 180" />
      <text x={170} y={98} className={s.small}>
        L ≠ B
      </text>
      <text x={170} y={274} className={s.small}>
        C ≠ B
      </text>
      <circle cx={283} cy={180} r={25} className={s.inkNode} />
      <text x={283} y={185} textAnchor="middle" className={s.inkText}>
        {t.decide}
      </text>
      <text x={290} y={232} textAnchor="middle" className={s.small}>
        {t.pure}
      </text>
      <path className={s.ink} d="M308 180 C 328 180, 332 198, 350 198" />
      <Head x={350} y={198} angle={0} ink />
      <text x={360} y={118} className={s.small}>
        {t.one}
      </text>
      {t.actions.map((action, i) => (
        <text key={action} x={360} y={146 + i * 26} className={i === 2 ? s.inkText : s.faintText}>
          {action}
        </text>
      ))}
      <path className={s.ink} d="M360 206 Q 404 212 452 206" />
    </>
  );
}

function StrengthTracker({ t }: { t: CopyOf<"strength-tracker"> }) {
  const prev = [92, 98, 92];
  const curr = [104, 110, 106];
  const statusX = [48, 152, 228, 334];
  const ticks = Array.from({ length: 21 }, (_, i) => 40 + i * 20);
  return (
    <>
      <text x={48} y={80}>
        {t.prev}
      </text>
      <text x={208} y={80}>
        {t.curr}
      </text>
      {prev.map((w, i) => (
        <path key={`p${i}`} className={s.bar} d={`M48 ${102 + i * 16} h${w}`} />
      ))}
      {curr.map((w, i) => (
        <path key={`c${i}`} className={s.barInk} d={`M208 ${102 + i * 16} h${w}`} />
      ))}
      <path className={s.mute} d="M94 146 C 94 180, 140 196, 170 196" />
      <path className={s.mute} d="M262 146 C 262 180, 214 196, 182 196" />
      <circle cx={176} cy={196} r={6} className={s.inkNode} />
      <text x={194} y={201} className={s.small}>
        {t.compare}
      </text>
      <path className={s.hair} d="M176 202 V 214" />
      <path className={s.hair} d="M48 220 Q 210 212 372 220" />
      {t.statuses.map((status, i) => (
        <text key={status} x={statusX[i]} y={242} className={i === 0 ? s.inkText : s.faintText}>
          {status}
        </text>
      ))}
      <path className={s.ink} d="M48 250 Q 80 254 112 250" />
      <path className={s.inkThin} d="M80 256 C 80 292, 150 306, 194 310" />
      <text x={40} y={300} className={s.small}>
        {t.weight}
      </text>
      <path className={s.hair} d="M40 318 H 440" />
      {ticks.map((x, i) => (
        <path key={x} className={i % 2 === 0 ? s.mute : s.hair} d={`M${x} ${i % 2 === 0 ? 313 : 315} V ${i % 2 === 0 ? 323 : 321}`} />
      ))}
      <path className={s.mute} d="M200 306 V 328" />
      <path className={s.ink} d="M240 306 V 328" />
      <path className={s.ink} d="M200 304 Q 220 276 240 304" />
      <Head x={240} y={304} angle={54} ink />
      <text x={250} y={292} className={s.small}>
        {t.nextWeek}
      </text>
      <text x={196} y={346} textAnchor="end" className={s.small}>
        w
      </text>
      <text x={236} y={346} className={`${s.small} ${s.inkText}`}>
        {t.plus}
      </text>
      <text x={440} y={346} textAnchor="end" className={s.small}>
        {t.steps}
      </text>
    </>
  );
}

function Belhulp({ t }: { t: CopyOf<"belhulp"> }) {
  const windows = [40, 140, 240, 340];
  const rowA = [16, 9, 22, 12, 18];
  const rowB = [11, 20, 8, 17, 24];
  const now = 412;
  return (
    <>
      <text x={40} y={80} className={s.small}>
        {t.provisional}
      </text>
      <text x={40} y={230} className={s.small}>
        {t.final}
      </text>
      <text x={now} y={80} textAnchor="middle" className={s.inkText}>
        {t.now}
      </text>
      {[140, 240, 340].map((x) => (
        <path key={x} className={`${s.hair} ${s.dash}`} d={`M${x} 90 V 246`} />
      ))}
      {windows.map((x0, i) => {
        const closed = i < 3;
        return (
          <g key={x0}>
            <Words x0={x0 + 8} y={104} widths={rowA} className={closed ? s.wordsGone : s.words} until={closed ? undefined : now - 4} />
            <Words x0={x0 + 8} y={118} widths={rowB} className={closed ? s.wordsGone : s.words} until={closed ? undefined : now - 30} />
            {closed ? (
              <>
                <Words x0={x0 + 8} y={192} widths={rowA} className={s.wordsFinal} />
                <Words x0={x0 + 8} y={206} widths={rowB} className={s.wordsFinal} />
                <path className={s.inkThin} d={`M${x0 + 50} 182 C ${x0 + 44} 160, ${x0 + 44} 146, ${x0 + 50} 128`} />
                <Head x={x0 + 50} y={128} angle={-80} ink />
              </>
            ) : (
              <>
                <rect x={x0 + 8} y={184} width={84} height={30} rx={3} className={`${s.hair} ${s.dash}`} />
                <text x={x0 + 50} y={234} textAnchor="middle" className={s.small}>
                  {t.running}
                </text>
              </>
            )}
          </g>
        );
      })}
      <text x={98} y={146} className={s.small}>
        {t.replaces}
      </text>
      <path className={s.ink} d={`M${now} 88 V 252`} />
      <path className={s.hair} d="M40 250 H 448" />
      {[40, 140, 240, 340, 440].map((x, i) => (
        <g key={x}>
          <path className={s.mute} d={`M${x} 245 V 255`} />
          {i < 4 ? (
            <text x={x} y={272} textAnchor="middle" className={s.mono}>
              {i * 45} s
            </text>
          ) : null}
        </g>
      ))}
      <path className={s.mute} d="M40 284 Q 90 296 140 284" />
      <text x={90} y={314} textAnchor="middle" className={s.small}>
        {t.window}
      </text>
    </>
  );
}

/** A slightly wobbly circle: the raw generated line before cleaning. */
function wobble(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let i = 0; i <= 36; i++) {
    const deg = i * 10;
    const rr = radius + Math.sin(i * 1.7) * 1.6 + Math.cos(i * 2.9) * 1.1;
    const [x, y] = polar(cx, cy, rr, deg);
    points.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
  }
  return points.join(" ");
}

function KdpKleurboek({ t }: { t: CopyOf<"kdp-kleurboek"> }) {
  const centers = [76, 182, 288, 394];
  const cy = 136;
  const specks: [number, number][] = [
    [58, 112],
    [94, 121],
    [62, 152],
    [99, 158],
    [80, 104],
    [70, 133],
    [90, 145],
    [53, 140],
  ];
  const k = 0.5523 * 22;
  const vx = centers[2];
  const vector = `M${vx} ${cy - 22} C ${r2(vx + k)} ${cy - 22}, ${vx + 22} ${r2(cy - k)}, ${vx + 22} ${cy} C ${vx + 22} ${r2(cy + k)}, ${r2(vx + k)} ${cy + 22}, ${vx} ${cy + 22} C ${r2(vx - k)} ${cy + 22}, ${vx - 22} ${r2(cy + k)}, ${vx - 22} ${cy} C ${vx - 22} ${r2(cy - k)}, ${r2(vx - k)} ${cy - 22}, ${vx} ${cy - 22} Z`;
  const qx = centers[3] - 30;
  const qy = cy - 30;
  const stair = [5, 4, 3, 2, 1, 0];
  return (
    <>
      {centers.map((x) => (
        <rect key={x} x={x - 36} y={cy - 36} width={72} height={72} rx={2} className={s.hair} />
      ))}
      <path d={wobble(centers[0], cy, 22)} className={s.mute} style={{ strokeWidth: 2 }} />
      {specks.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} className={s.speck} />
      ))}
      <circle cx={centers[1]} cy={cy} r={22} className={s.ink} style={{ strokeWidth: 2.2 }} />
      <path d={vector} className={s.ink} />
      {[
        [vx, cy - 22],
        [vx + 22, cy],
        [vx, cy + 22],
        [vx - 22, cy],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 2.5} y={y - 2.5} width={5} height={5} className={s.inkNode} />
      ))}
      <path className={s.hair} d={`M${r2(vx - k)} ${cy - 22} H ${r2(vx + k)} M${vx + 22} ${r2(cy - k)} V ${r2(cy + k)}`} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={`g${i}`} className={s.hair} d={`M${qx + i * 10} ${qy} V ${qy + 60} M${qx} ${qy + i * 10} H ${qx + 60}`} />
      ))}
      {stair.map((row, col) => (
        <rect key={`s${col}`} x={qx + col * 10} y={qy + row * 10} width={10} height={10} className={s.cell} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={`a${i}`}>
          <path className={s.mute} d={`M${centers[i] + 42} ${cy} H ${centers[i + 1] - 42}`} />
          <Head x={centers[i + 1] - 42} y={cy} angle={0} />
        </g>
      ))}
      {t.stages.map((stage, i) => (
        <text key={stage} x={centers[i]} y={196} textAnchor="middle" className={i === 3 ? s.inkText : undefined}>
          {stage}
        </text>
      ))}
      {t.subs.map((sub, i) => (
        <text key={sub} x={centers[i]} y={214} textAnchor="middle" className={s.small}>
          {sub}
        </text>
      ))}
      <path className={`${s.faint} ${s.dash}`} d={`M${centers[3]} 224 V 246`} />
      <text x={40} y={258} className={s.small}>
        {t.inspect}
      </text>
      {t.checks.map((check, i) => {
        const y = 284 + i * 24;
        return (
          <g key={check}>
            <text x={40} y={y}>
              {check}
            </text>
            <path className={`${s.hair} ${s.dash}`} d={`M168 ${y - 4} H 372`} />
            <path className={s.ink} d={`M380 ${y - 5} l5 5 l10 -11`} />
            <text x={404} y={y} className={s.small}>
              {t.pass}
            </text>
          </g>
        );
      })}
      <path className={s.ink} style={{ strokeWidth: 1.6 }} d="M40 344 H 300" />
      <Head x={300} y={344} angle={0} ink />
      <text x={312} y={348} className={s.inkText}>
        {t.verdict}
      </text>
    </>
  );
}

function SolanaForensics({ t }: { t: CopyOf<"solana-forensics"> }) {
  const vault = (x: number, y: number, label: string) => (
    <g>
      <rect x={x} y={y} width={46} height={28} rx={2} className={s.node} />
      <text x={x + 23} y={y + 18} textAnchor="middle" className={s.mono}>
        {label}
      </text>
    </g>
  );
  return (
    <>
      <circle cx={80} cy={180} r={27} className={s.node} />
      <text x={80} y={185} textAnchor="middle">
        {t.trader}
      </text>
      <text x={80} y={228} textAnchor="middle" className={s.small}>
        {t.flat}
      </text>
      <path className={s.mute} d="M44 242 H 70 L 74 239.5 L 78 243 L 82 242 H 116" />
      <text x={184} y={70} className={s.small}>
        {t.poolA}
      </text>
      {vault(184, 80, "A")}
      {vault(238, 80, "SOL")}
      <text x={184} y={250} className={s.small}>
        {t.poolB}
      </text>
      {vault(184, 260, "SOL")}
      {vault(238, 260, "B")}
      <path className={s.mute} d="M102 164 C 130 130, 150 94, 180 94" />
      <Head x={181} y={94} angle={0} />
      <text x={124} y={118} className={s.mono}>
        A
      </text>
      <path className={`${s.mute} ${s.dash}`} d="M261 110 C 261 180, 207 190, 207 256" />
      <Head x={207} y={256} angle={90} />
      <text x={244} y={188} className={s.mono}>
        SOL
      </text>
      <path className={s.mute} d="M261 290 C 261 334, 116 334, 92 206" />
      <Head x={92} y={206} angle={-100} />
      <text x={168} y={330} className={s.mono}>
        B
      </text>
      <text x={207} y={122} textAnchor="middle" className={`${s.mono} ${s.inkText}`}>
        +A
      </text>
      <text x={292} y={98} className={`${s.mono} ${s.inkText}`}>
        −SOL
      </text>
      <text x={178} y={279} textAnchor="end" className={`${s.mono} ${s.inkText}`}>
        +SOL
      </text>
      <text x={292} y={279} className={`${s.mono} ${s.inkText}`}>
        −B
      </text>
      <text x={336} y={150} className={s.small}>
        {t.deltas}
      </text>
      <path className={s.hair} d="M336 158 H 458" />
      <text x={336} y={180} className={s.small}>
        {t.poolA}
      </text>
      <text x={458} y={180} textAnchor="end" className={s.mono}>
        +A −SOL
      </text>
      <text x={336} y={202} className={s.small}>
        {t.poolB}
      </text>
      <text x={458} y={202} textAnchor="end" className={s.mono}>
        +SOL −B
      </text>
      <path className={s.hair} d="M336 214 H 458" />
      <text x={336} y={238}>
        {t.trade}
      </text>
      <text x={458} y={238} textAnchor="end" className={s.inkText}>
        {t.tradeValue}
      </text>
      <path className={s.ink} d="M392 246 Q 426 251 458 246" />
      <text x={336} y={266} className={s.small}>
        {t.wallet}
      </text>
      <text x={458} y={266} textAnchor="end" className={s.mono}>
        {t.walletValue}
      </text>
    </>
  );
}

function OffertePdf({ t }: { t: CopyOf<"offerte-pdf-generator"> }) {
  const xs = [34, 181, 328];
  const top = 66;
  const w = 118;
  const h = 167;
  const band = (x: number, y: number) => (
    <g>
      <path className={s.ink} d={`M${x + 8} ${y} H ${x + w - 8} M${x + 8} ${y + 12} H ${x + w - 8}`} />
      <path className={s.hair} d={`M${x + 70} ${y} V ${y + 12} M${x + 92} ${y} V ${y + 12}`} />
    </g>
  );
  const rows = (x: number, from: number, count: number) => (
    <path
      className={s.hair}
      d={Array.from({ length: count }, (_, i) => `M${x + 8} ${from + i * 10} H ${x + w - 8}`).join(" ")}
    />
  );
  const arcY = (x: number) => {
    const tt = (x - 34) / 412;
    return r2(262 + 2 * tt * (1 - tt) * 68);
  };
  return (
    <>
      {xs.map((x) => (
        <rect key={x} x={x} y={top} width={w} height={h} rx={1.5} className={s.node} />
      ))}
      <path className={s.mute} d={`M${xs[0] + 8} ${top + 14} H ${xs[0] + 50} M${xs[0] + 8} ${top + 22} H ${xs[0] + 40}`} />
      <rect x={xs[0] + 88} y={top + 8} width={20} height={20} className={s.hair} />
      <path className={s.hair} d={`M${xs[0] + 8} ${top + 42} H ${xs[0] + 100} M${xs[0] + 8} ${top + 50} H ${xs[0] + 86}`} />
      {band(xs[0], top + 62)}
      {rows(xs[0], top + 84, 8)}
      {band(xs[1], top + 14)}
      {rows(xs[1], top + 36, 12)}
      {band(xs[2], top + 14)}
      {rows(xs[2], top + 36, 3)}
      <path className={s.mute} d={`M${xs[2] + 62} ${top + 74} H ${xs[2] + w - 8} M${xs[2] + 62} ${top + 84} H ${xs[2] + w - 8}`} />
      <text x={xs[2] + 58} y={top + 88} textAnchor="end" className={s.small}>
        {t.totals}
      </text>
      <path className={s.hair} d={`M${xs[2] + 10} ${top + 128} H ${xs[2] + 62}`} />
      {xs.map((x, i) => (
        <text key={`f${x}`} x={x + w / 2} y={top + h - 9} textAnchor="middle" className={s.inkText} style={{ fontSize: "11px" }}>
          {`${t.page} ${i + 1} ${t.of} 3`}
        </text>
      ))}
      <text x={240} y={44} textAnchor="middle" className={s.small}>
        {t.header}
      </text>
      <path className={`${s.mute} ${s.dash}`} d={`M206 50 L ${xs[0] + 60} ${top + 60}`} />
      <path className={`${s.mute} ${s.dash}`} d={`M240 50 L ${xs[1] + 60} ${top + 12}`} />
      <path className={`${s.mute} ${s.dash}`} d={`M274 50 L ${xs[2] + 60} ${top + 12}`} />
      <path className={s.inkThin} d="M34 262 Q 240 330 446 262" />
      <Head x={446} y={262} angle={-18} ink />
      {xs.map((x) => (
        <path key={`v${x}`} className={`${s.mute} ${s.dash}`} d={`M${x + w / 2} ${arcY(x + w / 2)} V ${top + h + 2}`} />
      ))}
      <text x={240} y={322} textAnchor="middle" className={s.small}>
        {t.pass}
      </text>
    </>
  );
}

function ExactOnline({ t }: { t: CopyOf<"exact-online"> }) {
  const sources = [92, 140, 188];
  const rows = [134, 154, 174, 194, 214];
  const fresh = 1;
  return (
    <>
      <text x={40} y={78} className={s.small}>
        {t.sources}
      </text>
      {sources.map((y, i) => (
        <g key={y}>
          <rect x={40} y={y} width={96} height={32} rx={2} className={s.node} />
          <Words x0={50} y={y + 12} widths={[18, 30 - i * 6]} className={s.words} />
          <Words x0={50} y={y + 22} widths={[26 - i * 4, 14]} className={s.words} />
          <path className={s.mute} d={`M136 ${y + 16} C 166 ${y + 16}, 176 152, 202 152`} />
        </g>
      ))}
      <Head x={202} y={152} angle={0} />
      <circle cx={240} cy={152} r={35} className={s.inkNode} />
      <text x={240} y={157} textAnchor="middle" className={s.inkText}>
        {t.fetch}
      </text>
      <text x={240} y={208} textAnchor="middle" className={s.small}>
        {t.sift}
      </text>
      <path className={s.ink} d="M275 152 H 306" />
      <Head x={306} y={152} angle={0} ink />
      <text x={316} y={84} className={s.mono}>
        {t.exact}
      </text>
      <rect x={316} y={94} width={136} height={132} rx={2} className={s.node} />
      <text x={326} y={116} className={s.small}>
        {t.company}
      </text>
      <text x={398} y={116} className={s.small}>
        {t.contact}
      </text>
      <path className={s.mute} d="M316 124 H 452" />
      {rows.map((y, i) =>
        i === fresh ? (
          <path key={y} className={s.ink} d={`M326 ${y} H 386 M398 ${y} H 442`} />
        ) : (
          <path key={y} className={s.hair} d={`M326 ${y} H 386 M398 ${y} H 442`} />
        ),
      )}
      <path className={s.inkThin} d={`M452 ${rows[fresh]} C 470 ${rows[fresh]}, 470 230, 452 238`} />
      <text x={444} y={250} textAnchor="end" className={s.inkText}>
        {t.opportunity}
      </text>
      <path className={s.ink} style={{ strokeWidth: 1.6 }} d="M40 286 H 230" />
      <Head x={230} y={286} angle={0} ink />
      <text x={242} y={290} className={s.inkText}>
        {t.ready}
      </text>
    </>
  );
}

function WordpressKoppeling({ t }: { t: CopyOf<"wordpress-koppeling"> }) {
  const cx = 240;
  const cy = 186;
  const hub = 38;
  const reach = 128;
  const angles = [315, 0, 45, 90, 135];
  const portalAngle = 250;
  const label = (deg: number, x: number, y: number, text: string, className?: string) => {
    const right = deg > 10 && deg < 170;
    const left = deg > 190 && deg < 350;
    const anchor = right ? "start" : left ? "end" : "middle";
    const dx = right ? 12 : left ? -12 : 0;
    const dy = deg === 0 ? -14 : 5;
    return (
      <text x={r2(x + dx)} y={r2(y + dy)} textAnchor={anchor} className={className}>
        {text}
      </text>
    );
  };
  const [px, py] = polar(cx, cy, reach, portalAngle);
  const [pIn1x, pIn1y] = polar(cx, cy, hub + 4, portalAngle - 6);
  const [pIn2x, pIn2y] = polar(cx, cy, hub + 4, portalAngle + 6);
  const [pOut1x, pOut1y] = polar(cx, cy, reach - 8, portalAngle - 3);
  const [pOut2x, pOut2y] = polar(cx, cy, reach - 8, portalAngle + 3);
  return (
    <>
      {angles.map((deg, i) => {
        const [x, y] = polar(cx, cy, reach, deg);
        const [ex, ey] = polar(cx, cy, hub + 4, deg);
        return (
          <g key={deg}>
            <path className={`${s.mute} ${s.dash}`} d={`M${ex} ${ey} L ${r2(x)} ${r2(y)}`} />
            <circle cx={r2(x)} cy={r2(y)} r={5} className={s.node} />
            {label(deg, x, y, t.others[i], s.faintText)}
          </g>
        );
      })}
      <path className={s.ink} d={`M${pOut1x} ${pOut1y} L ${pIn1x} ${pIn1y}`} />
      <path className={s.ink} d={`M${pIn2x} ${pIn2y} L ${pOut2x} ${pOut2y}`} />
      <Head x={pIn1x} y={pIn1y} angle={portalAngle - 270} ink />
      <Head x={pOut2x} y={pOut2y} angle={portalAngle - 90} ink />
      <rect x={r2(px - 6)} y={r2(py - 6)} width={12} height={12} className={s.inkNode} />
      {label(portalAngle, px, py, t.portal, s.inkText)}
      <text x={r2(px - 12)} y={r2(py + 22)} textAnchor="end" className={s.small}>
        {t.both}
      </text>
      <circle cx={cx} cy={cy} r={hub} className={s.inkNode} />
      <text x={cx} y={cy + 5} textAnchor="middle" className={s.inkText}>
        {t.hub}
      </text>
      <path className={s.ink} d="M40 330 H 72" />
      <text x={80} y={334} className={s.small}>
        {t.built}
      </text>
      <path className={`${s.mute} ${s.dash}`} d="M180 330 H 212" />
      <text x={220} y={334} className={s.small}>
        {t.could}
      </text>
    </>
  );
}

function body(slug: DiagramSlug, lang: Locale): ReactNode {
  switch (slug) {
    case "teamsync":
      return <TeamSync t={diagramCopy.teamsync[lang]} />;
    case "strength-tracker":
      return <StrengthTracker t={diagramCopy["strength-tracker"][lang]} />;
    case "belhulp":
      return <Belhulp t={diagramCopy.belhulp[lang]} />;
    case "kdp-kleurboek":
      return <KdpKleurboek t={diagramCopy["kdp-kleurboek"][lang]} />;
    case "solana-forensics":
      return <SolanaForensics t={diagramCopy["solana-forensics"][lang]} />;
    case "offerte-pdf-generator":
      return <OffertePdf t={diagramCopy["offerte-pdf-generator"][lang]} />;
    case "exact-online":
      return <ExactOnline t={diagramCopy["exact-online"][lang]} />;
    case "wordpress-koppeling":
      return <WordpressKoppeling t={diagramCopy["wordpress-koppeling"][lang]} />;
  }
}

export function ProjectDiagram({
  slug,
  lang,
  numeral,
  decorative = false,
}: {
  slug: string;
  lang: Locale;
  numeral: string;
  decorative?: boolean;
}) {
  if (!isDiagramSlug(slug)) return null;
  const label = diagramCopy[slug][lang].alt;
  return (
    <svg
      viewBox="0 0 480 360"
      className={s.svg}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <text x={28} y={40} className={s.fig}>
        fig. {numeral}
      </text>
      {body(slug, lang)}
    </svg>
  );
}

/** Short visible caption for a project's diagram, used by figcaptions. */
export function diagramCaption(slug: string, lang: Locale): string | null {
  return isDiagramSlug(slug) ? diagramCopy[slug][lang].caption : null;
}
