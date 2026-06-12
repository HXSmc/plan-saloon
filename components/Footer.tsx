"use client";

import { hours, shopInfo, dayLabel } from "@/lib/data";
import Logo from "./Logo";
import GlowButton from "./GlowButton";
import { useBooking } from "./booking/BookingContext";
import { useLang } from "./i18n/LanguageContext";

export default function Footer() {
  const { open } = useBooking();
  const { t, lang } = useLang();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <footer id="visit" className="relative bg-charcoal-deep">
      {/* Final CTA band */}
      <div className="relative border-y border-white/10 bg-charcoal py-16">
        <div className="texture-stone absolute inset-0 opacity-40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-extrabold text-cream sm:text-4xl">
            {t("footer.ctaTitleA")}{" "}
            <span className="text-neon-yellow glow-text-yellow">
              {t("footer.ctaHighlight")}
            </span>{" "}
            {t("footer.ctaTitleB")}
          </h2>
          <GlowButton size="lg" onClick={() => open()}>
            {t("footer.ctaButton")}
          </GlowButton>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-3 lg:px-8">
        {/* Brand + contact */}
        <div>
          <Logo size={40} />
          <p className="mt-5 max-w-xs font-body text-sm leading-relaxed text-cream-dim">
            {t("footer.blurb")}
          </p>
          <div className="mt-6 space-y-2 font-body text-sm text-cream-dim">
            <p>
              <span className="text-cream">{shopInfo.address}</span>
            </p>
            <p>
              <a href={`tel:${shopInfo.phone}`} className="hover:text-neon-yellow">
                {shopInfo.phone}
              </a>
            </p>
            <p>
            </p>
          </div>
        </div>

        {/* Hours */}
        <div>
          <p className="eyebrow text-neon-yellow">{t("footer.hours")}</p>
          <ul className="mt-4 space-y-2">
            {hours.map((h) => {
              const isToday = h.day === today;
              return (
                <li
                  key={h.day}
                  className={`flex items-center justify-between border-b border-white/5 pb-2 font-body text-sm ${
                    isToday ? "text-neon-yellow" : "text-cream-dim"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-yellow animate-flicker" />
                    )}
                    {dayLabel(h, lang)}
                  </span>
                  <span dir="ltr">
                    {h.closed ? t("footer.closed") : `${h.open} – ${h.close}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Map */}
        <div>
          <p className="eyebrow text-neon-yellow">{t("footer.findUs")}</p>
          <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title="Action Plan Barbershop location"
              src={shopInfo.mapEmbed}
              className="h-56 w-full grayscale-[0.3] invert-[0.92] hue-rotate-180 contrast-[0.9]"
              loading="lazy"
            />
            {/* Dark theme overlay + custom yellow pin */}
            <div className="pointer-events-none absolute inset-0 bg-charcoal-deep/20 mix-blend-multiply" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div className="h-4 w-4 rounded-full border-2 border-charcoal-deep bg-neon-yellow shadow-glow-yellow" />
            </div>
          </div>
          <a
            href={shopInfo.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-label text-[0.62rem] uppercase tracking-widest text-cream-dim hover:text-neon-yellow"
          >
            {t("footer.directions")} <span className="rtl:hidden">→</span>
            <span className="hidden rtl:inline">←</span>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="mx-auto max-w-7xl px-5 font-body text-xs text-cream-dim/60 lg:px-8">
          © {new Date().getFullYear()} {shopInfo.name}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
