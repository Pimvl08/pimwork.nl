"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { readGlColor } from "@/lib/theme";
import { DUST_WORDS, labCopy } from "./copy";
import {
  ageWaves,
  createDust,
  MAX_WORD,
  particleCount,
  sampleTargets,
  sanitizeWord,
  setTargets,
  stepDust,
  type DustState,
  type Pointer,
  type Wave,
} from "./dust";
import { cssVar, mulberry32 } from "./logic";
import type { ExperimentProps } from "./types";
import styles from "./lab.module.css";

const VERT = `
attribute vec2 a_pos;
attribute float a_seed;
uniform vec2 u_res;
uniform float u_dpr;
varying float v_alpha;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = (1.2 + a_seed * 1.7) * u_dpr;
  v_alpha = 0.38 + a_seed * 0.62;
}`;

const FRAG = `
precision mediump float;
uniform vec3 u_ink;
varying float v_alpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.18, d) * v_alpha;
  gl_FragColor = vec4(u_ink * a, a);
}`;

interface Engine {
  setWord(word: string): void;
  setActive(active: boolean): void;
  pointerMove(x: number, y: number): void;
  pointerLeave(): void;
  press(x: number, y: number): void;
  release(): void;
  shock(x: number, y: number): void;
  dispose(): void;
}

function fontFamily(): string {
  const bodoni = cssVar("--font-bodoni", "");
  return bodoni ? `${bodoni}, Georgia, serif` : "Georgia, serif";
}

/** Draws `word` into an offscreen canvas and samples `count` targets from it. */
function targetsFor(word: string, width: number, height: number, count: number, seed: number): Float32Array {
  const scale = Math.min(1, 900 / Math.max(width, 1));
  const w = Math.max(32, Math.round(width * scale));
  const h = Math.max(32, Math.round(height * scale));
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(count * 2);
  const family = fontFamily();
  ctx.font = `400 100px ${family}`;
  const m = ctx.measureText(word);
  const ratio = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100 || 0.8;
  const size = Math.min((h * 0.66) / ratio, ((w * 0.84) / Math.max(m.width, 1)) * 100);
  ctx.font = `400 ${size}px ${family}`;
  const mm = ctx.measureText(word);
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  const baseline = h / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2;
  ctx.fillText(word, w / 2, baseline);
  const data = ctx.getImageData(0, 0, w, h).data;
  const t = sampleTargets(data, w, h, count, mulberry32(seed), 2);
  for (let i = 0; i < t.length; i++) t[i] /= scale;
  return t;
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createEngine(canvas: HTMLCanvasElement, opts: { word: string; reducedMotion: boolean; coarse: boolean; onFail: () => void }): Engine {
  const rng = mulberry32(2817);
  const rect = canvas.getBoundingClientRect();
  let width = Math.max(1, rect.width);
  let height = Math.max(1, rect.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  const n = particleCount(width, height, dpr, opts.coarse);
  const state: DustState = createDust(n, width, height, rng);
  const xy = new Float32Array(n * 2);
  const pointer: Pointer = { x: 0, y: 0, inside: false, holding: false };
  let waves: Wave[] = [];
  let word = opts.word;
  let active = false;
  let raf = 0;
  let last = 0;
  let calm = 0;
  let disposed = false;
  let holdTimer = 0;
  let pressed = false;

  // Renderer: WebGL points, or a Canvas 2D fallback.
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false });
  let program: WebGLProgram | null = null;
  let posBuf: WebGLBuffer | null = null;
  let seedBuf: WebGLBuffer | null = null;
  let uRes: WebGLUniformLocation | null = null;
  let uDpr: WebGLUniformLocation | null = null;
  let uInk: WebGLUniformLocation | null = null;
  let ctx2d: CanvasRenderingContext2D | null = null;
  let ink: [number, number, number] = readGlColor("--gl-ink");
  let ink2d = cssVar("--ink");

  if (gl) {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram();
    if (program && vs && fs) {
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    }
    if (!program || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
      program = null;
    } else {
      gl.useProgram(program);
      posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, xy.byteLength, gl.DYNAMIC_DRAW);
      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      const seeds = new Float32Array(n);
      for (let i = 0; i < n; i++) seeds[i] = rng() ** 1.6;
      seedBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
      const aSeed = gl.getAttribLocation(program, "a_seed");
      gl.enableVertexAttribArray(aSeed);
      gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(program, "u_res");
      uDpr = gl.getUniformLocation(program, "u_dpr");
      uInk = gl.getUniformLocation(program, "u_ink");
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    }
  }
  if (!program) {
    ctx2d = canvas.getContext("2d");
    if (!ctx2d) opts.onFail();
  }

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    const sx = w / width;
    const sy = h / height;
    for (let i = 0; i < n; i++) {
      state.px[i] *= sx;
      state.py[i] *= sy;
    }
    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    retarget(opts.reducedMotion);
  };

  const render = () => {
    for (let i = 0; i < n; i++) {
      xy[i * 2] = state.px[i];
      xy[i * 2 + 1] = state.py[i];
    }
    if (gl && program) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uDpr, dpr);
      gl.uniform3f(uInk, ink[0], ink[1], ink[2]);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, xy);
      gl.drawArrays(gl.POINTS, 0, n);
    } else if (ctx2d) {
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, width, height);
      ctx2d.fillStyle = ink2d;
      ctx2d.globalAlpha = 0.7;
      for (let i = 0; i < n; i++) ctx2d.fillRect(xy[i * 2], xy[i * 2 + 1], 1.5, 1.5);
      ctx2d.globalAlpha = 1;
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (disposed || !active) return;
    const dt = Math.min(0.033, Math.max(0.001, (now - (last || now)) / 1000));
    last = now;
    stepDust(state, pointer, waves, dt, Math.min(1.4, Math.max(0.6, width / 900)));
    waves = ageWaves(waves, dt);
    render();
    let energy = 0;
    for (let i = 0; i < n; i += 7) energy += state.vx[i] * state.vx[i] + state.vy[i] * state.vy[i];
    calm = energy / (n / 7) < 0.5 && waves.length === 0 && !pointer.holding ? calm + 1 : 0;
    // Sleep once the dust has settled and nothing is pushing it.
    if (calm > 45 && !pointer.inside) return;
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (opts.reducedMotion) {
      render();
      return;
    }
    calm = 0;
    if (!raf && active && !disposed) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  function retarget(snap: boolean) {
    const t = targetsFor(word, width, height, n, word.length * 131 + 7);
    setTargets(state, t, snap);
    wake();
  }

  const shock = (x: number, y: number) => {
    if (opts.reducedMotion) return;
    waves = [...waves.slice(-3), { x, y, age: 0 }];
    wake();
  };

  const onTheme = () => {
    ink = readGlColor("--gl-ink");
    ink2d = cssVar("--ink");
    render();
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  window.addEventListener("pim:theme", onTheme);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  // Bodoni may still be loading; resample once it is there.
  retarget(opts.reducedMotion);
  document.fonts?.load(`400 100px ${fontFamily()}`).then(() => {
    if (!disposed) retarget(opts.reducedMotion);
  }).catch(() => {});

  return {
    setWord(next) {
      if (next === word) return;
      word = next;
      if (!opts.reducedMotion) {
        for (let i = 0; i < n; i++) {
          state.vx[i] += (rng() - 0.5) * 260;
          state.vy[i] += (rng() - 0.5) * 260;
        }
      }
      retarget(opts.reducedMotion);
    },
    setActive(next) {
      active = next;
      if (active) wake();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    pointerMove(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.inside = true;
      wake();
    },
    pointerLeave() {
      pointer.inside = false;
      pointer.holding = false;
      pressed = false;
      window.clearTimeout(holdTimer);
      wake();
    },
    press(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.inside = true;
      pressed = true;
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        if (pressed) {
          pointer.holding = true;
          wake();
        }
      }, 220);
      wake();
    },
    release() {
      window.clearTimeout(holdTimer);
      const wasHolding = pointer.holding;
      pointer.holding = false;
      if (pressed && !wasHolding) shock(pointer.x, pointer.y);
      pressed = false;
      wake();
    },
    shock,
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      ro.disconnect();
      window.removeEventListener("pim:theme", onTheme);
      if (gl) {
        if (posBuf) gl.deleteBuffer(posBuf);
        if (seedBuf) gl.deleteBuffer(seedBuf);
        if (program) gl.deleteProgram(program);
        // Release the context only on a real unmount: a remount in development
        // reuses this canvas and must still find a live context.
        window.setTimeout(() => {
          if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
        }, 0);
      }
    },
  };
}

/** Experiment 01: a word made of graphite dust that you can sweep through. */
export default function GraphiteDust({ lang, active, reducedMotion }: ExperimentProps) {
  const t = labCopy.dust[lang];
  const alt = labCopy.experiments[lang][0].alt;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const virtual = useRef({ x: -1, y: -1 });
  const [word, setWord] = useState("Pim");
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState(false);
  const wordRef = useRef(word);
  const activeRef = useRef(active);
  const inputId = useId();
  const hintId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const engine = createEngine(canvas, { word: wordRef.current, reducedMotion, coarse, onFail: () => setFailed(true) });
    engineRef.current = engine;
    engine.setActive(activeRef.current);
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    wordRef.current = word;
    engineRef.current?.setWord(word);
  }, [word]);

  useEffect(() => {
    activeRef.current = active;
    engineRef.current?.setActive(active);
  }, [active]);

  const local = (event: PointerEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  };

  const placeMark = (x: number, y: number) => {
    if (markRef.current) markRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current;
    const engine = engineRef.current;
    if (!surface || !engine) return;
    const r = surface.getBoundingClientRect();
    if (virtual.current.x < 0) virtual.current = { x: r.width / 2, y: r.height / 2 };
    const step = event.shiftKey ? 64 : 24;
    const v = virtual.current;
    if (event.key === "ArrowLeft") v.x -= step;
    else if (event.key === "ArrowRight") v.x += step;
    else if (event.key === "ArrowUp") v.y -= step;
    else if (event.key === "ArrowDown") v.y += step;
    else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      engine.shock(v.x, v.y);
      return;
    } else if (event.key === "Escape") {
      engine.pointerLeave();
      return;
    } else return;
    event.preventDefault();
    v.x = Math.min(r.width, Math.max(0, v.x));
    v.y = Math.min(r.height, Math.max(0, v.y));
    placeMark(v.x, v.y);
    engine.pointerMove(v.x, v.y);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = sanitizeWord(draft);
    if (clean) setWord(clean);
  };

  const clean = sanitizeWord(draft);

  return (
    <div className={styles.exp}>
      <div
        ref={surfaceRef}
        className={styles.surface}
        tabIndex={0}
        role="group"
        aria-roledescription={labCopy.stageRole[lang]}
        aria-label={`${t.stage}. ${alt}`}
        aria-describedby={hintId}
        onPointerMove={(e) => {
          const p = local(e);
          engineRef.current?.pointerMove(p.x, p.y);
        }}
        onPointerDown={(e) => {
          const p = local(e);
          engineRef.current?.press(p.x, p.y);
        }}
        onPointerUp={() => engineRef.current?.release()}
        onPointerLeave={() => engineRef.current?.pointerLeave()}
        onPointerCancel={() => engineRef.current?.pointerLeave()}
        onBlur={() => engineRef.current?.pointerLeave()}
        onKeyDown={onKey}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <span ref={markRef} className={styles.vpointer} aria-hidden="true" />
        <span id={hintId} className={styles.srOnly}>
          {labCopy.experiments[lang][0].keyboard} {word}
        </span>
        {failed ? <p className={styles.note}>{t.fallback}</p> : null}
      </div>
      <div className={styles.controls}>
        <div className={styles.group} role="group" aria-label={t.words}>
          {DUST_WORDS.map((w) => (
            <button key={w} type="button" className={styles.chip} aria-pressed={word === w} onClick={() => setWord(w)}>
              {w}
            </button>
          ))}
        </div>
        <form className={styles.field} onSubmit={onSubmit}>
          <label htmlFor={inputId} className={styles.srOnly}>
            {t.custom} ({t.hint})
          </label>
          <input
            id={inputId}
            className={styles.input}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_WORD * 2}
            placeholder={t.custom}
            title={t.hint}
            value={draft}
            onChange={(e) => setDraft(sanitizeWord(e.target.value))}
          />
          <CircleButton icon="arrowRight" label={t.apply} size="md" type="submit" disabled={!clean || clean === word} />
        </form>
      </div>
    </div>
  );
}
