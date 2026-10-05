"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/lib/locale";
import { persistLocale } from "@/lib/prefs";
import { uiStore, unlockEgg } from "@/lib/store";
import { applyTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { startLetterRain } from "@/components/easter/bus";
import { runCommand, type Action, type CommandResult, type Line } from "./engine";
import styles from "./terminal.module.css";

export type Entry = { id: number; type: "input"; text: string } | { id: number; type: "line"; line: Line };

const MAX_ENTRIES = 240;
let nextId = 1;
export const entryId = () => nextId++;

/** Typed history, kept for the whole visit. */
const sharedHistory: string[] = [];

export function linesToEntries(lines: Line[]): Entry[] {
  return lines.map((line) => ({ id: entryId(), type: "line", line }));
}

/**
 * Runs the side effects the engine asks for. The overlay closes itself first,
 * so navigation happens on an unlocked page.
 */
export function useActionRunner(lang: Locale) {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(
    (action: Action) => {
      switch (action.type) {
        case "theme": {
          const current = uiStore.get().theme;
          applyTheme(action.theme === "toggle" ? (current === "dark" ? "light" : "dark") : action.theme);
          break;
        }
        case "lang":
          persistLocale(action.lang);
          router.push(localizedPath(pathname || `/${lang}`, action.lang));
          break;
        case "goto":
          router.push(action.href);
          break;
        case "open":
          router.push(`/${lang}/werk/${action.slug}`);
          break;
        case "matrix":
          startLetterRain();
          break;
        case "secret":
          router.push(`/${lang}/geheim`);
          break;
        case "egg":
          unlockEgg(action.id);
          break;
        case "clear":
          break;
      }
    },
    [lang, pathname, router],
  );
}

/** Log, history and command execution for one terminal view. */
export function useTerminalSession(lang: Locale, initial: () => Entry[]) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");

  const append = useCallback((items: Entry[]) => {
    setEntries((current) => [...current, ...items].slice(-MAX_ENTRIES));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  /** Runs a command, logs it and returns the result; the caller runs the actions. */
  const run = useCallback(
    (input: string): CommandResult => {
      const state = uiStore.get();
      const result = runCommand(input, { lang, theme: state.theme, history: [...sharedHistory] });
      const trimmed = input.trim();
      if (trimmed && trimmed.length <= 200) {
        if (sharedHistory[sharedHistory.length - 1] !== trimmed) sharedHistory.push(trimmed);
        if (sharedHistory.length > 50) sharedHistory.shift();
      }
      historyIndex.current = null;
      if (result.actions.some((a) => a.type === "clear")) setEntries([]);
      else append([{ id: entryId(), type: "input", text: trimmed.slice(0, 200) }, ...linesToEntries(result.lines)]);
      return result;
    },
    [append, lang],
  );

  /** Arrow up (-1) or down (+1) through the history. Returns the new input value. */
  const browse = useCallback((direction: -1 | 1, current: string): string => {
    if (!sharedHistory.length) return current;
    if (historyIndex.current === null) {
      if (direction === 1) return current;
      draft.current = current;
      historyIndex.current = sharedHistory.length - 1;
    } else {
      const next = historyIndex.current + direction;
      if (next >= sharedHistory.length) {
        historyIndex.current = null;
        return draft.current;
      }
      historyIndex.current = Math.max(0, next);
    }
    return sharedHistory[historyIndex.current];
  }, []);

  return { entries, setEntries, append, clear, run, browse };
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function LinkLine({ text, href, external }: { text: string; href: string; external?: boolean }) {
  const cls = "underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--ink)] focus-visible:outline-2";
  if (external || /^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {text}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {text}
    </Link>
  );
}

export function LineView({ line }: { line: Line }): ReactNode {
  switch (line.kind) {
    case "text":
      return <p className="whitespace-pre-wrap text-ink">{line.text}</p>;
    case "muted":
      return <p className="whitespace-pre-wrap text-ink-mute">{line.text}</p>;
    case "error":
      return (
        <p className="whitespace-pre-wrap text-ink">
          <span aria-hidden="true" className="mr-2 text-ink-mute">
            !
          </span>
          {line.text}
        </p>
      );
    case "link":
      return (
        <p>
          <LinkLine text={line.text} href={line.href} external={line.external} />
        </p>
      );
    case "list": {
      const Tag = line.ordered ? "ol" : "ul";
      return (
        <Tag className={styles.list}>
          {line.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <table className={styles.table}>
          {line.head ? (
            <thead>
              <tr>
                {line.head.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {line.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

export function EntryView({ entry, prompt }: { entry: Entry; prompt: string }) {
  if (entry.type === "input") {
    return (
      <p className="whitespace-pre-wrap break-words text-ink">
        <span className="text-ink-mute">{prompt} </span>
        {entry.text}
      </p>
    );
  }
  return <LineView line={entry.line} />;
}

export function TerminalLog({ entries, prompt, label, className }: { entries: Entry[]; prompt: string; label: string; className?: string }) {
  return (
    <div role="log" aria-live="polite" aria-relevant="additions text" aria-label={label} className={cn(styles.log, className)}>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <EntryView entry={entry} prompt={prompt} />
        </div>
      ))}
    </div>
  );
}
