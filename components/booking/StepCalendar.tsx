"use client";

import { useEffect, useMemo, useState } from "react";
import { localeFor, upcomingDates, type Slot } from "@/lib/data";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";

export default function StepCalendar() {
  const { state, set, next, back } = useBooking();
  const { t, lang } = useLang();
  const locale = localeFor(lang);

  const dates = useMemo(() => upcomingDates(14), []);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch live availability whenever the date (or chosen barber) changes.
  useEffect(() => {
    if (!state.date) {
      setSlots([]);
      return;
    }
    let alive = true;
    setLoading(true);
    const qs = new URLSearchParams({ date: state.date });
    if (state.barberId) qs.set("barberId", state.barberId);
    fetch(`/api/availability?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => alive && setSlots(data.slots ?? []))
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [state.date, state.barberId]);

  return (
    <div className="animate-fade-up">
      <h3 className="font-display text-2xl font-extrabold text-cream">
        {t("book.cal.title")}
      </h3>
      <p className="mt-1 font-body text-sm text-cream-dim">
        {t("book.cal.subcopy")}
      </p>

      {/* Date strip */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => {
          const selected = state.date === d;
          const day = new Date(d + "T00:00:00").toLocaleDateString(locale, {
            day: "numeric",
          });
          const weekday = new Date(d + "T00:00:00").toLocaleDateString(locale, {
            weekday: "short",
          });
          return (
            <button
              key={d}
              onClick={() => set({ date: d, time: null, timeLabel: null })}
              className={`flex shrink-0 flex-col items-center rounded-lg border px-4 py-3 transition-all duration-200 ${
                selected
                  ? "border-neon-yellow bg-neon-yellow/10 shadow-glow-yellow"
                  : "border-white/10 bg-white/[0.02] hover:border-neon-yellow/60"
              }`}
            >
              <span className="font-label text-[0.6rem] uppercase tracking-widest text-cream-dim">
                {weekday}
              </span>
              <span className="font-display text-lg font-bold text-cream">
                {day}
              </span>
              <span className="font-label text-[0.55rem] uppercase tracking-wider text-cream-dim">
                {new Date(d + "T00:00:00").toLocaleDateString(locale, {
                  month: "short",
                })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="mt-5 min-h-[3rem]">
        {!state.date && (
          <p className="font-body text-sm text-cream-dim">
            {t("book.cal.selectDate")}
          </p>
        )}
        {state.date && loading && (
          <p className="font-body text-sm text-cream-dim">…</p>
        )}
        {state.date && !loading && slots.length === 0 && (
          <p className="font-body text-sm text-cream-dim">
            {t("book.cal.noSlots")}
          </p>
        )}
        {state.date && !loading && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const selected = state.time === slot.value;
              return (
                <button
                  key={slot.value}
                  onClick={() =>
                    set({ time: slot.value, timeLabel: slot.label })
                  }
                  className={`rounded-md border py-2 font-label text-xs tracking-wide transition-all duration-200 ${
                    selected
                      ? "border-neon-yellow bg-neon-yellow text-charcoal-deep shadow-glow-yellow"
                      : "border-white/10 text-cream hover:border-neon-yellow/60 hover:text-neon-yellow"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <GlowButton variant="ghost" size="sm" onClick={back}>
          <span className="rtl:hidden">←</span>
          <span className="hidden rtl:inline">→</span> {t("booking.back")}
        </GlowButton>
        <GlowButton
          size="sm"
          disabled={!state.date || !state.time}
          onClick={next}
        >
          {t("booking.continue")} <span className="rtl:hidden">→</span>
          <span className="hidden rtl:inline">←</span>
        </GlowButton>
      </div>
    </div>
  );
}
