"use client";

import {
  barbers as seedBarbers,
  barberName,
  barberTitle,
  barberBio,
  barberSpecialties,
} from "@/lib/data";
import { useLang } from "./i18n/LanguageContext";
import { useCatalog } from "./booking/useCatalog";
import { GlowLink } from "./GlowButton";

export default function Team() {
  const { t, lang } = useLang();
  const { barbers: live } = useCatalog();
  // Live DB barbers (admin-managed); fall back to the seed for instant paint.
  const barbers = live.length ? live : seedBarbers;

  return (
    <section id="team" className="relative bg-charcoal py-24">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-neon-yellow">{t("team.eyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-cream sm:text-5xl">
            {t("team.title")}
          </h2>
          <p className="mt-4 font-body text-lg text-cream-dim">
            {t("team.subcopy")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-neon-yellow/50"
            >
              {b.imageUrl ? (
                <img
                  src={b.imageUrl}
                  alt={barberName(b, lang)}
                  className="h-24 w-24 rounded-full border-2 border-neon-yellow/40 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-neon-yellow/40 bg-neon-yellow/5 font-display text-3xl font-extrabold text-neon-yellow">
                  {b.initials}
                </div>
              )}
              <h3 className="mt-5 font-display text-xl font-bold text-cream">
                {barberName(b, lang)}
              </h3>
              <p className="font-label text-[0.68rem] uppercase tracking-widest text-neon-yellow">
                {barberTitle(b, lang)}
              </p>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-cream-dim">
                {barberBio(b, lang)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {barberSpecialties(b, lang).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 px-2.5 py-1 font-label text-[0.62rem] uppercase tracking-wider text-cream-dim"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <GlowLink
                href={`/book?barber=${b.id}`}
                variant="outline"
                size="sm"
                className="mt-6"
              >
                {t("team.book")} {barberName(b, lang).split(" ")[0]}
              </GlowLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
