"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { projects } from "@/content/projects";
import { cn } from "@/lib/cn";
import styles from "./lab.module.css";
import { physicsCopy, projectsLabel } from "./physics-copy";
import {
  countTechnologies,
  fitLabel,
  radiusFor,
  scaleFor,
  type LabelFit,
} from "./physics-data";
import {
  advance,
  allSleeping,
  bodyAt,
  createBody,
  createWorld,
  endDrag,
  flipGravity,
  layoutBodies,
  moveDrag,
  nudgeGravity,
  radialImpulse,
  resizeWorld,
  settle,
  shake,
  startDrag,
  type World,
} from "./physics-engine";
import type { ExperimentProps } from "./types";

interface Palette {
  ink: string;
  soft: string;
  mute: string;
  faint: string;
  rule: string;
  ruleStrong: string;
  disc: string;
  serif: string;
  mono: string;
}

function readPalette(el: Element): Palette {
  const root = getComputedStyle(document.documentElement);
  const local = getComputedStyle(el);
  const v = (name: string) => root.getPropertyValue(name).trim();
  return {
    ink: v("--ink"),
    soft: v("--ink-soft"),
    mute: v("--ink-mute"),
    faint: v("--ink-faint"),
    rule: v("--rule"),
    ruleStrong: v("--rule-strong"),
    disc: v("--paper-raised"),
    serif: local.fontFamily || "serif",
    mono: local.getPropertyValue("--font-mono").trim() || "monospace",
  };
}

/** Strong ease-out, matching the --ease-out-expo token (0.16, 1, 0.3, 1). */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

const DPR_CAP = 2;
const ARC_DRAW_MS = 700;

export default function PhysicsJar({
  lang,
  active,
  reducedMotion,
}: ExperimentProps) {
  const copy = physicsCopy;
  const techs = useMemo(() => countTechnologies(projects), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [said, setSaid] = useState("");

  // Mutable simulation state lives in one ref so the loop never re-renders React.
  const sim = useRef({
    world: null as World | null,
    scale: 1,
    cssW: 0,
    cssH: 0,
    dpr: 1,
    palette: null as Palette | null,
    labels: [] as LabelFit[],
    hovered: -1,
    raf: 0,
    last: 0,
    arcStart: 0,
    pointerId: -1,
    down: null as { x: number; y: number } | null,
    samples: [] as { t: number; x: number; y: number }[],
    active,
    reduced: reducedMotion,
    seed: 1,
    frame: null as ((now: number) => void) | null,
  });

  const say = useCallback((text: string) => {
    // Re-set so repeated messages are announced again.
    setSaid("");
    window.setTimeout(() => setSaid(text), 30);
  }, []);

  /** Measures every label with the current serif, in units of font size. */
  const measureLabels = useCallback(() => {
    const s = sim.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !s.palette) return;
    ctx.save();
    ctx.font = `100px ${s.palette.serif}`;
    s.labels = techs.map((t) =>
      fitLabel(t.name, (text) => ctx.measureText(text).width / 100),
    );
    ctx.restore();
  }, [techs]);

  const draw = useCallback(
    (now: number) => {
      const s = sim.current;
      const canvas = canvasRef.current;
      const world = s.world;
      const p = s.palette;
      if (!canvas || !world || !p) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const k = s.scale;
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      ctx.clearRect(0, 0, s.cssW, s.cssH);

      // The bowl: walls and the compass arc, drawn on like a pen line.
      const { cx, cy, R } = world.bowl;
      const footAngle = Math.asin(Math.min(1, world.width / 2 / R));
      const a0 = Math.PI / 2 + footAngle;
      const a1 = Math.PI / 2 - footAngle;
      const progress = s.reduced
        ? 1
        : easeOutExpo(Math.min(1, (now - s.arcStart) / ARC_DRAW_MS));
      const footY = (cy + Math.cos(footAngle) * R) * k;
      ctx.lineWidth = 1;
      ctx.strokeStyle = p.rule;
      ctx.beginPath();
      ctx.moveTo(0.5, 0);
      ctx.lineTo(0.5, footY * progress);
      ctx.moveTo(s.cssW - 0.5, 0);
      ctx.lineTo(s.cssW - 0.5, footY * progress);
      ctx.stroke();
      ctx.strokeStyle = p.ruleStrong;
      ctx.beginPath();
      ctx.arc(cx * k, cy * k, R * k - 0.5, a0, a0 + (a1 - a0) * progress, true);
      ctx.stroke();

      // Gravity needle, top left, like a small compass.
      const g = world.gravity;
      const gl = Math.hypot(g.x, g.y) || 1;
      // Bottom left corner, outside the bowl.
      const nx = 22;
      const ny = s.cssH - 22;
      ctx.strokeStyle = p.faint;
      ctx.beginPath();
      ctx.arc(nx, ny, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = p.mute;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(nx - (g.x / gl) * 4, ny - (g.y / gl) * 4);
      ctx.lineTo(nx + (g.x / gl) * 10, ny + (g.y / gl) * 10);
      ctx.stroke();
      ctx.fillStyle = p.mute;
      ctx.beginPath();
      ctx.arc(nx + (g.x / gl) * 10, ny + (g.y / gl) * 10, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Discs.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const held = world.drag?.id ?? -1;
      for (let i = 0; i < world.bodies.length; i++) {
        const b = world.bodies[i];
        const x = b.x * k;
        const y = b.y * k;
        const r = b.r * k;
        const marked = b.id === held || b.id === s.hovered;
        ctx.fillStyle = p.disc;
        ctx.strokeStyle = marked ? p.ink : p.soft;
        ctx.lineWidth = marked ? 1.6 : 1;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
        ctx.fill();
        if (!marked) ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Inner crease ring with a tick that turns with the disc.
        ctx.strokeStyle = marked ? p.ink : p.faint;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.86, b.angle + 0.35, b.angle + Math.PI * 2 - 0.35);
        ctx.stroke();

        const fit = s.labels[i];
        if (!fit) continue;
        const size = Math.max(5.5, fit.size * r);
        const countSize = Math.max(5, size * 0.72);
        const lineH = size * 1.08;
        const block = fit.lines.length * lineH + countSize * 0.9;
        let ty = y - block / 2 + lineH / 2;
        ctx.fillStyle = marked ? p.ink : p.soft;
        ctx.font = `${size.toFixed(2)}px ${p.serif}`;
        for (const line of fit.lines) {
          ctx.fillText(line, x, ty);
          ty += lineH;
        }
        ctx.fillStyle = p.mute;
        ctx.font = `${countSize.toFixed(2)}px ${p.mono}`;
        ctx.fillText(
          String(techs[i].count),
          x,
          ty - lineH / 2 + countSize * 0.75,
        );
      }
    },
    [techs],
  );

  const frame = useCallback(
    (now: number) => {
      const s = sim.current;
      s.raf = 0;
      const world = s.world;
      if (!world) return;
      const dt = s.last ? (now - s.last) / 1000 : 1 / 60;
      s.last = now;
      advance(world, dt);
      draw(now);
      const drawing = !s.reduced && now - s.arcStart < ARC_DRAW_MS;
      const busy = world.drag !== null || !allSleeping(world) || drawing;
      if (busy && s.active && !document.hidden && s.frame)
        s.raf = requestAnimationFrame(s.frame);
      else s.last = 0;
    },
    [draw],
  );

  useEffect(() => {
    sim.current.frame = frame;
  }, [frame]);

  /** Starts the loop if it is allowed and not running. */
  const kick = useCallback(() => {
    const s = sim.current;
    if (s.raf || !s.active || document.hidden) return;
    s.last = 0;
    s.raf = requestAnimationFrame(frame);
  }, [frame]);

  /** Reduced motion: jump straight to the resting pile and draw it once. */
  const settleNow = useCallback(() => {
    const s = sim.current;
    if (!s.world) return;
    settle(s.world, 30);
    draw(performance.now());
  }, [draw]);

  const afterChange = useCallback(() => {
    if (sim.current.reduced && !sim.current.world?.drag) settleNow();
    else kick();
  }, [kick, settleNow]);

  // Size, world creation and resize.
  useEffect(() => {
    const surface = surfaceRef.current;
    const canvas = canvasRef.current;
    if (!surface || !canvas) return;
    const s = sim.current;
    s.palette = readPalette(canvas);
    measureLabels();
    const radii = techs.map((t) => radiusFor(t.count));

    const resize = () => {
      const rect = surface.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === s.cssW && h === s.cssH) return;
      s.cssW = w;
      s.cssH = h;
      s.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.round(w * s.dpr);
      canvas.height = Math.round(h * s.dpr);
      s.scale = scaleFor(w, h, radii, w < 560 ? 0.5 : 0.4);
      const ww = w / s.scale;
      const wh = h / s.scale;
      if (!s.world) {
        s.world = createWorld(
          ww,
          wh,
          radii.map((r, i) => createBody(i, 0, 0, r)),
        );
        layoutBodies(s.world, s.seed);
        s.arcStart = performance.now();
        if (s.reduced) settle(s.world, 30);
      } else {
        resizeWorld(s.world, ww, wh);
        if (s.reduced) settle(s.world, 30);
      }
      draw(performance.now());
      kick();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(surface);

    const onTheme = () => {
      s.palette = readPalette(canvas);
      draw(performance.now());
    };
    window.addEventListener("pim:theme", onTheme);
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      s.palette = readPalette(canvas);
      measureLabels();
      draw(performance.now());
    });
    const onVisible = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Touch on a disc must not scroll the page; touch elsewhere still scrolls.
    const onTouchStart = (event: TouchEvent) => {
      const world = s.world;
      const touch = event.touches[0];
      if (!world || !touch) return;
      const rect = canvas.getBoundingClientRect();
      const hit = bodyAt(
        world,
        (touch.clientX - rect.left) / s.scale,
        (touch.clientY - rect.top) / s.scale,
        0.15,
      );
      if (hit) event.preventDefault();
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });

    return () => {
      alive = false;
      ro.disconnect();
      window.removeEventListener("pim:theme", onTheme);
      document.removeEventListener("visibilitychange", onVisible);
      canvas.removeEventListener("touchstart", onTouchStart);
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [draw, kick, measureLabels, techs]);

  // Pause and resume with the Lab plate.
  useEffect(() => {
    const s = sim.current;
    s.active = active;
    if (active) kick();
    else if (s.raf) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.last = 0;
    }
  }, [active, kick]);

  // Switching to reduced motion settles the pile at once.
  useEffect(() => {
    sim.current.reduced = reducedMotion;
    if (reducedMotion) settleNow();
  }, [reducedMotion, settleNow]);

  const toWorld = (event: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const k = sim.current.scale;
    return {
      x: (event.clientX - rect.left) / k,
      y: (event.clientY - rect.top) / k,
    };
  };

  const setCursor = (grab: boolean) => {
    const el = surfaceRef.current;
    if (!el) return;
    el.setAttribute(
      "data-cursor-label",
      grab ? copy.cursorGrab[lang] : copy.cursorPush[lang],
    );
    el.style.cursor = grab
      ? sim.current.world?.drag
        ? "grabbing"
        : "grab"
      : "crosshair";
  };

  const setHover = (index: number) => {
    const s = sim.current;
    if (s.hovered === index) return;
    s.hovered = index;
    setHovered(index >= 0 ? index : null);
    if (!s.raf) draw(performance.now());
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = sim.current;
    const world = s.world;
    if (!world || s.pointerId !== -1) return;
    const p = toWorld(event);
    const hit = bodyAt(
      world,
      p.x,
      p.y,
      event.pointerType === "touch" ? 0.15 : 0,
    );
    s.pointerId = event.pointerId;
    s.down = { x: event.clientX, y: event.clientY };
    if (hit) {
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.style.touchAction = "none";
      startDrag(world, hit, p.x, p.y);
      s.samples = [{ t: performance.now(), x: p.x, y: p.y }];
      setHover(hit.id);
      setCursor(true);
      kick();
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = sim.current;
    const world = s.world;
    if (!world) return;
    const p = toWorld(event);
    if (world.drag && event.pointerId === s.pointerId) {
      moveDrag(world, p.x, p.y);
      const now = performance.now();
      s.samples.push({ t: now, x: p.x, y: p.y });
      while (s.samples.length > 2 && now - s.samples[0].t > 90)
        s.samples.shift();
      kick();
      return;
    }
    if (event.pointerType === "mouse") {
      const hit = bodyAt(world, p.x, p.y);
      setHover(hit ? hit.id : -1);
      setCursor(Boolean(hit));
    }
  };

  const finishPointer = (
    event: PointerEvent<HTMLCanvasElement>,
    cancelled: boolean,
  ) => {
    const s = sim.current;
    const world = s.world;
    if (!world || event.pointerId !== s.pointerId) return;
    s.pointerId = -1;
    const el = event.currentTarget;
    if (world.drag) {
      let vx = 0;
      let vy = 0;
      const first = s.samples[0];
      const last = s.samples[s.samples.length - 1];
      if (!cancelled && first && last && last.t - first.t > 8) {
        const dt = (last.t - first.t) / 1000;
        vx = (last.x - first.x) / dt;
        vy = (last.y - first.y) / dt;
      }
      endDrag(world, vx, vy);
      if (el.hasPointerCapture(event.pointerId))
        el.releasePointerCapture(event.pointerId);
      el.style.touchAction = "";
      setCursor(event.pointerType === "mouse");
      afterChange();
    } else if (!cancelled && s.down) {
      const moved = Math.hypot(
        event.clientX - s.down.x,
        event.clientY - s.down.y,
      );
      if (moved < 8) {
        const p = toWorld(event);
        if (radialImpulse(world, p.x, p.y, 2.4, 7) > 0) {
          say(copy.said.pushed[lang]);
          afterChange();
        }
      }
    }
    s.down = null;
  };

  const doShake = () => {
    const world = sim.current.world;
    if (!world || reducedMotion) return;
    shake(world, 7);
    say(copy.said.shook[lang]);
    kick();
  };

  const doFlip = () => {
    const world = sim.current.world;
    if (!world) return;
    flipGravity(world);
    const up = world.gravity.y < 0;
    setFlipped(up);
    say(up ? copy.said.flipUp[lang] : copy.said.flipDown[lang]);
    afterChange();
  };

  const doReset = () => {
    const s = sim.current;
    const world = s.world;
    if (!world) return;
    s.seed += 1;
    world.gravity = { x: 0, y: Math.abs(world.gravity.y) || 9.8 };
    world.drag = null;
    setFlipped(false);
    layoutBodies(world, s.seed);
    s.arcStart = performance.now();
    say(copy.said.reset[lang]);
    afterChange();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const world = sim.current.world;
    if (!world) return;
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const dir = dirs[event.key];
    if (dir) {
      event.preventDefault();
      nudgeGravity(world, dir[0], dir[1]);
      setFlipped(world.gravity.y < 0);
      say(copy.said.tilt[lang]);
      afterChange();
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (reducedMotion) say(copy.shakeOff[lang]);
      else doShake();
    }
  };

  const hoveredTech = hovered !== null ? techs[hovered] : null;

  const table = (
    <table className="w-full border-collapse text-left text-[length:var(--step--1)]">
      <caption className="pb-2 text-left italic text-ink-mute">
        {copy.tableCaption[lang]}
      </caption>
      <thead>
        <tr className="border-b border-rule-strong">
          <th
            scope="col"
            className="py-1.5 pr-3 font-normal italic text-ink-mute"
          >
            {copy.colTech[lang]}
          </th>
          <th
            scope="col"
            className="py-1.5 pr-3 font-normal italic text-ink-mute"
          >
            {copy.colCount[lang]}
          </th>
          <th scope="col" className="py-1.5 font-normal italic text-ink-mute">
            {copy.colWhere[lang]}
          </th>
        </tr>
      </thead>
      <tbody>
        {techs.map((t) => (
          <tr key={t.name} className="border-b border-rule align-top">
            <th scope="row" className="py-1.5 pr-3 font-normal text-ink">
              {t.name}
            </th>
            <td className="data py-1.5 pr-3 text-ink-soft">{t.count}</td>
            <td className="py-1.5 text-ink-mute">{t.projects.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div ref={rootRef} className={styles.exp}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={surfaceRef}
          className={styles.surface}
          tabIndex={0}
          role="application"
          aria-label={copy.surface[lang]}
          aria-roledescription={
            lang === "nl" ? "natuurkundeproef" : "physics experiment"
          }
          onKeyDown={onKeyDown}
        >
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            aria-hidden="true"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => finishPointer(e, false)}
            onPointerCancel={(e) => finishPointer(e, true)}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse" && !sim.current.world?.drag)
                setHover(-1);
            }}
          />
        </div>
        {showTable && (
          <div
            id="stapel-tabel"
            className="absolute inset-0 overflow-auto bg-raised px-[clamp(1rem,4cqi,2rem)] py-4"
          >
            {table}
          </div>
        )}
      </div>

      <div className="flex flex-col border-t border-rule bg-raised md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] md:flex-wrap md:px-5">
          <button
            type="button"
            className={cn(styles.chip, "shrink-0")}
            onClick={doShake}
            disabled={reducedMotion}
            title={reducedMotion ? copy.shakeOff[lang] : undefined}
          >
            {copy.shake[lang]}
          </button>
          <button
            type="button"
            className={cn(styles.chip, "shrink-0")}
            aria-pressed={flipped}
            onClick={doFlip}
          >
            {copy.flip[lang]}
          </button>
          <button
            type="button"
            className={cn(styles.chip, "shrink-0")}
            onClick={doReset}
          >
            {copy.reset[lang]}
          </button>
          <button
            type="button"
            className={cn(styles.chip, "shrink-0")}
            aria-pressed={showTable}
            aria-controls="stapel-tabel"
            onClick={() => setShowTable((v) => !v)}
          >
            {copy.table[lang]}
          </button>
        </div>
        <p
          className="min-w-0 truncate px-4 pb-2 text-[length:var(--step--1)] italic text-ink-mute md:ml-auto md:pb-0 md:pr-5"
          aria-hidden="true"
        >
          {hoveredTech ? (
            <>
              <span className="text-ink">{hoveredTech.name}</span>
              {" · "}
              {projectsLabel(lang, hoveredTech.count)}
            </>
          ) : (
            copy.hint[lang]
          )}
        </p>
      </div>

      {!showTable && <div className={styles.srOnly}>{table}</div>}
      <p className={styles.srOnly} aria-live="polite">
        {said}
      </p>
    </div>
  );
}
