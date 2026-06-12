"use client";

// Right-docked slide-over panel — the admin's replacement for center modals.
// The page underneath stays visible and scrollable context is preserved.

import { useEffect } from "react";
import { X } from "../icons";

export default function SidePanel({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Soft scrim — click to dismiss, page remains visible. */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-panel-in flex-col border-l border-white/10 bg-charcoal shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold text-cream">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-cream-dim">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-cream-dim transition-colors hover:border-neon-yellow/60 hover:text-neon-yellow"
          >
            <X size={15} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="border-t border-white/10 px-6 py-4">{footer}</footer>
        )}
      </aside>
    </div>
  );
}
