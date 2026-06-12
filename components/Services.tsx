"use client";

import { services as seedServices, svcName, svcDesc } from "@/lib/data";
import { useBooking } from "./booking/BookingContext";
import { useLang } from "./i18n/LanguageContext";
import { useCatalog } from "./booking/useCatalog";

export default function Services() {
  const { open } = useBooking();
  const { t, lang } = useLang();
  const { services: live } = useCatalog();
  // Live DB services (admin-managed); fall back to the seed for instant paint.
  const services = live.length ? live : seedServices;

  return (
    <section id="services" className="relative bg-charcoal py-24">
      <div className="texture-stone absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-neon-yellow">{t("services.eyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-cream sm:text-5xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 font-body text-lg text-cream-dim">
            {t("services.subcopy")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <button
              key={svc.id}
              onClick={() => open({ serviceId: svc.id })}
              className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-neon-yellow hover:shadow-glow-yellow"
            >
              {svc.popular && (
                <span className="absolute end-4 top-4 rounded-full bg-neon-yellow/15 px-2.5 py-1 font-label text-[0.55rem] uppercase tracking-widest text-neon-yellow">
                  {t("services.popular")}
                </span>
              )}
              <span className="text-3xl" aria-hidden>
                {svc.icon}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-cream">
                {svcName(svc, lang)}
              </h3>
              <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-cream-dim">
                {svcDesc(svc, lang)}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-label text-xs uppercase tracking-widest text-cream-dim">
                </span>
                <span className="font-display text-2xl font-extrabold text-neon-yellow">
                  SAR {svc.price}
                </span>
              </div>
              <span className="mt-4 font-label text-[0.62rem] uppercase tracking-widest text-cream-dim transition-colors group-hover:text-neon-yellow">
                {t("services.bookThis")} <span className="rtl:hidden">→</span>
                <span className="hidden rtl:inline">←</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
