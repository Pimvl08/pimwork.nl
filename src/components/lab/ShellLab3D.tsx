"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { creaseStates } from "@/lib/crease";
import { cn } from "@/lib/cn";
import styles from "./lab.module.css";
import { describeShell, shellCopy, type ShellStateKey } from "./shell3d-copy";
import { createShellScene, type ShellScene } from "./shell3d-scene";
import type { ExperimentProps } from "./types";

function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

const STATES: ShellStateKey[] = [
  "flat",
  "curving",
  "stable",
  "buckled",
  "reversed",
];
const ORBIT_STEP = Math.PI / 24;
const ZOOM_STEP = 0.9;

export default function ShellLab3D({
  lang,
  active,
  reducedMotion,
}: ExperimentProps) {
  const copy = shellCopy;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ShellScene | null>(null);
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [failed, setFailed] = useState(() => !hasWebGL());
  const [fold, setFold] = useState(creaseStates.stable.fold);
  const [side, setSide] = useState<1 | -1>(1);
  const [locked, setLocked] = useState(false);
  const [wire, setWire] = useState(false);
  const [state, setState] = useState<ShellStateKey | null>("stable");
  const [said, setSaid] = useState("");
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // Create the scene once; props flow in through the effects below.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || failed) return;
    // A fresh canvas per mount: a disposed renderer loses its context for good.
    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    surface.prepend(canvas);
    let scene: ShellScene;
    try {
      scene = createShellScene({
        canvas,
        surface,
        reducedMotion,
        cursorLabel: shellCopy.cursor[langRef.current],
        onSettled: (p) => {
          setFold(Math.round(p.fold * 100) / 100);
          setSide(p.side);
        },
      });
    } catch {
      canvas.remove();
      window.setTimeout(() => setFailed(true), 0);
      return;
    }
    sceneRef.current = scene;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) scene.resize(Math.round(box.width), Math.round(box.height));
    });
    ro.observe(surface);
    const rect = surface.getBoundingClientRect();
    scene.resize(Math.round(rect.width), Math.round(rect.height));
    return () => {
      ro.disconnect();
      scene.dispose();
      canvas.remove();
      sceneRef.current = null;
    };
    // The scene is built once; later prop changes go through setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => sceneRef.current?.setActive(active), [active, failed]);
  useEffect(
    () => sceneRef.current?.setReducedMotion(reducedMotion),
    [reducedMotion],
  );
  useEffect(
    () => sceneRef.current?.setCursorLabel(copy.cursor[lang]),
    [lang, copy],
  );

  const announce = (
    next: Partial<{
      state: ShellStateKey | null;
      fold: number;
      side: 1 | -1;
      locked: boolean;
      wire: boolean;
    }>,
  ) => {
    setSaid(describeShell(lang, { state, fold, side, locked, wire, ...next }));
  };

  const onBend = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setFold(value);
    setState(null);
    sceneRef.current?.setFold(value);
    announce({ fold: value, state: null });
  };

  const onFlip = () => {
    const next = side === 1 ? -1 : 1;
    setSide(next);
    setState(null);
    sceneRef.current?.flip();
    announce({ side: next, state: null });
  };

  const onLock = () => {
    const next = !locked;
    setLocked(next);
    sceneRef.current?.setLocked(next);
    announce({ locked: next });
  };

  const onWire = () => {
    const next = !wire;
    setWire(next);
    sceneRef.current?.setWireframe(next);
    announce({ wire: next });
  };

  const choose = (key: ShellStateKey) => {
    const target = creaseStates[key];
    setState(key);
    setFold(target.fold);
    setSide(target.side);
    sceneRef.current?.goTo(key);
    announce({ state: key, fold: target.fold, side: target.side });
  };

  // Roving focus inside the radio group, like native radios.
  const onRadioKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + STATES.length) % STATES.length;
    radioRefs.current[next]?.focus();
    choose(STATES[next]);
  };

  const onSurfaceKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => scene.orbit(-ORBIT_STEP, 0),
      ArrowRight: () => scene.orbit(ORBIT_STEP, 0),
      ArrowUp: () => scene.orbit(0, -ORBIT_STEP * 0.6),
      ArrowDown: () => scene.orbit(0, ORBIT_STEP * 0.6),
      "+": () => scene.zoom(ZOOM_STEP),
      "=": () => scene.zoom(ZOOM_STEP),
      "-": () => scene.zoom(1 / ZOOM_STEP),
      _: () => scene.zoom(1 / ZOOM_STEP),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const tabbable = state ?? "stable";
  const pct = Math.round(fold * 100);

  return (
    <div className={styles.exp}>
      <div
        ref={surfaceRef}
        className={styles.surface}
        style={{ cursor: "default" }}
        tabIndex={0}
        role="application"
        aria-roledescription={lang === "nl" ? "3D-proef" : "3D experiment"}
        aria-label={copy.surface[lang]}
        data-cursor="default"
        data-cursor-label={copy.cursor[lang]}
        data-lenis-prevent-wheel
        onKeyDown={onSurfaceKey}
      >
        {failed && (
          <p
            className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center italic text-ink-mute measure mx-auto"
            role="alert"
          >
            {copy.noWebgl[lang]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-rule bg-raised px-3 py-2 [scrollbar-width:none] md:flex-wrap md:gap-x-3 md:px-5">
        <label className="flex shrink-0 items-center gap-2">
          <span className={styles.groupLabel}>{copy.bend[lang]}</span>
          <input
            type="range"
            className={styles.range}
            min={0}
            max={1}
            step={0.01}
            value={fold}
            onChange={onBend}
            aria-valuetext={`${pct}%`}
            disabled={failed}
          />
          <span
            className="data w-[4ch] text-right text-[length:var(--step--1)] text-ink-mute"
            aria-hidden="true"
          >
            {pct}%
          </span>
        </label>

        <button
          type="button"
          className={cn(styles.chip, "shrink-0")}
          aria-pressed={side === -1}
          onClick={onFlip}
          disabled={failed}
        >
          {copy.flip[lang]}
        </button>
        <button
          type="button"
          className={cn(styles.chip, "shrink-0")}
          aria-pressed={locked}
          onClick={onLock}
          disabled={failed}
        >
          {copy.lock[lang]}
        </button>

        <div
          role="radiogroup"
          aria-label={copy.compare[lang]}
          className="flex shrink-0 items-center gap-1.5"
        >
          <span className={styles.groupLabel} aria-hidden="true">
            {copy.compare[lang]}
          </span>
          {STATES.map((key, index) => (
            <button
              key={key}
              ref={(el) => {
                radioRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={state === key}
              tabIndex={key === tabbable ? 0 : -1}
              className={cn(styles.chip, "shrink-0")}
              onClick={() => choose(key)}
              onKeyDown={(e) => onRadioKey(e, index)}
              disabled={failed}
            >
              {copy.states[key][lang]}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={cn(styles.chip, "shrink-0")}
          aria-pressed={wire}
          onClick={onWire}
          disabled={failed}
        >
          {copy.wire[lang]}
        </button>
        <button
          type="button"
          className={cn(styles.chip, "shrink-0")}
          onClick={() => sceneRef.current?.resetCamera()}
          disabled={failed}
        >
          {copy.reset[lang]}
        </button>
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {said}
      </p>
    </div>
  );
}
