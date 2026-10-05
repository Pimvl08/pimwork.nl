"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { useLang } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import { useInView, useReducedMotion, useVisible } from "@/lib/hooks";
import { labCopy } from "./copy";
import { arcPlacement, EXPERIMENT_COUNT, hashToIndex, indexToAnchor, nextTabIndex } from "./logic";
import styles from "./lab.module.css";

/** Paper-coloured placeholder while an experiment's code arrives. */
function StageLoading() {
  const lang = useLang();
  return (
    <div className={styles.loading} role="status">
      <svg className={styles.loadingArc} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="18" />
        <path d="M24 6 A18 18 0 0 1 42 24" />
      </svg>
      <span>{labCopy.loading[lang]}</span>
    </div>
  );
}

const loading = () => <StageLoading />;

const experiments = [
  dynamic(() => import("./GraphiteDust"), { ssr: false, loading }),
  dynamic(() => import("./ShellLab3D"), { ssr: false, loading }),
  dynamic(() => import("./PhysicsJar"), { ssr: false, loading }),
  dynamic(() => import("./Passerwerk"), { ssr: false, loading }),
  dynamic(() => import("./MassLetters"), { ssr: false, loading }),
];

const subscribeHidden = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};
const noopSubscribe = () => () => {};

function usePageHidden(): boolean {
  return useSyncExternalStore(subscribeHidden, () => document.hidden, () => false);
}

function fullscreenSupported(): boolean {
  const doc = document as FsDocument;
  return Boolean(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
}

type FsDocument = Document & { webkitFullscreenEnabled?: boolean; webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => void };

export function LabStage({ lang }: { lang: Locale }) {
  const copy = labCopy;
  const items = copy.experiments[lang];
  const [selected, setSelected] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const near = useInView(stageRef, "500px");
  const visible = useVisible(stageRef);
  const hidden = usePageHidden();
  const reducedMotion = useReducedMotion();
  const fsSupported = useSyncExternalStore(noopSubscribe, fullscreenSupported, () => false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deep links: #lab-01 .. #lab-05 select a tab, on load and on hash change.
  useEffect(() => {
    const fromHash = () => {
      const index = hashToIndex(window.location.hash);
      if (index !== null) setSelected(index);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    const doc = document as FsDocument;
    const onChange = () => {
      const current = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
      setIsFullscreen(current !== null && current === stageRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const select = useCallback((index: number, focus: boolean) => {
    setSelected(index);
    if (focus) tabRefs.current[index]?.focus();
    const url = `${window.location.pathname}${window.location.search}#${indexToAnchor(index)}`;
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = nextTabIndex(selected, event.key, EXPERIMENT_COUNT);
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  };

  const toggleFullscreen = async () => {
    const doc = document as FsDocument;
    const stage = stageRef.current as FsElement | null;
    if (!stage) return;
    try {
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else doc.webkitExitFullscreen?.();
      } else if (stage.requestFullscreen) {
        await stage.requestFullscreen();
      } else {
        stage.webkitRequestFullscreen?.();
      }
    } catch {
      // Refused by the browser (for example without a user gesture): stay inline.
    }
  };

  const active = visible && !hidden;
  const current = items[selected];
  const Experiment = experiments[selected];

  return (
    <div>
      <div className={styles.tabsWrap}>
        <svg className={styles.arc} viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M40 96 Q500 -40 960 96" />
        </svg>
        <div role="tablist" aria-label={copy.tablist[lang]} className={styles.tablist}>
          {items.map((item, index) => {
            const place = arcPlacement(index);
            const isSelected = index === selected;
            const style = { "--arc-y": `${place.y}px`, "--arc-r": `${place.rotate}deg` } as CSSProperties;
            return (
              <button
                key={item.name}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={indexToAnchor(index)}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`lab-panel-0${index + 1}`}
                tabIndex={isSelected ? 0 : -1}
                className={styles.tab}
                style={style}
                onClick={() => select(index, false)}
                onKeyDown={onTabKey}
              >
                <span className={styles.tabNum}>
                  {copy.proef[lang]} 0{index + 1}
                </span>
                <span className={styles.tabName}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={stageRef} className={styles.stage}>
        {items.map((item, index) => (
          <div
            key={item.name}
            id={`lab-panel-0${index + 1}`}
            role="tabpanel"
            aria-labelledby={indexToAnchor(index)}
            className={styles.panel}
            hidden={index !== selected}
          >
            {index === selected ? (
              near ? (
                <Experiment lang={lang} active={active} reducedMotion={reducedMotion} />
              ) : (
                <div className={styles.loading}>
                  <span>{copy.waiting[lang]}</span>
                </div>
              )
            ) : null}
          </div>
        ))}
      </div>

      <div className={styles.below}>
        <p className={styles.question}>{current.question}</p>
        <dl className={styles.how} aria-label={copy.howLabel[lang]}>
          <div>
            <dt>{copy.inputs[lang].mouse}</dt>
            <dd>{current.mouse}</dd>
          </div>
          <div>
            <dt>{copy.inputs[lang].touch}</dt>
            <dd>{current.touch}</dd>
          </div>
          <div>
            <dt>{copy.inputs[lang].keyboard}</dt>
            <dd>{current.keyboard}</dd>
          </div>
        </dl>
        {fsSupported ? (
          <CircleButton
            icon={isFullscreen ? "exitFullscreen" : "fullscreen"}
            label={isFullscreen ? copy.exitFullscreen[lang] : copy.fullscreen[lang]}
            size="lg"
            pressed={isFullscreen}
            onClick={toggleFullscreen}
          />
        ) : null}
      </div>
    </div>
  );
}
