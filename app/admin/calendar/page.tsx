"use client";

// Day timeline calendar: one column per barber, appointments positioned by
// their real start/duration (no fixed grid — off-grid times stay visible).
// Click an empty area to log a walk-in; click a booking to manage it in a
// side panel. Cancellations are instant with Undo — no confirm() popups.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  fmtMoney,
  fmtTime,
  minuteOf,
  minToHHMM,
  minToLabel,
  todayStr,
  weekdayOfDate,
  BLOCK_STYLES,
  STATUS_STYLES,
} from "@/components/admin/util";
import type {
  AdminAppointment,
  AdminBarber,
  AdminService,
} from "@/components/admin/types";
import SidePanel from "@/components/admin/SidePanel";
import { useToast } from "@/components/admin/Toast";
import { btn, Field, Select, DangerButton } from "@/components/admin/ui";
import { ChevronLeft, ChevronRight, Phone } from "@/components/icons";

const PX_PER_MIN = 1.15; // 45-min appointment ≈ 52px tall
const SNAP_MIN = 15;

export default function CalendarPage() {
  const [date, setDate] = useState(todayStr());
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [appts, setAppts] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Panel state
  const [walkIn, setWalkIn] = useState<{ barberId: string; startMin: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadAppts = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/appointments?from=${date}&to=${date}`);
    setAppts(r.ok ? await r.json() : []);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/barbers").then((r) => r.json()),
      fetch("/api/admin/services").then((r) => r.json()),
    ]).then(([b, s]) => {
      setBarbers((b as AdminBarber[]).filter((x) => x.active));
      setServices((s as AdminService[]).filter((x) => x.active));
    });
  }, []);

  useEffect(() => {
    loadAppts();
  }, [loadAppts]);

  const weekday = weekdayOfDate(date);

  // Per-barber working window for this date.
  const windows = useMemo(() => {
    const map = new Map<string, { startMin: number; endMin: number; off: boolean }>();
    for (const b of barbers) {
      const wh = b.workingHours.find((h) => h.weekday === weekday);
      map.set(b.id, {
        startMin: wh?.startMin ?? 720,
        endMin: wh?.endMin ?? 1440,
        off: wh?.isOff ?? false,
      });
    }
    return map;
  }, [barbers, weekday]);

  // Epoch ms of the displayed date's midnight (shop-local). Appointment
  // positions are minutes relative to this, so a booking that started the
  // previous evening renders (clamped) at the top instead of at a fake time.
  const dayMs = useMemo(
    () => new Date(`${date}T00:00:00+03:00`).getTime(),
    [date]
  );
  const relMin = (iso: string) => (new Date(iso).getTime() - dayMs) / 60000;

  // Timeline range: union of working windows, padded to the hour.
  const [rangeStart, rangeEnd] = useMemo(() => {
    const active = [...windows.values()].filter((w) => !w.off);
    // Appointments outside hours (admin overrides) must stay visible too.
    const apptMins = appts
      .filter((a) => a.status !== "CANCELLED")
      .flatMap((a) => [
        (new Date(a.startTime).getTime() - dayMs) / 60000,
        (new Date(a.endTime).getTime() - dayMs) / 60000,
      ])
      .map((m) => Math.max(0, Math.min(1440, m)));
    const starts = [...active.map((w) => w.startMin), ...apptMins];
    const ends = [...active.map((w) => w.endMin), ...apptMins];
    const lo = starts.length ? Math.min(...starts) : 720;
    const hi = ends.length ? Math.max(...ends) : 1440;
    return [
      Math.max(0, Math.floor(lo / 60) * 60),
      Math.min(1440, Math.ceil(hi / 60) * 60),
    ];
  }, [windows, appts, dayMs]);

  const totalH = (rangeEnd - rangeStart) * PX_PER_MIN;
  const hourMarks = useMemo(() => {
    const out: number[] = [];
    for (let m = rangeStart; m <= rangeEnd; m += 60) out.push(m);
    return out;
  }, [rangeStart, rangeEnd]);

  const visible = appts.filter((a) => a.status !== "CANCELLED");
  const selected = visible.find((a) => a.id === selectedId) ?? null;

  function columnClick(e: React.MouseEvent<HTMLDivElement>, barberId: string) {
    // Ignore clicks that bubbled from an appointment block.
    if ((e.target as HTMLElement).closest("[data-appt]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const min = rangeStart + (e.clientY - rect.top) / PX_PER_MIN;
    const snapped = Math.round(min / SNAP_MIN) * SNAP_MIN;
    setWalkIn({ barberId, startMin: Math.max(rangeStart, Math.min(snapped, rangeEnd - SNAP_MIN)) });
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Calendar</h1>
          <p className="mt-1 text-sm text-cream-dim">
            Click an empty space to log a walk-in; click a booking to manage it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(addDays(date, -1))} aria-label="Previous day" className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-cream-dim hover:text-cream">
            <ChevronLeft size={15} />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream"
          />
          <button onClick={() => setDate(addDays(date, 1))} aria-label="Next day" className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-cream-dim hover:text-cream">
            <ChevronRight size={15} />
          </button>
          <button onClick={() => setDate(todayStr())} className={btn.ghost}>
            Today
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-charcoal">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div
            className="grid border-b border-white/10"
            style={{ gridTemplateColumns: `64px repeat(${barbers.length}, 1fr)` }}
          >
            <div />
            {barbers.map((b) => {
              const w = windows.get(b.id)!;
              return (
                <div key={b.id} className="border-l border-white/5 px-3 py-3 text-center">
                  <p className="text-sm font-semibold text-cream">{b.name}</p>
                  <p className="mt-0.5 text-[0.68rem] text-cream-dim" dir="ltr">
                    {w.off ? "Day off" : `${minToHHMM(w.startMin)} – ${minToHHMM(w.endMin)}`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Timeline body */}
          <div
            className="relative grid"
            style={{ gridTemplateColumns: `64px repeat(${barbers.length}, 1fr)`, height: totalH }}
          >
            {/* Hour gutter + lines */}
            <div className="relative">
              {hourMarks.map((m) => (
                <span
                  key={m}
                  className="absolute right-2 -translate-y-1/2 font-mono text-[0.65rem] text-cream-dim/70"
                  style={{ top: (m - rangeStart) * PX_PER_MIN }}
                >
                  {minToHHMM(m)}
                </span>
              ))}
            </div>
            {hourMarks.map((m) => (
              <div
                key={`line-${m}`}
                className="pointer-events-none absolute left-16 right-0 border-t border-white/[0.05]"
                style={{ top: (m - rangeStart) * PX_PER_MIN }}
              />
            ))}

            {/* Barber columns */}
            {barbers.map((b) => {
              const w = windows.get(b.id)!;
              const offBlocks = b.timeOff
                .map((t) => ({
                  id: t.id,
                  reason: t.reason,
                  startMin: relMin(t.start),
                  endMin: relMin(t.end),
                }))
                .filter((t) => t.endMin > rangeStart && t.startMin < rangeEnd);

              return (
                <div
                  key={b.id}
                  onClick={(e) => !w.off && columnClick(e, b.id)}
                  className={`relative border-l border-white/5 ${
                    w.off ? "bg-white/[0.015]" : "cursor-cell hover:bg-white/[0.015]"
                  }`}
                >
                  {/* Shade outside working hours */}
                  {!w.off && w.startMin > rangeStart && (
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 bg-black/30"
                      style={{ height: (w.startMin - rangeStart) * PX_PER_MIN }}
                    />
                  )}
                  {!w.off && w.endMin < rangeEnd && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/30"
                      style={{ height: (rangeEnd - w.endMin) * PX_PER_MIN }}
                    />
                  )}
                  {w.off && (
                    <p className="absolute inset-x-0 top-8 text-center font-label text-[0.68rem] uppercase tracking-widest text-cream-dim/50">
                      Off
                    </p>
                  )}

                  {/* Time-off blocks */}
                  {offBlocks.map((t) => {
                    const top = (Math.max(t.startMin, rangeStart) - rangeStart) * PX_PER_MIN;
                    const h = (Math.min(t.endMin, rangeEnd) - Math.max(t.startMin, rangeStart)) * PX_PER_MIN;
                    return (
                      <div
                        key={t.id}
                        className="pointer-events-none absolute inset-x-1 rounded-md border border-dashed border-white/15 bg-white/[0.04] px-2 py-1"
                        style={{ top, height: h }}
                      >
                        <span className="text-[0.65rem] text-cream-dim/70">
                          {t.reason || "Time off"}
                        </span>
                      </div>
                    );
                  })}

                  {/* Appointments */}
                  {visible
                    .filter((a) => a.barberId === b.id)
                    .map((a) => {
                      // Day-relative + clamped, so overnight spillover renders
                      // at the day edge instead of at a fake time.
                      const startMin = Math.max(relMin(a.startTime), rangeStart);
                      const endMin = Math.min(relMin(a.endTime), rangeEnd);
                      const top = (startMin - rangeStart) * PX_PER_MIN;
                      const h = Math.max((endMin - startMin) * PX_PER_MIN, 26);
                      return (
                        <button
                          key={a.id}
                          data-appt
                          onClick={() => setSelectedId(a.id)}
                          className={`absolute inset-x-1 overflow-hidden rounded-md border px-2 py-1 text-left text-xs transition-colors hover:brightness-110 ${
                            BLOCK_STYLES[a.status] ?? "border-white/20 bg-white/10"
                          }`}
                          style={{ top, height: h }}
                        >
                          <span className="block truncate font-semibold">
                            {fmtTime(a.startTime)} · {a.customerName}
                          </span>
                          <span className="block truncate opacity-75">
                            {a.service.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {loading && <p className="mt-3 text-xs text-cream-dim">Refreshing…</p>}

      {walkIn && (
        <WalkInPanel
          date={date}
          barber={barbers.find((b) => b.id === walkIn.barberId)!}
          startMin={walkIn.startMin}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          services={services}
          onClose={() => setWalkIn(null)}
          onSaved={() => {
            setWalkIn(null);
            loadAppts();
          }}
        />
      )}
      {selected && (
        <ApptPanel
          appt={selected}
          barbers={barbers}
          onClose={() => setSelectedId(null)}
          onChanged={(keepOpen) => {
            if (!keepOpen) setSelectedId(null);
            loadAppts();
          }}
        />
      )}
    </div>
  );
}

/* ---- Walk-in side panel ---- */

function WalkInPanel({
  date,
  barber,
  startMin,
  rangeStart,
  rangeEnd,
  services,
  onClose,
  onSaved,
}: {
  date: string;
  barber: AdminBarber;
  startMin: number;
  rangeStart: number;
  rangeEnd: number;
  services: AdminService[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [time, setTime] = useState(minToHHMM(startMin));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const timeOptions = useMemo(() => {
    const out: number[] = [];
    for (let m = rangeStart; m < rangeEnd; m += SNAP_MIN) out.push(m);
    return out;
  }, [rangeStart, rangeEnd]);

  async function save() {
    if (!name.trim()) {
      setErr("Customer name is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        barberId: barber.id,
        date,
        value: time,
        customerName: name.trim(),
        customerPhone: phone.trim(),
      }),
    });
    setSaving(false);
    if (res.ok) {
      const [h, m] = time.split(":").map(Number);
      toast(`Walk-in added for ${name.trim()} at ${minToLabel(h * 60 + m)}`);
      onSaved();
    } else {
      setErr((await res.json().catch(() => null))?.error ?? "Failed to save.");
    }
  }

  return (
    <SidePanel
      title="New walk-in"
      subtitle={`${barber.name} · ${date}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={btn.ghost}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={btn.primary}>
            {saving ? "Saving…" : "Add walk-in"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select label="Time" value={time} onChange={setTime}>
          {timeOptions.map((m) => (
            <option key={m} value={minToHHMM(m)} className="bg-charcoal">
              {minToLabel(m)}
            </option>
          ))}
        </Select>
        <Select label="Service" value={serviceId} onChange={setServiceId}>
          {services.map((s) => (
            <option key={s.id} value={s.id} className="bg-charcoal">
              {s.name} — {fmtMoney(s.price)} · {s.durationMin}m
            </option>
          ))}
        </Select>
        <Field label="Customer name" value={name} onChange={setName} />
        <Field label="Phone (optional)" value={phone} onChange={setPhone} dir="ltr" />
        {err && <p className="text-sm text-neon-red">{err}</p>}
      </div>
    </SidePanel>
  );
}

/* ---- Appointment management side panel ---- */

function ApptPanel({
  appt,
  barbers,
  onClose,
  onChanged,
}: {
  appt: AdminAppointment;
  barbers: AdminBarber[];
  onClose: () => void;
  onChanged: (keepOpen?: boolean) => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [moveTime, setMoveTime] = useState(minToHHMM(minuteOf(appt.startTime)));
  const [moveBarber, setMoveBarber] = useState(appt.barberId);

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(appt.startTime));

  async function patch(
    body: Record<string, unknown>,
    opts?: { message?: string; undoBody?: Record<string, unknown>; keepOpen?: boolean }
  ) {
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/admin/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      if (opts?.message) {
        toast(opts.message, {
          undo: opts.undoBody
            ? async () => {
                await fetch(`/api/admin/appointments/${appt.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(opts.undoBody),
                });
                onChanged(true);
              }
            : undefined,
        });
      }
      onChanged(opts?.keepOpen);
    } else {
      setErr((await res.json().catch(() => null))?.error ?? "Update failed.");
    }
  }

  async function del() {
    setBusy(true);
    await fetch(`/api/admin/appointments/${appt.id}`, { method: "DELETE" });
    setBusy(false);
    toast(`Deleted ${appt.customerName}'s appointment.`);
    onChanged();
  }

  const statusActions: {
    label: string;
    status: string;
    cls: string;
    show: boolean;
  }[] = [
    {
      label: "Check-in & complete",
      status: "COMPLETED",
      cls: btn.primary,
      show: appt.status !== "COMPLETED",
    },
    {
      label: "No-show",
      status: "NO_SHOW",
      cls: btn.danger,
      show: appt.status === "CONFIRMED" || appt.status === "PENDING",
    },
    {
      label: "Re-confirm",
      status: "CONFIRMED",
      cls: btn.ghost,
      show: appt.status === "COMPLETED" || appt.status === "NO_SHOW",
    },
  ];

  return (
    <SidePanel
      title={appt.customerName}
      subtitle={`${appt.service.name} · ${fmtTime(appt.startTime)} · ${appt.barber.name}`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between">
          <DangerButton label="Delete" confirmLabel="Delete?" onConfirm={del} />
          <button onClick={onClose} className={btn.ghost}>
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Facts */}
        <div className="space-y-1.5 text-sm text-cream-dim">
          <p>
            <span
              className={`rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase ${STATUS_STYLES[appt.status] ?? ""}`}
            >
              {appt.status}
            </span>
            <span className="ml-2 text-[0.68rem] uppercase tracking-wider text-cream-dim/60">
              {appt.source === "WALK_IN" ? "Walk-in" : "Online"}
            </span>
          </p>
          <p>
            {appt.service.name} · {fmtMoney(appt.service.price)} ·{" "}
            {appt.service.durationMin}m
          </p>
          {appt.customerPhone && (
            <p className="flex items-center gap-1.5">
              <Phone size={13} />
              <a href={`tel:${appt.customerPhone}`} dir="ltr" className="hover:text-neon-yellow">
                {appt.customerPhone}
              </a>
            </p>
          )}
          {appt.revenue > 0 && <p>Revenue: {fmtMoney(appt.revenue)}</p>}
        </div>

        {/* Status actions */}
        <div className="flex flex-wrap gap-2">
          {statusActions
            .filter((a) => a.show)
            .map((a) => (
              <button
                key={a.status}
                disabled={busy}
                onClick={() =>
                  patch(
                    { status: a.status },
                    {
                      message: `${appt.customerName} → ${a.label}`,
                      undoBody: { status: appt.status },
                      keepOpen: true,
                    }
                  )
                }
                className={a.cls}
              >
                {a.label}
              </button>
            ))}
          {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
            <button
              disabled={busy}
              onClick={() =>
                patch(
                  { status: "CANCELLED" },
                  {
                    message: `Cancelled ${appt.customerName}'s booking.`,
                    undoBody: { status: appt.status },
                  }
                )
              }
              className={btn.danger}
            >
              Cancel booking
            </button>
          )}
        </div>

        {/* Move */}
        <div className="rounded-lg border border-white/10 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
            Move appointment
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
                Time
              </span>
              <input
                type="time"
                step={SNAP_MIN * 60}
                value={moveTime}
                onChange={(e) => setMoveTime(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream outline-none focus:border-neon-yellow"
              />
            </label>
            <Select label="Barber" value={moveBarber} onChange={setMoveBarber}>
              {barbers.map((b) => (
                <option key={b.id} value={b.id} className="bg-charcoal">
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              patch(
                { date, value: moveTime, barberId: moveBarber },
                { message: `Moved ${appt.customerName} to ${moveTime}.`, keepOpen: true }
              )
            }
            className={`mt-3 ${btn.outline}`}
          >
            Move
          </button>
        </div>

        {err && <p className="text-sm text-neon-red">{err}</p>}
      </div>
    </SidePanel>
  );
}
