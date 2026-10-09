"use client";

import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useId, useRef } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { pageHref, pages } from "@/content/sections";
import type { Locale } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import { localizedPath } from "@/lib/locale";
import { uiStore, useUI } from "@/lib/store";
import { toggleTheme } from "@/lib/theme";
import styles from "./chrome.module.css";
import { themeOrigin } from "./controls";
import { chromeCopy } from "./copy";
import { shortcutFor } from "./logic";
import { Sheet } from "./Sheet";

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return !["button", "submit", "reset", "checkbox", "radio", "range", "color", "file"].includes(type);
  }
  return target.closest('[role="textbox"], [data-shortcuts-ignore]') !== null;
}

/**
 * Global keys. Registered in the capture phase so Ctrl/Cmd+K is handled
 * once, before anyone else sees it. Single keys never fire while typing.
 */
export function KeyboardShortcuts() {
  const lang = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const open = useUI((s) => s.shortcutsOpen);
  const ctx = useRef({ lang, pathname, router });

  useEffect(() => {
    ctx.current = { lang, pathname, router };
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat && event.key !== "Escape") return;
      const state = uiStore.get();
      const otherModal = !state.shortcutsOpen && document.querySelector('[aria-modal="true"]') !== null;
      const action = shortcutFor({
        key: event.key,
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        alt: event.altKey,
        typing: isTyping(event.target),
        terminalOpen: state.terminalOpen,
        modalOpen: otherModal,
        composing: event.isComposing,
      });
      if (!action) return;
      const { lang: current, pathname: path, router: nav } = ctx.current;

      switch (action.type) {
        case "terminal":
          event.preventDefault();
          event.stopImmediatePropagation();
          uiStore.set({ terminalOpen: true, shortcutsOpen: false });
          return;
        case "escape":
          if (state.shortcutsOpen) uiStore.set({ shortcutsOpen: false });
          return;
        case "sheet":
          event.preventDefault();
          uiStore.set({ shortcutsOpen: !state.shortcutsOpen });
          return;
        case "theme":
          event.preventDefault();
          toggleTheme(themeOrigin());
          return;
        case "lang": {
          event.preventDefault();
          const target: Locale = current === "nl" ? "en" : "nl";
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load is intended: the language lives in the root layout
          window.location.assign(`${localizedPath(path ?? `/${current}`, target)}${window.location.hash}`);
          return;
        }
        case "page": {
          const page = pages.find((p) => p.id === action.id);
          if (!page) return;
          event.preventDefault();
          if (state.shortcutsOpen) uiStore.set({ shortcutsOpen: false });
          nav.push(pageHref(current, page));
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);

  return <ShortcutsSheet open={open} />;
}

function Kbd({ children }: { children: string }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

export function ShortcutsSheet({ open }: { open: boolean }) {
  const titleId = useId();
  const t = useCopy(chromeCopy.shortcuts);
  const close = () => uiStore.set({ shortcutsOpen: false });

  const rows: { keys: string[][]; text: string }[] = [
    { keys: [["Ctrl", "K"], ["Cmd", "K"]], text: t.terminal },
    { keys: [["?"]], text: t.sheet },
    { keys: [["T"]], text: t.theme },
    { keys: [["L"]], text: t.lang },
    { keys: [["0"], [pages[pages.length - 1].key]], text: t.pages },
    { keys: [["Esc"]], text: t.esc },
  ];

  return (
    <Sheet open={open} onClose={close} labelledBy={titleId} variant="card">
      <div className={styles.cardHead}>
        <h2 id={titleId} className={styles.cardTitle}>
          {t.title}
        </h2>
        <CircleButton icon="close" label={t.close} size="md" onClick={close} />
      </div>
      <p className={styles.cardLead}>{t.lead}</p>
      <dl className={styles.keys}>
        {rows.map((row) => (
          <div key={row.text} className={styles.keyRow}>
            <dt className={styles.keyCombo}>
              {row.keys.map((combo, index) => (
                <Fragment key={combo.join("+")}>
                  {index > 0 ? <span className={styles.keyJoin}>{row.text === t.pages ? t.to : t.or}</span> : null}
                  {combo.map((key, k) => (
                    <Fragment key={key}>
                      {k > 0 ? (
                        <span className={styles.keyJoin} aria-hidden="true">
                          +
                        </span>
                      ) : null}
                      <Kbd>{key}</Kbd>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </dt>
            <dd className={styles.keyText}>{row.text}</dd>
          </div>
        ))}
      </dl>
    </Sheet>
  );
}
