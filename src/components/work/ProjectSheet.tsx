"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { useReducedMotion } from "@/lib/hooks";
import { lockScroll } from "@/lib/scroll";
import styles from "./work.module.css";

const EASE_PAPER = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FOLDED = "inset(50% 0% 50% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/**
 * Full-screen modal sheet for a project opened from the index. It unfolds
 * from a horizontal crease (clip-path), traps focus, locks the page scroll and
 * closes with Esc, the close button or the browser's back button.
 */
export function ProjectSheet({ titleId, closeLabel, children }: { titleId: string; closeLabel: string; children: ReactNode }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const leaving = useRef(false);

  const close = useCallback(() => setClosing(true), []);

  // Scroll lock, initial focus and focus return to whatever opened the sheet.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll(true);
    sheetRef.current?.focus({ preventScroll: true });
    return () => {
      lockScroll(false);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  // Esc closes; Tab and Shift+Tab stay inside the sheet.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // A lightbox opened from the sheet is a modal <dialog> on top: it owns the keys.
      if (sheetRef.current?.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!sheet.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (current === first || current === sheet)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  const shown = reduce ? { opacity: 1 } : { clipPath: OPEN };
  const hidden = reduce ? { opacity: 0 } : { clipPath: FOLDED };

  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.scrim}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.26 : 0.42, ease: EASE_PAPER }}
        onClick={close}
      />
      <motion.div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={hidden}
        animate={closing ? hidden : shown}
        transition={
          closing
            ? { duration: reduce ? 0.16 : 0.32, ease: [0.7, 0, 0.84, 0] }
            : { duration: reduce ? 0.26 : 0.75, ease: EASE_PAPER }
        }
        onAnimationComplete={() => {
          if (!closing || leaving.current) return;
          leaving.current = true;
          router.back();
        }}
      >
        {reduce ? null : (
          <motion.span
            className={styles.crease}
            aria-hidden="true"
            initial={{ opacity: 0, scaleX: 0.2 }}
            animate={closing ? { opacity: [0, 0.9], scaleX: 1 } : { opacity: [0.9, 0.9, 0], scaleX: 1 }}
            transition={closing ? { duration: 0.3 } : { duration: 0.75, times: [0, 0.35, 1], ease: EASE_PAPER }}
          />
        )}
        <div className={styles.sheetScroll}>
          <div className={styles.sheetBar}>
            <span className={styles.closeWrap}>
              <CircleButton icon="close" label={closeLabel} size="lg" onClick={close} />
            </span>
          </div>
          <div className={styles.sheetContent}>{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
