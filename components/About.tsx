"use client";

import { shopInfo } from "@/lib/data";
import { useLang } from "./i18n/LanguageContext";
import { Star } from "./icons";

// Real interior photos supplied by the client.
const TILES = [
  { src: "/storefront.jpg", alt: "Action Plan Barbershop storefront" },
  { src: "/IMG_6898.jpg", alt: "Barbershop interior" },
  { src: "/IMG_6899.jpg", alt: "Barbershop interior" },
  { src: "/IMG_6900.jpg", alt: "Barbershop interior" },
];

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="amber-glow relative bg-charcoal-deep py-24">
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        {/* Copy */}
        <div>
          <p className="eyebrow text-neon-yellow">{t("about.eyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-cream sm:text-5xl">
            {t("about.title")}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-cream-dim">
            {t("about.p1")}
          </p>
          <p className="mt-4 font-body text-base leading-relaxed text-cream-dim">
            {t("about.p2")}
          </p>

          {/* Link to the shop's real Google reviews — no invented numbers. */}
          <a
            href={shopInfo.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-5 py-3.5 transition-colors hover:border-neon-yellow/60"
          >
            <span className="text-neon-yellow">
              <Star size={18} />
            </span>
            <span className="font-label text-xs uppercase tracking-widest text-cream">
              {t("about.reviews")}
            </span>
          </a>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-4">
          {TILES.map((tile, i) => (
            <div
              key={tile.src}
              className={`relative overflow-hidden rounded-xl border border-white/10 bg-charcoal ${
                i % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <img
                src={tile.src}
                alt={tile.alt}
                loading="lazy"
                className="h-full w-full object-cover brightness-90 sepia-[0.15] transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
