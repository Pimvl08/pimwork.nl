"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { labCopy } from "./copy";
import { cssVar } from "./logic";
import {
  drawingToSvg,
  drawPartial,
  generateDrawing,
  newSeed,
  totalLength,
  type Drawing,
  type Symmetry,
} from "./passer";
import type { ExperimentProps } from "./types";
import styles from "./lab.module.css";

const SYMMETRIES: Symmetry[] = ["none", "mirror", "rotational"];
const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Experiment 04: a seeded compass drawing, drawn as if by a pen. */
export default function Passerwerk({
  lang,
  active,
  reducedMotion,
}: ExperimentProps) {
  const t = labCopy.passer[lang];
  const alt = labCopy.experiments[lang][3].alt;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = useState(2817);
  const [density, setDensity] = useState(5);
  const [symmetry, setSymmetry] = useState<Symmetry>("none");
  const [height, setHeight] = useState(625);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const progressRef = useRef(0);
  const animateRef = useRef(true);
  const drawnRef = useRef<Drawing | null>(null);
  const densityId = useId();

  const drawing = useMemo<Drawing>(
    () => generateDrawing(seed, { density, symmetry, width: 1000, height }),
    [seed, density, symmetry, height],
  );

  // Follow the stage's aspect ratio, quantised so small resizes keep the drawing.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const ro = new ResizeObserver(() => {
      const r = surface.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const next = Math.round((1000 * r.height) / r.width / 25) * 25;
      setHeight((prev) => (prev === next ? prev : next));
    });
    ro.observe(surface);
    return () => ro.disconnect();
  }, []);

  // A new seed, density or symmetry starts the pen again.
  useEffect(() => {
    animateRef.current = true;
  }, [seed, density, symmetry]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const total = totalLength(drawing);
    let raf = 0;
    let colors = { ink: cssVar("--ink"), mute: cssVar("--ink-mute") };

    const paint = (length: number) => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const scale = Math.min(w / drawing.width, h / drawing.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(
        (w - drawing.width * scale) / 2,
        (h - drawing.height * scale) / 2,
      );
      drawPartial(ctx, drawing, length, scale, colors.ink, colors.mute);
    };

    if (drawnRef.current !== drawing) {
      // A new drawing: the pen starts over unless only the size changed.
      progressRef.current = animateRef.current && !reducedMotion ? 0 : total;
      drawnRef.current = drawing;
      animateRef.current = false;
    }
    if (reducedMotion) progressRef.current = total;
    const duration = Math.min(6500, Math.max(2400, (total / 2600) * 1000));
    let start = 0;

    const frame = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      progressRef.current = total * easeInOut(k);
      paint(progressRef.current);
      if (k < 1) raf = requestAnimationFrame(frame);
      else setDone(true);
    };

    const finished = progressRef.current >= total;
    setDone(finished);
    paint(progressRef.current);
    if (!finished && active) {
      start =
        performance.now() -
        easeInverse(progressRef.current / Math.max(total, 1)) * duration;
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => paint(progressRef.current));
    ro.observe(canvas);
    const onTheme = () => {
      colors = { ink: cssVar("--ink"), mute: cssVar("--ink-mute") };
      paint(progressRef.current);
    };
    window.addEventListener("pim:theme", onTheme);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pim:theme", onTheme);
    };
  }, [drawing, reducedMotion, active]);

  const redraw = () => {
    let next = newSeed();
    if (next === seed) next = next === 9999 ? 1000 : next + 1;
    setSeed(next);
  };

  const savePng = () => {
    setBusy(true);
    const scale = 2;
    const off = document.createElement("canvas");
    off.width = drawing.width * scale;
    off.height = drawing.height * scale;
    const ctx = off.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.fillStyle = cssVar("--paper");
    ctx.fillRect(0, 0, off.width, off.height);
    drawPartial(
      ctx,
      drawing,
      Infinity,
      scale,
      cssVar("--ink"),
      cssVar("--ink-mute"),
    );
    off.toBlob((blob) => {
      if (blob) download(blob, `passerwerk-plaat-${drawing.seed}.png`);
      setBusy(false);
    }, "image/png");
  };

  const saveSvg = () => {
    const svg = drawingToSvg(drawing, {
      paper: cssVar("--paper"),
      ink: cssVar("--ink"),
      mute: cssVar("--ink-mute"),
    });
    download(
      new Blob([svg], { type: "image/svg+xml" }),
      `passerwerk-plaat-${drawing.seed}.svg`,
    );
  };

  return (
    <div className={styles.exp}>
      <div
        ref={surfaceRef}
        className={styles.surface}
        style={{ cursor: "default", touchAction: "auto" }}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label={`${alt} ${t.plate} ${seed}.`}
        />
      </div>
      <div className={styles.controls}>
        <div className={styles.group}>
          <button type="button" className={styles.chip} onClick={redraw}>
            <span className="inline-flex items-center gap-2">
              <Icon name="shuffle" size={16} />
              {t.redraw}
            </span>
          </button>
          <button
            type="button"
            className={styles.chip}
            onClick={savePng}
            disabled={busy}
            aria-label={t.png}
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="download" size={16} />
              PNG
            </span>
          </button>
          <button
            type="button"
            className={styles.chip}
            onClick={saveSvg}
            aria-label={t.svg}
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="download" size={16} />
              SVG
            </span>
          </button>
        </div>
        <div className={styles.field}>
          <label htmlFor={densityId} className={styles.groupLabel}>
            {t.density}
          </label>
          <input
            id={densityId}
            className={styles.range}
            type="range"
            min={1}
            max={10}
            step={1}
            value={density}
            aria-valuetext={`${density} / 10`}
            onChange={(e) => setDensity(Number(e.target.value))}
          />
        </div>
        <div className={styles.group} role="group" aria-label={t.symmetry}>
          <span className={styles.groupLabel} aria-hidden="true">
            {t.symmetry}
          </span>
          {SYMMETRIES.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.chip}
              aria-pressed={symmetry === s}
              onClick={() => setSymmetry(s)}
            >
              {t[s]}
            </button>
          ))}
        </div>

        <p className={styles.caption} aria-live="polite">
          {t.plate} <span className="numeral">{seed}</span>
          <span className={styles.srOnly}>. {done ? t.done : t.drawing}</span>
        </p>
      </div>
    </div>
  );
}

/** Inverse of the ease, so a paused drawing resumes where the pen stopped. */
function easeInverse(p: number): number {
  const c = Math.min(1, Math.max(0, p));
  return Math.acos(1 - 2 * c) / Math.PI;
}
