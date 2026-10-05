"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { easeOutExpo, formatMeasured, parseMeasured } from "./logic";

/**
 * A measured value that counts up once when it scrolls into view. The server
 * renders the final value (no-JS, SEO) and that value stays on screen until the
 * number actually enters the viewport; only then does it restart from zero and
 * count up. A number that is already visible at hydration never animates.
 * A word unit ("6 dagen") is set smaller than the figure itself.
 */
export function CountUp({ raw, lang, delay = 0 }: { raw: string; lang: Locale; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const measured = useMemo(() => parseMeasured(raw, lang), [raw, lang]);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !measured || measured.value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    let frame = 0;
    let timer = 0;
    const run = () => {
      setCurrent(0);
      const start = performance.now();
      const tick = (now: number) => {
        // rAF time can sit just before `start`; clamp so the figure never reads "-0".
        const t = Math.min(1, Math.max(0, (now - start) / 1100));
        setCurrent(t >= 1 ? null : measured.value * easeOutExpo(t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(run, delay);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    // The final value stays visible until the number is really in view.
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [measured, delay]);

  if (!measured) return <span ref={ref}>{raw}</span>;
  const figure = current === null ? raw : formatMeasured(measured, current, lang);
  const wordUnit = measured.suffix.startsWith(" ");
  const head = wordUnit ? figure.slice(0, figure.length - measured.suffix.length) : figure;
  return (
    <span ref={ref}>
      {head}
      {wordUnit ? <span className="ml-[0.18em] text-[0.42em] tracking-normal text-ink-soft">{measured.suffix.trim()}</span> : null}
    </span>
  );
}
