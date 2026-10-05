"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { lockScroll } from "@/lib/scroll";
import styles from "./chrome.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Id of the visible title that names the dialog. */
  labelledBy: string;
  /** "full": a paper sheet over the whole screen. "card": an arched card over a dimmed page. */
  variant: "full" | "card";
  /** Element to focus when the sheet opens (defaults to the first focusable). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Close by dragging the sheet down (touch). */
  swipeToClose?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Modal sheet: focus trap, Escape, focus returns to where it came from,
 * page scroll locked, enter via @starting-style and a faster exit.
 */
export function Sheet({ open, onClose, labelledBy, variant, initialFocus, swipeToClose = false, className, children }: SheetProps) {
  const [present, setPresent] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  if (open && !present) setPresent(true);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Focus in on open, focus back on close, scroll lock and Escape while open.
  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll(true);
    // Reopened before the exit finished: drop what a swipe left behind.
    if (panelRef.current) {
      panelRef.current.style.transform = "";
      panelRef.current.style.transition = "";
    }
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = initialFocus?.current ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      target.focus({ preventScroll: true });
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      const back = returnTo.current;
      if (back && back.isConnected) back.focus({ preventScroll: true });
    };
  }, [open, initialFocus]);

  // Unmount after the exit transition (with a fallback for reduced motion or no transition).
  useEffect(() => {
    if (open || !present) return;
    const timer = window.setTimeout(() => setPresent(false), 420);
    return () => window.clearTimeout(timer);
  }, [open, present]);

  // Swipe down to close: follows the finger with damping, a flick is enough.
  useEffect(() => {
    const panel = panelRef.current;
    if (!swipeToClose || !open || !panel) return;
    let startY = 0;
    let startT = 0;
    let dy = 0;
    let tracking = false;
    let dragging = false;

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      tracking = panel.scrollTop <= 0;
      dragging = false;
      startY = event.touches[0].clientY;
      startT = performance.now();
      dy = 0;
    };
    const onMove = (event: TouchEvent) => {
      if (!tracking) return;
      dy = event.touches[0].clientY - startY;
      if (!dragging && dy > 8) {
        dragging = true;
        panel.style.transition = "none";
      }
      if (!dragging) return;
      event.preventDefault();
      // Downward follows the finger, upward meets friction.
      const offset = dy > 0 ? dy : dy * 0.15;
      panel.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;
      const velocity = dy / Math.max(1, performance.now() - startT);
      panel.style.transition = "transform 260ms var(--ease-out-expo)";
      if (dy > 120 || (velocity > 0.11 && dy > 24)) {
        panel.style.transform = "translate3d(0, 100%, 0)";
        onCloseRef.current();
      } else {
        panel.style.transform = "";
      }
    };
    panel.addEventListener("touchstart", onStart, { passive: true });
    panel.addEventListener("touchmove", onMove, { passive: false });
    panel.addEventListener("touchend", onEnd);
    panel.addEventListener("touchcancel", onEnd);
    return () => {
      panel.removeEventListener("touchstart", onStart);
      panel.removeEventListener("touchmove", onMove);
      panel.removeEventListener("touchend", onEnd);
      panel.removeEventListener("touchcancel", onEnd);
    };
  }, [swipeToClose, open, present]);

  if (!present) return null;

  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const state = open ? "open" : "closed";
  return (
    <>
      {variant === "card" ? (
        <div className={styles.backdrop} data-state={state} onClick={() => onCloseRef.current()} aria-hidden="true" />
      ) : null}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-state={state}
        className={cn(variant === "full" ? styles.sheet : styles.card, className)}
        onKeyDown={trapTab}
        onTransitionEnd={(event) => {
          if (!open && event.target === event.currentTarget) setPresent(false);
        }}
      >
        {children}
      </div>
    </>
  );
}
