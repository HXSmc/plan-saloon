"use client";

import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";
import SlotPicker from "./SlotPicker";
import { ChevronLeft, ArrowNext } from "../icons";

export default function StepCalendar() {
  const { state, set, next, back } = useBooking();
  const { t } = useLang();

  return (
    <div className="animate-fade-up">
      <h3 className="font-display text-2xl font-extrabold text-cream">
        {t("book.cal.title")}
      </h3>
      <p className="mt-1 font-body text-sm text-cream-dim">
        {t("book.cal.subcopy")}
      </p>

      <SlotPicker
        serviceId={state.serviceId}
        barberId={state.barberId}
        date={state.date}
        time={state.time}
        onPick={(patch) => set(patch)}
      />

      <div className="mt-6 flex items-center justify-between">
        <GlowButton variant="ghost" size="sm" onClick={back}>
          <ChevronLeft size={14} className="rtl:-scale-x-100" />
          {t("booking.back")}
        </GlowButton>
        <GlowButton size="sm" disabled={!state.date || !state.time} onClick={next}>
          {t("booking.continue")} <ArrowNext size={14} />
        </GlowButton>
      </div>
    </div>
  );
}
