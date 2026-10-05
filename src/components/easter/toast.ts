"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny toast store, shaped after Sonner: one <Toaster /> mounted once at the
 * root, and a plain `toast()` function callable from any client code. Passing
 * a stable `id` updates the existing toast instead of stacking a duplicate
 * (useful under StrictMode and for repeated triggers).
 */
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  duration: number;
  /** Bumped on every update so the timer restarts. */
  version: number;
}

export const TOAST_DURATION = 3500;
const MAX_TOASTS = 3;

let toasts: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(title: string, options: { id?: string; description?: string; duration?: number } = {}): string {
  const id = options.id ?? `toast-${++counter}`;
  const existing = toasts.find((t) => t.id === id);
  const item: ToastItem = {
    id,
    title,
    description: options.description,
    duration: options.duration ?? TOAST_DURATION,
    version: (existing?.version ?? 0) + 1,
  };
  toasts = existing ? toasts.map((t) => (t.id === id ? item : t)) : [...toasts, item].slice(-MAX_TOASTS);
  emit();
  return id;
}

export function dismissToast(id?: string) {
  toasts = id ? toasts.filter((t) => t.id !== id) : [];
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const EMPTY: ToastItem[] = [];

export function useToasts(): ToastItem[] {
  return useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
}
