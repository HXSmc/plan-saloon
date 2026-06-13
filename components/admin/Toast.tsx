"use client";

// Toast system replacing every browser alert()/confirm() in the admin.
// Destructive actions run immediately and offer Undo instead of blocking
// with a confirmation popup.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, X, Undo } from "../icons";

export type Toast = {
  id: number;
  message: string;
  tone: "ok" | "error";
  /** Optional Undo handler — shown as a button, cancels the auto-dismiss timer reset. */
  undo?: () => void | Promise<void>;
};

type ToastContextValue = {
  toast: (message: string, opts?: { tone?: Toast["tone"]; undo?: Toast["undo"] }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_MS = 6000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (message, opts) => {
      const id = nextId.current++;
      setToasts((ts) => [...ts, { id, message, tone: opts?.tone ?? "ok", undo: opts?.undo }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[90] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
              t.tone === "error"
                ? "border-neon-red/40 bg-charcoal/95 text-neon-red"
                : "border-white/15 bg-charcoal/95 text-cream"
            }`}
          >
            <span className={t.tone === "error" ? "text-neon-red" : "text-neon-yellow"}>
              {t.tone === "error" ? <X size={15} /> : <Check size={15} />}
            </span>
            <span className="flex-1">{t.message}</span>
            {t.undo && (
              <button
                onClick={async () => {
                  dismiss(t.id);
                  await t.undo!();
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-neon-yellow/50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-neon-yellow hover:bg-neon-yellow/10"
              >
                <Undo size={12} /> Undo
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-cream-dim/60 hover:text-cream"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
