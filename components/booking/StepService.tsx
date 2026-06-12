"use client";

import { svcName, svcDesc } from "@/lib/data";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import { useCatalog } from "./useCatalog";
import { ServiceIcon, Clock } from "../icons";

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

      {loading && <p className="mt-6 font-body text-sm text-cream-dim">…</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((svc) => {
          const selected = state.serviceId === svc.id;
          return (
            <button
              key={svc.id}
              onClick={() => {
                set({ serviceId: svc.id, time: null, timeLabel: null });
                next();
              }}
              className={`group flex items-start gap-3 rounded-lg border p-4 text-start transition-colors duration-200 ${
                selected
                  ? "border-neon-yellow bg-neon-yellow/10"
                  : "border-white/10 bg-white/[0.02] hover:border-neon-yellow/60 hover:bg-white/[0.04]"
              }`}
            >
              <span className="mt-0.5 text-neon-yellow">
                <ServiceIcon icon={svc.icon} size={22} />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-cream">
                    {svcName(svc, lang)}
                  </span>
                  <span className="font-display font-bold text-neon-yellow">
                    SAR {svc.price}
                  </span>
                </span>
                <span className="mt-1 block font-body text-xs text-cream-dim">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {svc.durationMin} {t("services.min")}
                  </span>{" "}
                  · {svcDesc(svc, lang)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
