"use client";

import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import { useCatalog } from "./useCatalog";

export default function StepService() {
  const { state, set, next } = useBooking();
  const { t, lang } = useLang();
  const { services, loading } = useCatalog();

  return (
    <div className="animate-fade-up">
      <h3 className="font-display text-2xl font-extrabold text-cream">
        {t("book.service.title")}
      </h3>
      <p className="mt-1 font-body text-sm text-cream-dim">
        {t("book.service.subcopy")}
      </p>

      {loading && (
        <p className="mt-6 font-body text-sm text-cream-dim">…</p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((svc) => {
          const selected = state.serviceId === svc.id;
          return (
            <button
              key={svc.id}
              onClick={() => {
                set({ serviceId: svc.id });
                next();
              }}
              className={`group flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-neon-yellow bg-neon-yellow/10 shadow-glow-yellow"
                  : "border-white/10 bg-white/[0.02] hover:border-neon-yellow/60 hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {svc.icon}
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-cream">
                    {lang === "ar" ? svc.name_ar : svc.name}
                  </span>
                  <span className="font-display font-bold text-neon-yellow">
                    SAR {svc.price}
                  </span>
                </span>
                <span className="mt-1 block font-body text-xs text-cream-dim">
                  {svc.durationMin} {t("services.min")} ·{" "}
                  {lang === "ar" ? svc.description_ar : svc.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
