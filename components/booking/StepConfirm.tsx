"use client";

import { useEffect, useRef } from "react";
import {
  barbers,
  barberName,
  formatDateLabel,
  services,
  svcName,
} from "@/lib/data";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";

export default function StepConfirm() {
  const { state, close, reset } = useBooking();
  const { t, lang } = useLang();
  const logged = useRef(false);

  const service = services.find((s) => s.id === state.serviceId);
  const barber = state.barberId
    ? barbers.find((b) => b.id === state.barberId)
    : null;

  // Pass 1 stub: log the booking payload. Pass 2 replaces this with a POST
  // to /api/bookings (conflict-checked) + transactional email.
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    const payload = {
      serviceId: state.serviceId,
      barberId: state.barberId, // null === first available
      date: state.date,
      time: state.time,
      contact: state.contact,
      createdAt: new Date().toISOString(),
    };
    // eslint-disable-next-line no-console
    console.log("[booking stub] would submit:", payload);
    // TODO(Pass 2): await fetch("/api/bookings", { method: "POST", body: ... })
  }, [state]);

  const rows: [string, string][] = [
    [
      t("book.done.row.service"),
      service ? `${svcName(service, lang)} · $${service.price}` : "—",
    ],
    [
      t("book.done.row.barber"),
      barber ? barberName(barber, lang) : t("book.barber.firstAvailable"),
    ],
    [
      t("book.done.row.when"),
      state.date
        ? `${formatDateLabel(state.date, lang)} ${t("book.done.at")} ${state.time}`
        : "—",
    ],
    [t("book.done.row.name"), state.contact.name],
  ];

  return (
    <div className="animate-fade-up text-center">
      {/* Neon success badge */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon-yellow text-neon-yellow shadow-glow-yellow-lg glow-text-yellow">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="mt-5 font-display text-2xl font-extrabold text-cream">
        {t("book.done.title")}
      </h3>
      <p className="mt-1 font-body text-sm text-cream-dim">
        {t("book.done.subA")}{" "}
        <span className="text-cream" dir="ltr">
          {state.contact.email}
        </span>
        .
      </p>

      <div className="mt-6 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-5 text-left">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="font-label text-[0.62rem] uppercase tracking-widest text-cream-dim">
              {label}
            </span>
            <span className="font-body text-sm text-cream">{value}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 font-body text-[0.7rem] text-cream-dim/70">
        {t("book.done.demo")}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <GlowButton variant="outline" size="sm" onClick={reset}>
          {t("book.done.another")}
        </GlowButton>
        <GlowButton size="sm" onClick={close}>
          {t("book.done.done")}
        </GlowButton>
      </div>
    </div>
  );
}
