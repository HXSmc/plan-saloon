"use client";

import { GlowLink } from "./GlowButton";
import OpenStatusPill from "./OpenStatusPill";
import { useLang } from "./i18n/LanguageContext";

export default function Hero() {
  const { t } = useLang();

  return (
    <section
      id="top"
      className="amber-glow relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Storefront photo (client asset) under a charcoal scrim. */}
      <div
        className="absolute inset-0 bg-charcoal-deep bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(14,16,19,0.55), rgba(14,16,19,0.82) 60%, rgba(14,16,19,0.97)), url('/storefront.jpg')",
        }}
      />
      <div className="texture-stone absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-28 pb-20 lg:px-8">
        <div className="max-w-2xl">
          {/* Live status — computed from the published hours, never hardcoded. */}
          <OpenStatusPill />

          <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight text-cream sm:text-6xl lg:text-7xl">
            {t("hero.headlineA")}{" "}
            <span className="text-neon-yellow glow-text-yellow">
              {t("hero.headlineHighlight")}
            </span>
            {t("hero.headlineB")}
          </h1>

          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-cream-dim">
            {t("hero.subcopy")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <GlowLink href="/book" size="lg">
              {t("cta.bookNow")}
            </GlowLink>
            <a
              href="#services"
              className="font-label text-xs uppercase tracking-widest text-cream-dim underline-offset-8 transition-colors hover:text-neon-yellow hover:underline"
            >
              {t("hero.viewServices")}
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream-dim/50">
        <span className="font-label text-[0.65rem] uppercase tracking-[0.3em]">
          {t("hero.scroll")}
        </span>
      </div>
    </section>
  );
}
