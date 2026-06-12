"use client";

import { barbers, barberName, barberTitle } from "@/lib/data";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";

export default function StepBarber() {
  const { state, set, next, back } = useBooking();
  const { t, lang } = useLang();

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
                  {barberName(b, lang)}
                </span>
                <span className="block font-body text-xs text-cream-dim">
                  {barberTitle(b, lang)}
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
