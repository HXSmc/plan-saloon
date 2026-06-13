"use client";

import { Globe } from "./icons";
import { useLang } from "./i18n/LanguageContext";

export default function LangToggle({ className = "" }: { className?: string }) {
  const { toggle, lang } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={`flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 font-label text-xs uppercase tracking-widest text-cream-dim transition-colors hover:border-neon-yellow/60 hover:text-neon-yellow ${className}`}
    >
      <Globe size={14} />
      <span>{lang === "en" ? "AR" : "EN"}</span>
    </button>
  );
}
