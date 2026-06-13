"use client";

// Shared admin form primitives + button class recipes — one look everywhere.

export const btn = {
  primary:
    "rounded-md bg-neon-yellow px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-charcoal-deep transition-colors hover:bg-neon-glow disabled:opacity-50 disabled:cursor-not-allowed",
  outline:
    "rounded-md border border-neon-yellow/50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neon-yellow transition-colors hover:bg-neon-yellow/10 disabled:opacity-50",
  ghost:
    "rounded-md border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-cream-dim transition-colors hover:text-cream disabled:opacity-50",
  danger:
    "rounded-md border border-neon-red/50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neon-red transition-colors hover:bg-neon-red/10 disabled:opacity-50",
};

export const inputCls =
  "mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream outline-none transition-colors focus:border-neon-yellow disabled:opacity-40";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        {children}
      </select>
    </label>
  );
}

/**
 * Inline two-step destructive button: first click arms it ("Sure?"),
 * second click within 3s fires. No confirm() popups.
 */
import { useEffect, useRef, useState } from "react";

export function DangerButton({
  label,
  confirmLabel = "Sure?",
  onConfirm,
  className = "",
}: {
  label: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  return (
    <button
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
          timer.current = setTimeout(() => setArmed(false), 3000);
        }
      }}
      className={`${armed ? "border-neon-red bg-neon-red/15 " : ""}${btn.danger} ${className}`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
