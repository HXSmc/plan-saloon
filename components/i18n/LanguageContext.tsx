"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dict, type Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "aps-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore saved choice on mount.
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  // Reflect language + direction on <html> and persist.
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("lang", lang);
    el.setAttribute("dir", dir);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(
    () => setLangState((l) => (l === "en" ? "ar" : "en")),
    []
  );

  const t = useCallback(
    (key: string) => dict[lang][key] ?? dict.en[key] ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, dir, t, setLang, toggle }),
    [lang, dir, t, setLang, toggle]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
