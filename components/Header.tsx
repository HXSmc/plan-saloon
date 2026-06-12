"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import { GlowLink } from "./GlowButton";
import { Menu, X } from "./icons";
import { useLang } from "./i18n/LanguageContext";

const NAV = [
  { key: "nav.services", href: "/#services" },
  { key: "nav.about", href: "/#about" },
  { key: "nav.team", href: "/#team" },
  { key: "nav.visit", href: "/#visit" },
];

export default function Header() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        <a href="/#top" aria-label="Action Plan Barbershop home">
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
          <GlowLink href="/book" size="sm" className="hidden sm:inline-flex">
            {t("cta.bookNow")}
          </GlowLink>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-cream md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
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
            <GlowLink href="/book" size="sm" className="mt-4">
              {t("cta.bookNow")}
            </GlowLink>
          </nav>
        </div>
      )}
    </header>
  );
}
