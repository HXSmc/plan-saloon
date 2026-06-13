"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../Logo";
import LangToggle from "../LangToggle";
import GlowButton, { GlowLink } from "../GlowButton";
import SlotPicker from "./SlotPicker";
import { Calendar, Check, X } from "../icons";
import { useLang } from "../i18n/LanguageContext";

type Booking = {
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  startTime: string;
  customerName: string;
  serviceId: string;
  service: string;
  service_ar: string;
  price: number;
  durationMin: number;
  barberId: string;
  barber: string;
  barber_ar: string;
};

const STATUS_TONES: Record<Booking["status"], string> = {
  PENDING: "border-white/20 text-cream-dim",
  CONFIRMED: "border-neon-yellow/50 text-neon-yellow",
  COMPLETED: "border-neon-blue/50 text-neon-blue",
  NO_SHOW: "border-neon-red/50 text-neon-red",
  CANCELLED: "border-neon-red/50 text-neon-red",
};

export default function ManageBooking({ token }: { token: string }) {
  const { t, lang } = useLang();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound">(
    "loading"
  );
  const [mode, setMode] = useState<"view" | "reschedule" | "cancelAsk">("view");
  const [pick, setPick] = useState<{
    date: string | null;
    time: string | null;
    timeLabel: string | null;
  }>({ date: null, time: null, timeLabel: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/bookings/${token}`);
    if (!res.ok) {
      setState("notFound");
      return;
    }
    setBooking(await res.json());
    setState("ready");
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: Record<string, unknown>, noticeKey: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/bookings/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      setBooking(await res.json());
      setMode("view");
      setNotice(t(noticeKey));
      setPick({ date: null, time: null, timeLabel: null });
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? t("book.err.body"));
    }
  }

  const whenLabel = (iso: string) =>
    new Date(iso).toLocaleString(lang === "ar" ? "ar" : "en-US", {
      timeZone: "Asia/Riyadh",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const isPast = booking && new Date(booking.startTime).getTime() < Date.now();
  const actionable =
    booking &&
    !isPast &&
    (booking.status === "CONFIRMED" || booking.status === "PENDING");

  return (
    <div className="min-h-screen bg-charcoal-deep">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Action Plan Barbershop home">
            <Logo size={32} />
          </Link>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        {state === "loading" && (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-neon-yellow" />
          </div>
        )}

        {state === "notFound" && (
          <div className="py-16 text-center">
            <h1 className="font-display text-2xl font-extrabold text-cream">
              {t("manage.notFound")}
            </h1>
            <GlowLink href="/" size="sm" className="mt-6">
              {t("manage.backHome")}
            </GlowLink>
          </div>
        )}

        {state === "ready" && booking && (
          <>
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-3xl font-extrabold text-cream">
                {t("manage.title")}
              </h1>
              <span
                className={`rounded-full border px-3 py-1 font-label text-[0.65rem] uppercase tracking-widest ${STATUS_TONES[booking.status]}`}
              >
                {t(`manage.status.${booking.status}`)}
              </span>
            </div>

            {notice && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-neon-yellow/40 bg-neon-yellow/10 px-4 py-3 font-body text-sm text-neon-yellow">
                <Check size={15} /> {notice}
              </div>
            )}
            {booking.status === "CANCELLED" && (
              <p className="mt-4 rounded-lg border border-neon-red/30 bg-neon-red/5 px-4 py-3 font-body text-sm text-cream-dim">
                {t("manage.cancelled")}
              </p>
            )}
            {isPast && booking.status !== "CANCELLED" && (
              <p className="mt-4 font-body text-sm text-cream-dim">
                {t("manage.past")}
              </p>
            )}

            {/* Booking card */}
            <div className="mt-6 rounded-xl border border-white/10 bg-charcoal p-6">
              <div className="flex items-start gap-4">
                <span className="mt-1 text-neon-yellow">
                  <Calendar size={22} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-xl font-bold text-cream">
                    {lang === "ar" ? booking.service_ar : booking.service}
                  </p>
                  <p className="mt-1 font-body text-sm text-cream-dim">
                    {whenLabel(booking.startTime)}
                  </p>
                  <p className="mt-1 font-body text-sm text-cream-dim">
                    {lang === "ar" ? booking.barber_ar : booking.barber} ·{" "}
                    {booking.durationMin} {t("services.min")} ·{" "}
                    <span className="text-neon-yellow">SAR {booking.price}</span>
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 font-body text-sm text-neon-red">{error}</p>
            )}

            {/* Actions — inline expansion, no overlays. */}
            {actionable && mode === "view" && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <GlowButton size="sm" onClick={() => setMode("reschedule")}>
                  {t("manage.reschedule")}
                </GlowButton>
                <GlowButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("cancelAsk")}
                  className="hover:text-neon-red"
                >
                  {t("manage.cancel")}
                </GlowButton>
              </div>
            )}

            {actionable && mode === "cancelAsk" && (
              <div className="mt-6 rounded-xl border border-neon-red/30 bg-neon-red/5 p-5">
                <p className="font-display font-bold text-cream">
                  {t("manage.cancelAsk")}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <GlowButton
                    size="sm"
                    disabled={busy}
                    onClick={() => patch({ action: "cancel" }, "manage.cancelled")}
                    className="!bg-neon-red !text-cream !shadow-none hover:!bg-neon-red/90"
                  >
                    {t("manage.cancelYes")}
                  </GlowButton>
                  <GlowButton
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => setMode("view")}
                  >
                    {t("manage.cancelKeep")}
                  </GlowButton>
                </div>
              </div>
            )}

            {actionable && mode === "reschedule" && (
              <div className="mt-6 rounded-xl border border-white/10 bg-charcoal p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-cream">
                    {t("manage.pickNew")}
                  </p>
                  <button
                    onClick={() => setMode("view")}
                    aria-label={t("manage.cancelKeep")}
                    className="text-cream-dim hover:text-cream"
                  >
                    <X size={16} />
                  </button>
                </div>
                <SlotPicker
                  serviceId={booking.serviceId}
                  barberId={booking.barberId}
                  excludeToken={token}
                  date={pick.date}
                  time={pick.time}
                  onPick={setPick}
                />
                <div className="mt-5">
                  <GlowButton
                    size="sm"
                    disabled={busy || !pick.date || !pick.time}
                    onClick={() =>
                      patch(
                        {
                          action: "reschedule",
                          date: pick.date,
                          value: pick.time,
                        },
                        "manage.rescheduled"
                      )
                    }
                  >
                    {t("manage.confirmNew")}
                  </GlowButton>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
