"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArchButton } from "@/components/ui/ArchButton";
import { COMMANDS, termCopy } from "@/components/terminal/copy";
import { complete, parseInput } from "@/components/terminal/engine";
import { TerminalLog, entryId, linesToEntries, useActionRunner, useTerminalSession, type Entry } from "@/components/terminal/session";
import terminalStyles from "@/components/terminal/terminal.module.css";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { machineCopy as c } from "./copy";
import styles from "./machine.module.css";

const CHIPS = ["/help", "/projects", "/skills", "/experiments", "/about"];
const MIN_Q = 2;
const MAX_Q = 400;

type Failure = "not_configured" | "busy" | "rate_limited" | "upstream" | "invalid";

/** Input that is not a command but reads like a question goes to the machine. */
function looksLikeQuestion(input: string): boolean {
  const { name } = parseInput(input);
  if ((COMMANDS as readonly string[]).includes(name)) return false;
  const words = input.trim().split(/\s+/).length;
  return words >= 3 || /\?\s*$/.test(input);
}

export function MachineConsole({ lang }: { lang: Locale }) {
  const ids = useId();
  const tt = termCopy[lang];
  const session = useTerminalSession(lang, () => [{ id: entryId(), type: "line", line: { kind: "muted", text: c.welcome[lang] } }]);
  const { run, append, setEntries, browse, clear, entries } = session;
  const runAction = useActionRunner(lang);

  const [command, setCommand] = useState("");
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const touched = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  /* Keep the newest line visible inside the box, without moving the page. */
  useEffect(() => {
    const box = boxRef.current;
    if (box && touched.current) box.scrollTop = box.scrollHeight;
  }, [entries]);

  const execute = useCallback(
    (input: string) => {
      touched.current = true;
      const result = run(input);
      result.actions.forEach(runAction);
    },
    [run, runAction],
  );

  const patchAnswer = useCallback(
    (id: number, patch: Partial<Extract<Entry, { type: "answer" }>>) => {
      setEntries((list) => list.map((e) => (e.id === id && e.type === "answer" ? { ...e, ...patch } : e)));
    },
    [setEntries],
  );

  const answerLocally = useCallback(
    async (id: number, q: string, reason: Failure) => {
      const { localAnswer } = await import("@/lib/ai/local");
      const answer = localAnswer(q, lang);
      if (reason !== "not_configured") {
        const note = reason === "rate_limited" ? c.reasons.rateLimited : reason === "busy" ? c.reasons.busy : c.reasons.upstream;
        append(linesToEntries([{ kind: "muted", text: note[lang] }]));
      }
      patchAnswer(id, { label: c.label.local[lang], text: answer.text, links: answer.links, status: "done" });
    },
    [append, lang, patchAnswer],
  );

  const ask = useCallback(
    async (raw: string) => {
      const q = raw.trim().slice(0, MAX_Q);
      if (q.length < MIN_Q) {
        setAskError(c.ask.tooShort[lang]);
        return;
      }
      touched.current = true;
      setAskError(null);
      setPending(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const id = entryId();
      append([
        { id: entryId(), type: "input", text: q },
        { id, type: "answer", label: c.label.pending[lang], text: "", links: [], status: "pending" },
      ]);

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: q, lang }),
          signal: controller.signal,
        });
        const type = res.headers.get("content-type") ?? "";
        if (res.ok && res.body && type.startsWith("text/plain")) {
          patchAnswer(id, { label: c.label.live[lang], status: "streaming" });
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let text = "";
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
            patchAnswer(id, { text });
          }
          text += decoder.decode();
          patchAnswer(id, { text: text.trim(), status: "done" });
          return;
        }
        let code: string | undefined;
        try {
          code = ((await res.json()) as { error?: string }).error;
        } catch {
          code = undefined;
        }
        if (res.status === 400) {
          patchAnswer(id, { label: c.label.local[lang], text: c.reasons.invalid[lang], status: "error" });
          return;
        }
        const reason: Failure =
          res.status === 429 ? "rate_limited" : code === "not_configured" ? "not_configured" : code === "busy" ? "busy" : "upstream";
        await answerLocally(id, q, reason);
      } catch (error) {
        if (controller.signal.aborted) return;
        void error;
        await answerLocally(id, q, "upstream");
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setPending(false);
        }
      }
    },
    [answerLocally, append, lang, patchAnswer],
  );

  const onCommandKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      const input = command;
      setCommand("");
      if (looksLikeQuestion(input) && !pending) void ask(input);
      else execute(input);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      setCommand(browse(event.key === "ArrowUp" ? -1 : 1, command));
    } else if (event.key === "Tab" && !event.shiftKey && command.trim()) {
      event.preventDefault();
      const done = complete(command);
      setCommand(done.value);
      if (done.options.length > 1) append(linesToEntries([{ kind: "muted", text: done.options.join("   ") }]));
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      clear();
    }
  };

  const onAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const q = question;
    void ask(q).then(() => undefined);
    if (q.trim().length >= MIN_Q) setQuestion("");
  };

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={c.terminalLabel[lang]} className={styles.panel}>
        <span className={styles.crease} aria-hidden="true" />
        <div className={cn(terminalStyles.chips, "px-4 pt-5 sm:px-6")} role="group" aria-label={c.chips[lang]}>
          {CHIPS.map((chip) => (
            <button key={chip} type="button" className={terminalStyles.chip} onClick={() => execute(chip)}>
              {chip}
            </button>
          ))}
        </div>
        <div ref={boxRef} className={styles.box} tabIndex={0} aria-label={c.output[lang]}>
          <TerminalLog entries={entries} prompt={tt.prompt} label={c.output[lang]} />
        </div>
        <div className="px-4 sm:px-6">
          <div className={terminalStyles.promptRow}>
            <label htmlFor={`${ids}-cmd`} className="shrink-0 font-mono text-[length:var(--step--1)] text-ink-mute">
              <span aria-hidden="true">{tt.prompt}</span>
              <span className="sr-only">{c.commandInput[lang]}</span>
            </label>
            <input
              id={`${ids}-cmd`}
              className={cn(terminalStyles.input, "font-mono")}
              value={command}
              onChange={(e) => setCommand(e.target.value.slice(0, 200))}
              onKeyDown={onCommandKey}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              maxLength={200}
              placeholder="help"
            />
          </div>
        </div>
      </section>

      <form onSubmit={onAsk} className="flex flex-col gap-3" noValidate>
        <label htmlFor={`${ids}-ask`} className="text-[length:var(--step-1)] italic text-ink">
          {c.ask.label[lang]}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className={styles.field}>
            <input
              id={`${ids}-ask`}
              className={styles.askInput}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value.slice(0, MAX_Q));
                if (askError) setAskError(null);
              }}
              placeholder={c.ask.placeholder[lang]}
              maxLength={MAX_Q}
              minLength={MIN_Q}
              autoComplete="off"
              enterKeyHint="send"
              aria-invalid={askError ? true : undefined}
              aria-describedby={`${ids}-ask-help`}
            />
          </div>
          <ArchButton type="submit" variant="primary" icon="arrowRight" disabled={pending} aria-busy={pending || undefined} className="shrink-0">
            {pending ? c.ask.busy[lang] : c.ask.submit[lang]}
          </ArchButton>
        </div>
        <p id={`${ids}-ask-help`} className="font-mono text-[length:var(--step--1)] text-ink-mute" aria-live="polite">
          {askError ?? `${question.length}/${MAX_Q} ${c.ask.counter[lang]}`}
        </p>
      </form>
    </div>
  );
}
