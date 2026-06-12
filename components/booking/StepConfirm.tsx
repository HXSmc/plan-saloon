"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateLabel } from "@/lib/data";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";

type Result = {
  id: string;
  service: string;
  barber: string;
  startTime: string;
  price: number;
};

export default function StepConfirm() {
  const { state, goTo, close, reset } = useBooking();
  const { t, lang } = useLang();
  const submitted = useRef(false);

  const [status, setStatus] = useState<"loading" | "ok" | "conflict" | "error">(
    "loading"
  );
  const [result, setResult] = useState<Result | null>(null);

  // Submit the booking to the API exactly once when this step mounts.
  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: state.serviceId,
        barberId: state.barberId,
        date: state.date,
        value: state.time,
        customerName: state.contact.name,
        customerPhone: state.contact.phone,
        customerEmail: state.contact.email || undefined,
      }),
    })
      .then(async (res) => {
        if (res.status === 201) {
          setResult(await res.json());
          setStatus("ok");
        } else if (res.status === 409) {
          setStatus("conflict");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [state]);

  if (status === "loading") {
    return (
      <div className="animate-fade-up py-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-neon-yellow" />
        <p className="mt-4 font-body text-sm text-cream-dim">
          {t("book.done.submitting")}
        </p>
      </div>
    );
  }

  if (status === "conflict" || status === "error") {
    const conflict = status === "conflict";
    return (
      <div className="animate-fade-up py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon-red text-neon-red shadow-glow-red">
          ✕
        </div>
        <h3 className="mt-5 font-display text-xl font-extrabold text-cream">
          {conflict ? t("book.err.conflictTitle") : t("book.err.title")}
        </h3>
        <p className="mt-1 font-body text-sm text-cream-dim">
          {conflict ? t("book.err.conflictBody") : t("book.err.body")}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <GlowButton
            size="sm"
            onClick={() => {
              submitted.current = false;
              goTo(3);
            }}
          >
            {t("book.err.pickAnother")}
          </GlowButton>
        </div>
      </div>
    );
  }

  // Success
  const rows: [string, string][] = [
    [
      t("book.done.row.service"),
      result ? `${result.service} · SAR ${result.price}` : "—",
    ],
    [t("book.done.row.barber"), result ? result.barber : "—"],
    [
      t("book.done.row.when"),
      state.date
        ? `${formatDateLabel(state.date, lang)} ${t("book.done.at")} ${
            state.timeLabel ?? ""
          }`
        : "—",
    ],
    [t("book.done.row.name"), state.contact.name],
  ];

  return (
    <div className="animate-fade-up text-center">
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
        {state.contact.email ? (
          <>
            {t("book.done.subA")}{" "}
            <span className="text-cream" dir="ltr">
              {state.contact.email}
            </span>
            .
          </>
        ) : (
          t("book.done.subPhone")
        )}
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
