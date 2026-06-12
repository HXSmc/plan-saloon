"use client";

import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import { useCatalog } from "./useCatalog";
import GlowButton from "../GlowButton";

export default function StepBarber() {
  const { state, set, next, back } = useBooking();
  const { t, lang } = useLang();
  const { barbers } = useCatalog();

  const choose = (barberId: string | null) => {
    set({ barberId });
    next();
  };

  return (
    <div className="animate-fade-up">
      <h3 className="font-display text-2xl font-extrabold text-cream">
        {t("book.barber.title")}
      </h3>
      <p className="mt-1 font-body text-sm text-cream-dim">
        {t("book.barber.subcopy")}
      </p>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => choose(null)}
          className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all duration-200 ${
            state.barberId === null && state.barberId !== undefined
              ? "border-neon-yellow/60"
              : "border-white/10"
          } bg-white/[0.02] hover:border-neon-yellow/60 hover:bg-white/[0.04]`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-yellow/15 text-xl">
            ⚡
          </span>
          <span>
            <span className="block font-display font-bold text-cream">
              {t("book.barber.firstAvailable")}
            </span>
            <span className="block font-body text-xs text-cream-dim">
              {t("book.barber.firstAvailableDesc")}
            </span>
          </span>
        </button>

        {barbers.map((b) => {
          const selected = state.barberId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => choose(b.id)}
              className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-neon-yellow bg-neon-yellow/10 shadow-glow-yellow"
                  : "border-white/10 bg-white/[0.02] hover:border-neon-yellow/60 hover:bg-white/[0.04]"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-neon-yellow/40 font-display font-bold text-neon-yellow">
                {b.initials}
              </span>
              <span>
                <span className="block font-display font-bold text-cream">
                  {lang === "ar" ? b.name_ar : b.name}
                </span>
                <span className="block font-body text-xs text-cream-dim">
                  {lang === "ar" ? b.title_ar : b.title}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <GlowButton variant="ghost" size="sm" onClick={back}>
          <span className="rtl:hidden">←</span>
          <span className="hidden rtl:inline">→</span> {t("booking.back")}
        </GlowButton>
      </div>
    </div>
  );
}
