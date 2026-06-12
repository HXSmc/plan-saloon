"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  daySlots,
  fmtMoney,
  slotValueOf,
  STATUS_STYLES,
  todayStr,
} from "@/components/admin/util";
import type {
  AdminAppointment,
  AdminBarber,
  AdminService,
} from "@/components/admin/types";

export default function CalendarPage() {
  const [date, setDate] = useState(todayStr());
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [appts, setAppts] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [walkIn, setWalkIn] = useState<{ barberId: string; value: string } | null>(null);
  const [selected, setSelected] = useState<AdminAppointment | null>(null);

  const slots = useMemo(() => daySlots(), []);

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

  // Index appointments by `${barberId}|${slotValue}`.
  const byCell = useMemo(() => {
    const map = new Map<string, AdminAppointment>();
    for (const a of appts) {
      if (a.status === "CANCELLED") continue;
      map.set(`${a.barberId}|${slotValueOf(a.startTime)}`, a);
    }
    return map;
  }, [appts]);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Calendar</h1>
          <p className="mt-1 text-sm text-cream-dim">
            Click an empty slot to add a walk-in; click a booking to manage it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(addDays(date, -1))} className="rounded-md border border-white/10 px-3 py-2 text-cream-dim hover:text-cream">←</button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream"
          />
          <button onClick={() => setDate(addDays(date, 1))} className="rounded-md border border-white/10 px-3 py-2 text-cream-dim hover:text-cream">→</button>
          <button onClick={() => setDate(todayStr())} className="rounded-md border border-white/10 px-3 py-2 text-xs uppercase tracking-widest text-cream-dim hover:text-neon-yellow">Today</button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-charcoal">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <th className="sticky left-0 bg-charcoal px-3 py-3 text-left text-[0.62rem] uppercase tracking-widest text-cream-dim">
                Time
              </th>
              {barbers.map((b) => (
                <th key={b.id} className="px-3 py-3 text-center text-xs font-semibold text-cream">
                  {b.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slots.map((slot) => (
              <tr key={slot.value}>
                <td className="sticky left-0 bg-charcoal px-3 py-2 font-mono text-xs text-cream-dim">
                  {slot.label}
                </td>
                {barbers.map((b) => {
                  const appt = byCell.get(`${b.id}|${slot.value}`);
                  return (
                    <td key={b.id} className="px-1.5 py-1">
                      {appt ? (
                        <button
                          onClick={() => setSelected(appt)}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                            STATUS_STYLES[appt.status] ?? "bg-white/10"
                          }`}
                        >
                          <span className="block truncate font-medium">
                            {appt.customerName}
                          </span>
                          <span className="block truncate opacity-80">
                            {appt.service.name}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setWalkIn({ barberId: b.id, value: slot.value })}
                          className="h-9 w-full rounded-md border border-dashed border-white/5 text-cream-dim/30 transition-colors hover:border-neon-yellow/40 hover:text-neon-yellow"
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p className="mt-3 text-xs text-cream-dim">Refreshing…</p>}

      {walkIn && (
        <WalkInModal
          date={date}
          barberId={walkIn.barberId}
          value={walkIn.value}
          services={services}
          onClose={() => setWalkIn(null)}
          onSaved={() => {
            setWalkIn(null);
            loadAppts();
          }}
        />
      )}
      {selected && (
        <ApptModal
          appt={selected}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            loadAppts();
          }}
        />
      )}
    </div>
  );
}

function WalkInModal({
  date,
  barberId,
  value,
  services,
  onClose,
  onSaved,
}: {
  date: string;
  barberId: string;
  value: string;
  services: AdminService[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        barberId,
        date,
        value,
        customerName: name,
        customerPhone: phone,
      }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setErr((await res.json()).error ?? "Failed.");
  }

  return (
    <Modal title={`Walk-in · ${value}`} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-cream-dim">Service</span>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id} className="bg-charcoal">
                {s.name} — {fmtMoney(s.price)}
              </option>
            ))}
          </select>
        </label>
        <TextIn label="Customer Name" v={name} on={setName} />
        <TextIn label="Phone" v={phone} on={setPhone} />
        {err && <p className="text-sm text-neon-red">{err}</p>}
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} />
    </Modal>
  );
}

function ApptModal({
  appt,
  onClose,
  onChanged,
}: {
  appt: AdminAppointment;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [reschedule, setReschedule] = useState<string>(slotValueOf(appt.startTime));
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch(`/api/admin/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) onChanged();
    else alert((await res.json()).error ?? "Failed.");
  }

  async function del() {
    if (!confirm("Delete this appointment?")) return;
    setBusy(true);
    await fetch(`/api/admin/appointments/${appt.id}`, { method: "DELETE" });
    onChanged();
  }

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(appt.startTime));

  return (
    <Modal title={appt.customerName} onClose={onClose}>
      <div className="space-y-1 text-sm text-cream-dim">
        <p>{appt.service.name} · {fmtMoney(appt.service.price)}</p>
        <p>{appt.barber.name} · {appt.customerPhone}</p>
        <p>
          Status:{" "}
          <span className={`rounded px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${STATUS_STYLES[appt.status] ?? ""}`}>
            {appt.status}
          </span>
        </p>
        {appt.revenue > 0 && <p>Revenue: {fmtMoney(appt.revenue)}</p>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Action label="✓ Check-In (Complete)" tone="yellow" disabled={busy} onClick={() => patch({ status: "COMPLETED" })} />
        <Action label="No-Show" tone="red" disabled={busy} onClick={() => patch({ status: "NO_SHOW" })} />
        <Action label="Confirm" tone="plain" disabled={busy} onClick={() => patch({ status: "CONFIRMED" })} />
        <Action label="Cancel Booking" tone="red" disabled={busy} onClick={() => patch({ status: "CANCELLED" })} />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 p-3">
        <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-cream-dim">
          Reschedule time
        </span>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="time"
            value={reschedule}
            onChange={(e) => setReschedule(e.target.value)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream"
          />
          <button
            disabled={busy}
            onClick={() => patch({ date, value: reschedule })}
            className="rounded-md border border-neon-yellow/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-neon-yellow hover:bg-neon-yellow/10 disabled:opacity-50"
          >
            Move
          </button>
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <button onClick={del} className="text-xs text-cream-dim hover:text-neon-red">
          Delete
        </button>
        <button onClick={onClose} className="rounded-md border border-white/10 px-5 py-2 text-xs uppercase tracking-widest text-cream-dim hover:text-cream">
          Close
        </button>
      </div>
    </Modal>
  );
}

/* ---- small shared pieces ---- */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-charcoal p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-md border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-cream-dim hover:text-cream">
        Cancel
      </button>
      <button onClick={onSave} disabled={saving} className="rounded-md bg-neon-yellow px-5 py-2 text-xs font-semibold uppercase tracking-widest text-charcoal-deep hover:bg-neon-glow disabled:opacity-50">
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function TextIn({ label, v, on }: { label: string; v: string; on: (s: string) => void }) {
  return (
    <label className="block">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-cream-dim">{label}</span>
      <input
        value={v}
        onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream outline-none focus:border-neon-yellow"
      />
    </label>
  );
}

function Action({
  label,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  tone: "yellow" | "red" | "plain";
  onClick: () => void;
  disabled?: boolean;
}) {
  const tones = {
    yellow: "border-neon-yellow/50 text-neon-yellow hover:bg-neon-yellow/10",
    red: "border-neon-red/50 text-neon-red hover:bg-neon-red/10",
    plain: "border-white/10 text-cream-dim hover:text-cream",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border px-3 py-2 text-xs font-semibold ${tones[tone]} disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
