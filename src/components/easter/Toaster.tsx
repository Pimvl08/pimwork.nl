"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { useReducedMotion } from "@/lib/hooks";
import { dismissToast, useToasts, type ToastItem } from "./toast";
import styles from "./easter.module.css";

const SWIPE_DISMISS = 64;

function ToastView({ item, paused, closeLabel }: { item: ToastItem; paused: boolean; closeLabel: string }) {
  const reduced = useReducedMotion();
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const start = useRef<{ x: number; id: number } | null>(null);
  const remaining = useRef(item.duration);

  // Restart the clock whenever the toast is updated with the same id.
  useEffect(() => {
    remaining.current = item.duration;
  }, [item.version, item.duration]);

  // Auto-dismiss, paused while hovered, focused or the tab is hidden.
  useEffect(() => {
    if (paused || leaving) return;
    const begun = performance.now();
    const timer = window.setTimeout(() => setLeaving(true), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(400, remaining.current - (performance.now() - begun));
    };
  }, [paused, leaving, item.version]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => dismissToast(item.id), reduced ? 0 : 200);
    return () => window.clearTimeout(timer);
  }, [leaving, item.id, reduced]);

  const onPointerDown = (e: ReactPointerEvent<HTMLLIElement>) => {
    if ((e.target as Element).closest("button")) return;
    start.current = { x: e.clientX, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLLIElement>) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    setDx(e.clientX - start.current.x);
  };
  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    if (Math.abs(dx) > SWIPE_DISMISS) setLeaving(true);
    else setDx(0);
  };

  return (
    <li
      className={styles.toast}
      data-state={leaving ? "leaving" : "open"}
      style={dx ? { transform: `translateX(${dx}px)`, opacity: Math.max(0.2, 1 - Math.abs(dx) / 200), transition: "none" } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[length:var(--step-0)] text-ink">{item.title}</p>
        {item.description ? <p className="mt-1 text-[length:var(--step--1)] text-ink-soft">{item.description}</p> : null}
      </div>
      <CircleButton icon="close" label={closeLabel} size="sm" onClick={() => setLeaving(true)} />
    </li>
  );
}

/** Mounted once (inside EasterEggs). Polite live region, stacked, swipe or close. */
export function Toaster({ label, closeLabel }: { label: string; closeLabel: string }) {
  const items = useToasts();
  const ref = useRef<HTMLElement>(null);
  const count = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* The toaster lives in the top layer (manual popover), so a toast is never
     hidden behind the terminal dialog. A popover shown before the dialog sits
     under it, so a new toast while a modal is open raises the stack again. */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    const grew = items.length > count.current;
    count.current = items.length;
    try {
      if (!el.matches(":popover-open")) el.showPopover();
      else if (grew && document.querySelector("dialog:modal")) {
        el.hidePopover();
        el.showPopover();
      }
    } catch {
      /* popover unsupported: the fixed position still works outside dialogs */
    }
  }, [items]);

  return (
    <section ref={ref} popover="manual" aria-label={label} aria-live="polite" aria-relevant="additions text" className={styles.toaster}>
      <ol
        className="flex flex-col gap-2"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {items.map((item) => (
          <ToastView key={item.id} item={item} paused={hovered || focused || hidden} closeLabel={closeLabel} />
        ))}
      </ol>
    </section>
  );
}
