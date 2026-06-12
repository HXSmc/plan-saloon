"use client";

import { useLang } from "./i18n/LanguageContext";

const STATS = [
  { value: "4.6★", key: "about.stat.rating" },
];

// Gallery tiles use warm amber gradients to evoke the chandelier-lit interior.
// Swap these for real interior photos by dropping images and using <img>.
const TILES = [
  {
    type: "image",
    src: "/storefront.jpg",
    alt: "Action Plan Barbershop Storefront",
  },
  {
    type: "image",
    src: "/IMG_6898.jpg",
    alt: "interior 1",
  },
  {
    type: "image",
    src: "/IMG_6899.jpg",
    alt: "interior 2",
  },
  {
    type: "image",
    src: "/IMG_6900.jpg",
    alt: "interior 3",
  },
];

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="amber-glow relative bg-charcoal-deep py-24">
      <div className="texture-stone absolute inset-0 opacity-50" />
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

          <div className="mt-9 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.key}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center"
              >
                <div className="font-display text-3xl font-extrabold text-neon-yellow glow-text-yellow">
                  {s.value}
                </div>
                <div className="mt-1 font-label text-[0.58rem] uppercase tracking-widest text-cream-dim">
                  {t(s.key)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-4">
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl border border-white/10 ${
                i % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              } ${tile.type === "gradient" ? `bg-gradient-to-br $` : "bg-charcoal"}`}
            >
              {tile.type === "image" ? (
                /* Real Photo Layout */
                <img
                  src={tile.src}
                  alt={tile.alt || "Barbershop interior"}
                  className="h-full w-full object-cover brightness-90 sepia-[0.15] transition-transform duration-300 hover:scale-105"
                />
              ) : (
                /* Faux Ambient Chandelier Layout */
                <>
                  <div className="texture-stone absolute inset-0 opacity-50" />
                  <div className="absolute left-1/2 top-3 h-16 w-16 -translate-x-1/2 rounded-full bg-yellow-400/20 blur-2xl" />
                </>
              )}

              {/* Shared overlay text layer for styling cohesion */}
              <span className="absolute bottom-3 start-3 font-label text-[0.55rem] uppercase tracking-widest text-cream-dim/70 bg-charcoal-deep/40 px-2 py-0.5 rounded backdrop-blur-xs">
                {t("about.interior")} 0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
