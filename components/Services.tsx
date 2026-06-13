"use client";

import Link from "next/link";
import {
  services as seedServices,
  svcName,
  svcDesc,
  svcCategory,
} from "@/lib/data";
import { useLang } from "./i18n/LanguageContext";
import { useCatalog, type ApiService } from "./booking/useCatalog";
import { ServiceIcon, Clock, ArrowNext } from "./icons";

type AnyService = ApiService | (typeof seedServices)[number];

export default function Services() {
  const { t, lang } = useLang();
  const { services: live } = useCatalog();
  // Live DB services (admin-managed); fall back to the seed for instant paint.
  const services: AnyService[] = live.length ? live : seedServices;

  // Group by localized category, preserving first-seen order.
  const groups = new Map<string, AnyService[]>();
  for (const svc of services) {
    const cat = svcCategory(svc, lang) || (lang === "ar" ? "عام" : "General");
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(svc);
  }

  return (
    <section id="services" className="relative bg-charcoal py-24">
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

        {[...groups.entries()].map(([category, list]) => (
          <div key={category} className="mt-12">
            <h3 className="font-label text-xs uppercase tracking-[0.25em] text-cream-dim">
              {category}
            </h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/book?service=${svc.id}`}
                  className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-neon-yellow/70 hover:bg-white/[0.04]"
                >
                  {svc.popular && (
                    <span className="absolute end-4 top-4 rounded-full bg-neon-yellow/15 px-2.5 py-1 font-label text-[0.65rem] uppercase tracking-widest text-neon-yellow">
                      {t("services.popular")}
                    </span>
                  )}
                  <span className="text-neon-yellow">
                    <ServiceIcon icon={svc.icon} size={26} />
                  </span>
                  <h4 className="mt-4 font-display text-xl font-bold text-cream">
                    {svcName(svc, lang)}
                  </h4>
                  <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-cream-dim">
                    {svcDesc(svc, lang)}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="inline-flex items-center gap-1.5 font-label text-xs text-cream-dim">
                      <Clock size={13} />
                      {svc.durationMin} {t("services.min")}
                    </span>
                    <span className="font-display text-2xl font-extrabold text-neon-yellow">
                      SAR {svc.price}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-label text-[0.68rem] uppercase tracking-widest text-cream-dim transition-colors group-hover:text-neon-yellow">
                    {t("services.bookThis")} <ArrowNext size={13} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
