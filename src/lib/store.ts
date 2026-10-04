"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny global UI store (no dependency). Components subscribe to a slice
 * through a selector, so only the parts that change re-render.
 */

export type Theme = "dark" | "light";

export interface UIState {
  terminalOpen: boolean;
  /** A command the terminal runs as soon as it opens (from buttons elsewhere). */
  terminalSeed: string | null;
  shortcutsOpen: boolean;
  soundOn: boolean;
  introState: "idle" | "playing" | "done";
  theme: Theme;
  /** Easter eggs the visitor found, by id. */
  eggs: string[];
}

const initialState: UIState = {
  terminalOpen: false,
  terminalSeed: null,
  shortcutsOpen: false,
  soundOn: false,
  introState: "idle",
  theme: "dark",
  eggs: [],
};

type Listener = () => void;

let state: UIState = initialState;
const listeners = new Set<Listener>();

export const uiStore = {
  get: (): UIState => state,
  set(partial: Partial<UIState> | ((current: UIState) => Partial<UIState>)) {
    const next = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Test helper: reset to the initial state. */
  reset(overrides: Partial<UIState> = {}) {
    state = { ...initialState, ...overrides };
    listeners.forEach((listener) => listener());
  },
};

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    uiStore.subscribe,
    () => selector(uiStore.get()),
    () => selector(initialState),
  );
}

export function unlockEgg(id: string): boolean {
  if (uiStore.get().eggs.includes(id)) return false;
  uiStore.set((s) => ({ eggs: [...s.eggs, id] }));
  return true;
}
