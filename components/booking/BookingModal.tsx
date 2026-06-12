"use client";

import { useEffect } from "react";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import StepService from "./StepService";
import StepBarber from "./StepBarber";
import StepCalendar from "./StepCalendar";
import StepInfo from "./StepInfo";
import StepConfirm from "./StepConfirm";

const STEP_KEYS = [
  "booking.step.service",
  "booking.step.barber",
  "booking.step.time",
  "booking.step.details",
  "booking.step.done",
];

export default function BookingModal() {
  const { isOpen, step, close } = useBooking();
  const { t } = useLang();

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Book an appointment"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      {/* Panel */}
      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-charcoal texture-stone p-6 shadow-2xl sm:rounded-2xl sm:p-8">
        <button
          onClick={close}
          aria-label={t("booking.close")}
          className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-cream-dim transition-colors hover:border-neon-yellow/60 hover:text-neon-yellow"
        >
          ✕
        </button>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-1.5 pe-10">
          {STEP_KEYS.map((key, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`h-1 w-full rounded-full transition-colors ${
                    done || active ? "bg-neon-yellow" : "bg-white/10"
                  }`}
                />
                <span
                  className={`font-label text-[0.55rem] uppercase tracking-wider transition-colors ${
                    active ? "text-neon-yellow" : "text-cream-dim/60"
                  }`}
                >
                  {t(key)}
                </span>
              </div>
            );
          })}
        </div>

        {step === 1 && <StepService />}
        {step === 2 && <StepBarber />}
        {step === 3 && <StepCalendar />}
        {step === 4 && <StepInfo />}
        {step === 5 && <StepConfirm />}
      </div>
    </div>
  );
}
