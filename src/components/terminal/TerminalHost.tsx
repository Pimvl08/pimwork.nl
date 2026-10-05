"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { useLang } from "@/i18n/LocaleProvider";
import { lockScroll } from "@/lib/scroll";
import { uiStore, useUI } from "@/lib/store";
import { cn } from "@/lib/cn";
import { CHIP_COMMANDS, hostCopy, termCopy } from "./copy";
import { complete, filterPalette, paletteItems, type Action, type PaletteItem } from "./engine";
import { TerminalLog, entryId, linesToEntries, useActionRunner, useTerminalSession } from "./session";
import styles from "./terminal.module.css";

type Mode = "palette" | "terminal";

/** Actions that leave the terminal: the sheet closes before they run. */
const LEAVING = new Set<Action["type"]>(["goto", "open", "secret", "matrix", "lang"]);

/**
 * The global terminal: one modal sheet with two modes, a command palette
 * (fuzzy search over pages, projects and commands) and the terminal itself.
 * Opened through uiStore.terminalOpen (Ctrl/Cmd+K is wired by the chrome).
 */
export default function TerminalHost() {
  const lang = useLang();
  const open = useUI((s) => s.terminalOpen);
  const t = hostCopy[lang];
  const tt = termCopy[lang];
  const ids = useId();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const [mode, setMode] = useState<Mode>("palette");
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const session = useTerminalSession(lang, () => [{ id: entryId(), type: "line", line: { kind: "muted", text: termCopy[lang].welcome } }]);
  const runAction = useActionRunner(lang);

  const items = useMemo(() => paletteItems(lang), [lang]);
  const results = useMemo(() => filterPalette(items, query).slice(0, 40), [items, query]);

  /* Close: hide the sheet, unlock scrolling, give focus back. */
  const close = useCallback((restore = true) => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    lockScroll(false);
    if (uiStore.get().terminalOpen) uiStore.set({ terminalOpen: false });
    const target = returnFocus.current;
    returnFocus.current = null;
    if (restore && target && document.contains(target)) target.focus({ preventScroll: true });
  }, []);

  const perform = useCallback(
    (actions: Action[]) => {
      const leaving = actions.some((a) => LEAVING.has(a.type));
      if (leaving) close(false);
      const runAll = () => actions.forEach(runAction);
      if (leaving) requestAnimationFrame(runAll);
      else runAll();
    },
    [close, runAction],
  );

  const { run } = session;
  const execute = useCallback(
    (command: string) => {
      const result = run(command);
      perform(result.actions);
      return result;
    },
    [perform, run],
  );

  /* Open and close follow the store. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const focused = document.activeElement;
      returnFocus.current = focused instanceof HTMLElement ? focused : null;
      dialog.showModal();
      lockScroll(true);
    } else if (!open && dialog.open) {
      close();
    }
  }, [open, close]);

  /* A command handed over by a button elsewhere (terminalSeed) runs as soon as the sheet opens. */
  useEffect(() => {
    const consume = () => {
      const state = uiStore.get();
      if (!state.terminalOpen || !state.terminalSeed) return;
      const pending = state.terminalSeed;
      uiStore.set({ terminalSeed: null });
      setMode("terminal");
      execute(pending);
    };
    const unsubscribe = uiStore.subscribe(consume);
    queueMicrotask(consume);
    return () => {
      unsubscribe();
    };
  }, [execute]);

  /* Focus the input of the current mode. */
  useEffect(() => {
    if (!open) return;
    const el = mode === "terminal" ? inputRef.current : searchRef.current;
    el?.focus({ preventScroll: true });
  }, [open, mode]);

  /* Keep the newest output in view. */
  useEffect(() => {
    if (mode === "terminal") logEndRef.current?.scrollIntoView({ block: "end" });
  }, [session.entries, mode]);

  useEffect(() => () => lockScroll(false), []);

  const onDialogKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      close();
    }
  };

  const onTerminalKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      const input = value;
      setValue("");
      execute(input);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      setValue(session.browse(event.key === "ArrowUp" ? -1 : 1, value));
    } else if (event.key === "Tab" && !event.shiftKey && value.trim()) {
      event.preventDefault();
      const done = complete(value);
      setValue(done.value);
      if (done.options.length > 1) session.append(linesToEntries([{ kind: "muted", text: done.options.join("   ") }]));
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      session.clear();
    }
  };

  const choose = (item: PaletteItem | undefined) => {
    const command = item ? item.command : query;
    if (!command.trim()) return;
    const result = execute(command);
    setQuery("");
    setActive(0);
    if (!result.actions.some((a) => LEAVING.has(a.type))) setMode("terminal");
  };

  const onPaletteKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`${ids}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, ids]);

  const titleId = `${ids}-title`;
  const descId = `${ids}-desc`;
  const listId = `${ids}-list`;
  const activeItem = results[active];

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={onDialogKey}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      {open ? (
        <div className={styles.sheet}>
          <span className={styles.crease} aria-hidden="true" />
          <div className="flex items-end justify-between gap-3 border-b border-rule px-4 pt-4 sm:px-6">
            <div className="flex min-w-0 items-end gap-1">
              <h2 id={titleId} className="sr-only">
                {t.title}
              </h2>
              <p id={descId} className="sr-only">
                {t.description}
              </p>
              <div role="tablist" aria-label={t.title} className="flex">
                {(["palette", "terminal"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    aria-controls={`${ids}-${m}`}
                    id={`${ids}-tab-${m}`}
                    className={cn(styles.tab, "text-[length:var(--step--1)]")}
                    onClick={() => setMode(m)}
                  >
                    {t.modes[m]}
                  </button>
                ))}
              </div>
            </div>
            <CircleButton icon="close" label={t.close} size="sm" className="mb-2" onClick={() => close()} />
          </div>

          {mode === "palette" ? (
            <div id={`${ids}-palette`} role="tabpanel" aria-labelledby={`${ids}-tab-palette`} className="flex min-h-0 flex-1 flex-col">
              <div className="px-4 sm:px-6">
                <div className={styles.promptRow} style={{ borderTop: 0, borderBottom: "1px solid var(--rule)" }}>
                  <span aria-hidden="true" className="text-ink-mute">
                    /
                  </span>
                  <input
                    ref={searchRef}
                    className={styles.input}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value.slice(0, 200));
                      setActive(0);
                    }}
                    onKeyDown={onPaletteKey}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeItem ? `${ids}-opt-${active}` : undefined}
                    aria-label={t.search}
                    placeholder={t.searchPlaceholder}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    maxLength={200}
                  />
                </div>
              </div>
              <ul id={listId} role="listbox" aria-label={t.search} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-4">
                {results.length === 0 ? (
                  <li role="presentation" className="px-3 py-3 text-[length:var(--step--1)] text-ink-mute">
                    {t.empty(query.slice(0, 40))}
                  </li>
                ) : (
                  results.map((item, i) => (
                    <li
                      key={item.id}
                      id={`${ids}-opt-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className={styles.option}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(item)}
                    >
                      <span className="w-[4.5rem] shrink-0 text-[length:var(--step--1)] text-ink-mute">{t.groups[item.group]}</span>
                      <span className="shrink-0 text-[length:var(--step--1)] text-ink">{item.label}</span>
                      <span className="min-w-0 truncate font-serif text-[length:var(--step--1)] italic text-ink-mute">{item.hint}</span>
                    </li>
                  ))
                )}
              </ul>
              <p className="hidden border-t border-rule px-6 py-2 text-[length:var(--step--1)] text-ink-mute sm:block">{t.hintPalette}</p>
            </div>
          ) : (
            <div id={`${ids}-terminal`} role="tabpanel" aria-labelledby={`${ids}-tab-terminal`} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
                <TerminalLog entries={session.entries} prompt={tt.prompt} label={t.output} />
                <div ref={logEndRef} />
              </div>
              <div className="px-4 pb-[max(8px,env(safe-area-inset-bottom))] sm:px-6">
                <div className={cn(styles.chips, "sm:hidden")} role="group" aria-label={t.chips}>
                  {CHIP_COMMANDS.map((c) => (
                    <button key={c} type="button" className={styles.chip} onClick={() => execute(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <form
                  className={styles.promptRow}
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <label htmlFor={`${ids}-input`} className="shrink-0 text-[length:var(--step--1)] text-ink-mute">
                    <span aria-hidden="true">{tt.prompt}</span>
                    <span className="sr-only">{t.input}</span>
                  </label>
                  <input
                    ref={inputRef}
                    id={`${ids}-input`}
                    className={styles.input}
                    value={value}
                    onChange={(e) => setValue(e.target.value.slice(0, 200))}
                    onKeyDown={onTerminalKey}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="send"
                    maxLength={200}
                  />
                </form>
                <p className="hidden pb-2 text-[length:var(--step--1)] text-ink-mute sm:block">{t.hintTerminal}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </dialog>
  );
}
