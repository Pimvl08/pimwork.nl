"use client";

import { useEffect } from "react";
import { eggs } from "@/components/easter/eggs";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { unlockEgg, uiStore, useUI } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import { secretCopy } from "./copy";

/** Lists every egg: found ones with what they were, hidden ones with a hint. */
export function EggLedger({ lang }: { lang: Locale }) {
  const t = secretCopy[lang];
  const found = useUI((s) => s.eggs);
  const mounted = useMounted();

  // Reaching this plate is itself an egg.
  useEffect(() => {
    unlockEgg("secret");
  }, []);

  const count = mounted ? eggs.filter((e) => found.includes(e.id)).length : 0;

  return (
    <section aria-labelledby="eggs-progress" className="flex flex-col gap-6">
      <p id="eggs-progress" className="data text-[length:var(--step-0)] text-ink" aria-live="polite">
        {t.progress(count, eggs.length)}
      </p>
      <ol className="flex flex-col border-t border-rule">
        {eggs.map((egg, i) => {
          const isFound = mounted && found.includes(egg.id);
          return (
            <li key={egg.id} className="grid grid-cols-[2.75rem_1fr] gap-x-4 gap-y-1 border-b border-rule py-5 sm:grid-cols-[3.5rem_14rem_1fr] sm:items-baseline">
              <span className="numeral text-[length:var(--step-1)] text-ink-mute" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="flex items-center gap-2 text-[length:var(--step-1)] italic text-ink">
                <Icon name={isFound ? "unlock" : "lock"} size={18} />
                <span>{isFound ? egg.name[lang] : t.hidden}</span>
                <span className="sr-only">{isFound ? `, ${t.found}` : ""}</span>
              </h2>
              <p className="col-start-2 measure text-ink-soft sm:col-start-3">
                {isFound ? egg.found[lang] : egg.hint[lang] || egg.found[lang]}
              </p>
            </li>
          );
        })}
      </ol>
      <div>
        <button
          type="button"
          className="min-h-11 font-mono text-[length:var(--step--1)] text-ink-soft underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:text-ink hover:decoration-[var(--ink)] focus-visible:outline-2 active:text-ink-mute"
          onClick={() => uiStore.set({ terminalOpen: true, terminalSeed: "konami" })}
        >
          {t.terminal}
        </button>
      </div>
    </section>
  );
}
