"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "../Logo";
import LangToggle from "../LangToggle";
import { X, Check, ServiceIcon, Clock } from "../icons";
import { formatDateLabel, svcName, barberName } from "@/lib/data";
import { BookingProvider, useBooking, type BookingStep } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import { useCatalog } from "./useCatalog";
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

export default function BookingFlow({
  initialServiceId,
  initialBarberId,
}: {
  initialServiceId: string | null;
  initialBarberId: string | null;
}) {
  return (
    <BookingProvider
      initialServiceId={initialServiceId}
      initialBarberId={initialBarberId}
    >
      <FlowShell />
    </BookingProvider>
  );
}

function FlowShell() {
  const { step, state, set, goTo } = useBooking();
  const { t } = useLang();
  const { services, barbers, loading } = useCatalog();

  // Stale/mistyped deep links (?service=…, ?barber=…) must not sail through to
  // a guaranteed failure at submit — drop the bad id and return to selection.
  useEffect(() => {
    if (loading || step === 5) return;
    if (state.serviceId && !services.some((s) => s.id === state.serviceId)) {
      set({ serviceId: null, time: null, timeLabel: null });
      goTo(1);
    } else if (state.barberId && !barbers.some((b) => b.id === state.barberId)) {
      set({ barberId: null, time: null, timeLabel: null });
      if (step > 2) goTo(2);
    }
  }, [loading, services, barbers, state.serviceId, state.barberId, step, set, goTo]);

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Slim flow header: logo home-link, language, exit. */}
      <header className="border-b border-white/10 bg-charcoal-deep/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" aria-label="Action Plan Barbershop home">
            <Logo size={32} />
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link
              href="/"
              aria-label={t("book.done.backHome")}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-cream-dim transition-colors hover:border-neon-yellow/60 hover:text-neon-yellow"
            >
              <X size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-12">
        <h1 className="font-display text-3xl font-extrabold text-cream sm:text-4xl">
          {t("book.title")}
        </h1>

        {/* Progress: numbered steps, clickable when already passed. */}
        <Progress />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {step === 1 && <StepService />}
            {step === 2 && <StepBarber />}
            {step === 3 && <StepCalendar />}
            {step === 4 && <StepInfo />}
            {step === 5 && <StepConfirm />}
          </div>
          {step < 5 && <SummaryRail />}
        </div>
      </main>
    </div>
  );
}

function Progress() {
  const { step, goTo, state } = useBooking();
  const { t } = useLang();

  // A step is reachable if everything before it is filled in.
  const reachable = (n: BookingStep): boolean => {
    if (n >= 5 || step === 5) return false; // never jump into/out of submission
    if (n === 1) return true;
    if (n === 2) return !!state.serviceId;
    if (n === 3) return !!state.serviceId; // barber may legitimately be null
    return !!(state.serviceId && state.date && state.time);
  };

  return (
    <ol className="mt-6 flex items-center gap-2 sm:gap-3">
      {STEP_KEYS.map((key, i) => {
        const n = (i + 1) as BookingStep;
        const active = n === step;
        const done = n < step;
        const canJump = done && reachable(n);
        return (
          <li key={key} className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && goTo(n)}
              className={`h-1 w-full rounded-full transition-colors ${
                done || active ? "bg-neon-yellow" : "bg-white/10"
              } ${canJump ? "cursor-pointer" : "cursor-default"}`}
              aria-label={t(key)}
            />
            <span
              className={`hidden font-label text-[0.65rem] uppercase tracking-wider sm:block ${
                active ? "text-neon-yellow" : "text-cream-dim/60"
              }`}
            >
              {done ? (
                <span className="inline-flex items-center gap-1">
                  <Check size={11} /> {t(key)}
                </span>
              ) : (
                t(key)
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Sticky live summary of the selections so far (desktop side rail). */
function SummaryRail() {
  const { state } = useBooking();
  const { t, lang } = useLang();
  const { services, barbers } = useCatalog();

  const service = services.find((s) => s.id === state.serviceId) ?? null;
  const barber = barbers.find((b) => b.id === state.barberId) ?? null;

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (service) {
    rows.push({
      label: t("book.done.row.service"),
      value: (
        <span className="inline-flex items-center gap-2">
          <span className="text-neon-yellow">
            <ServiceIcon icon={service.icon} size={15} />
          </span>
          {svcName(service, lang)}
        </span>
      ),
    });
  }
  if (state.serviceId) {
    rows.push({
      label: t("book.done.row.barber"),
      value: barber
        ? barberName(barber, lang)
        : state.barberId === null
          ? t("book.barber.firstAvailable")
          : "…",
    });
  }
  if (state.date && state.time) {
    rows.push({
      label: t("book.done.row.when"),
      value: `${formatDateLabel(state.date, lang)} · ${state.timeLabel}`,
    });
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8 rounded-xl border border-white/10 bg-charcoal p-5">
        <p className="font-label text-[0.68rem] uppercase tracking-[0.2em] text-cream-dim">
          {t("book.summary")}
        </p>
        {rows.length === 0 ? (
          <p className="mt-4 font-body text-sm text-cream-dim/60">—</p>
        ) : (
          <dl className="mt-4 space-y-3">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="font-label text-[0.62rem] uppercase tracking-widest text-cream-dim/70">
                  {r.label}
                </dt>
                <dd className="mt-0.5 font-body text-sm text-cream">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {service && (
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="inline-flex items-center gap-1.5 font-label text-xs text-cream-dim">
              <Clock size={13} /> {service.durationMin} {t("services.min")}
            </span>
            <span className="font-display text-xl font-extrabold text-neon-yellow">
              SAR {service.price}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
