"use client";

import { useEffect, useMemo, useState } from "react";
import { localeFor, upcomingDates, type Slot } from "@/lib/data";
import { useLang } from "../i18n/LanguageContext";

/**
 * Date strip + live availability time grid. Shared by the booking flow
 * (step 3) and the customer reschedule view on /booking/[token].
 * Availability is duration-aware via serviceId.
 */
export default function SlotPicker({
  serviceId,
  barberId,
  date,
  time,
  onPick,
  excludeToken,
}: {
  serviceId: string | null;
  barberId: string | null;
  date: string | null;
  time: string | null;
  onPick: (patch: {
    date: string;
    time: string | null;
    timeLabel: string | null;
  }) => void;
  /** Reschedule mode: this booking's own time should not block the picker. */
  excludeToken?: string;
}) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);

  const dates = useMemo(() => upcomingDates(14), []);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch live availability whenever the date (or chosen barber/service) changes.
  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    let alive = true;
    setLoading(true);
    const qs = new URLSearchParams({ date });
    if (barberId) qs.set("barberId", barberId);
    if (serviceId) qs.set("serviceId", serviceId);
    // Token travels as a header, not in the URL, to keep it out of access logs.
    fetch(`/api/availability?${qs.toString()}`, {
      headers: excludeToken ? { "x-manage-token": excludeToken } : undefined,
    })
      .then((r) => r.json())
      .then((data) => alive && setSlots(data.slots ?? []))
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [date, barberId, serviceId, excludeToken]);

  const dayPart = (d: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(d + "T12:00:00Z").toLocaleDateString(locale, {
      ...opts,
      timeZone: "UTC",
    });

  return (
    <div>
      {/* Date strip */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => {
          const selected = date === d;
          return (
            <button
              key={d}
              onClick={() => onPick({ date: d, time: null, timeLabel: null })}
              className={`flex shrink-0 flex-col items-center rounded-lg border px-4 py-3 transition-colors duration-200 ${
                selected
                  ? "border-neon-yellow bg-neon-yellow/10"
                  : "border-white/10 bg-white/[0.02] hover:border-neon-yellow/60"
              }`}
            >
              <span className="font-label text-[0.62rem] uppercase tracking-widest text-cream-dim">
                {dayPart(d, { weekday: "short" })}
              </span>
              <span className="font-display text-lg font-bold text-cream">
                {dayPart(d, { day: "numeric" })}
              </span>
              <span className="font-label text-[0.6rem] uppercase tracking-wider text-cream-dim">
                {dayPart(d, { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="mt-5 min-h-[3rem]">
        {!date && (
          <p className="font-body text-sm text-cream-dim">
            {t("book.cal.selectDate")}
          </p>
        )}
        {date && loading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-md bg-white/5" />
            ))}
          </div>
        )}
        {date && !loading && slots.length === 0 && (
          <p className="font-body text-sm text-cream-dim">
            {t("book.cal.noSlots")}
          </p>
        )}
        {date && !loading && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const selected = time === slot.value;
              return (
                <button
                  key={slot.value}
                  onClick={() =>
                    onPick({ date, time: slot.value, timeLabel: slot.label })
                  }
                  className={`rounded-md border py-2 font-label text-xs tracking-wide transition-colors duration-200 ${
                    selected
                      ? "border-neon-yellow bg-neon-yellow text-charcoal-deep"
                      : "border-white/10 text-cream hover:border-neon-yellow/60 hover:text-neon-yellow"
                  }`}
                  dir="ltr"
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
