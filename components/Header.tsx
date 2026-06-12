"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import GlowButton from "./GlowButton";
import { useBooking } from "./booking/BookingContext";
import { useLang } from "./i18n/LanguageContext";

const NAV = [
  { key: "nav.services", href: "#services" },
  { key: "nav.about", href: "#about" },
  { key: "nav.team", href: "#team" },
  { key: "nav.visit", href: "#visit" },
];

export default function Header() {
  const { open } = useBooking();
  const { t, toggle, lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const LangToggle = ({ className = "" }: { className?: string }) => (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={`flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 font-label text-xs uppercase tracking-widest text-cream-dim transition-colors hover:border-neon-yellow/60 hover:text-neon-yellow ${className}`}
    >
      <span aria-hidden>🌐</span>
      <span>{lang === "en" ? "AR" : "EN"}</span>
    </button>
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-charcoal-deep/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#top" aria-label="Action Plan Barbershop home">
          <Logo size={36} />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-label text-xs uppercase tracking-widest text-cream-dim transition-colors hover:text-neon-yellow"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangToggle />
          <GlowButton
            size="sm"
            onClick={() => open()}
            className="hidden sm:inline-flex"
          >
            {t("cta.bookNow")}
          </GlowButton>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-cream md:hidden"
          >
            <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-charcoal-deep/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col px-5 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/5 py-3 font-label text-sm uppercase tracking-widest text-cream-dim transition-colors hover:text-neon-yellow"
              >
                {t(item.key)}
              </a>
            ))}
            <GlowButton
              size="sm"
              className="mt-4"
              onClick={() => {
                setMenuOpen(false);
                open();
              }}
            >
              {t("cta.bookNow")}
            </GlowButton>
          </nav>
        </div>
      )}
    </header>
  );
}
