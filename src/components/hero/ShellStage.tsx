"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { Silhouette } from "./camera";
import { heroCopy } from "./copy";
import styles from "./hero.module.css";

const ShellCanvas = dynamic(() => import("./ShellCanvas"), { ssr: false, loading: () => null });

/**
 * Holds the stage at a fixed ratio (no layout shift). The server-rendered
 * outline of the folded disc stands in until the WebGL shell has drawn its
 * first frame, and stays as the fallback when WebGL is missing or lost.
 */
export function ShellStage({ lang, silhouette }: { lang: Locale; silhouette: Silhouette }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.stage}>
      <svg
        className={cn(styles.outline, ready && styles.outlineHidden)}
        viewBox={silhouette.viewBox}
        aria-hidden="true"
        focusable="false"
      >
        <path className={styles.outlineRim} d={silhouette.rim} vectorEffect="non-scaling-stroke" />
        {silhouette.crease ? (
          <path className={styles.outlineCrease} d={silhouette.crease} vectorEffect="non-scaling-stroke" />
        ) : null}
      </svg>
      {failed ? null : (
        <ShellCanvas
          cursorLabel={heroCopy.bend[lang]}
          className={ready ? styles.canvasShown : undefined}
          onReady={() => setReady(true)}
          onLost={() => setReady(false)}
          onFail={() => {
            setReady(false);
            setFailed(true);
          }}
        />
      )}
    </div>
  );
}
