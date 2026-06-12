"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmtMoney, fmtTime, STATUS_STYLES, todayStr } from "@/components/admin/util";
import type { AdminAppointment } from "@/components/admin/types";

export default function DashboardPage() {
  const [appts, setAppts] = useState<AdminAppointment[]>([]);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayStr();
    Promise.all([
      fetch(`/api/admin/appointments?from=${today}&to=${today}`).then((r) =>
        r.json()
      ),
      fetch(`/api/admin/analytics?range=day`).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([a, an]) => {
        setAppts(Array.isArray(a) ? a : []);
        setRevenue(an?.totalRevenue ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = appts.filter((a) => a.status === "COMPLETED").length;
  const upcoming = appts.filter((a) =>
    ["CONFIRMED", "PENDING"].includes(a.status)
  ).length;

  const stats = [
    { label: "Today's Appointments", value: appts.length },
    { label: "Upcoming Today", value: upcoming },
    { label: "Completed Today", value: completed },
    {
      label: "Revenue Today",
      value: revenue === null ? "—" : fmtMoney(revenue),
    },
  ];

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-cream-dim">Today at a glance.</p>
        </div>
        <Link
          href="/admin/calendar"
          className="rounded-md bg-neon-yellow px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-charcoal-deep shadow-glow-yellow hover:bg-neon-glow"
        >
          Open Calendar
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/10 bg-charcoal p-5"
          >
            <div className="font-display text-3xl font-extrabold text-neon-yellow">
              {s.value}
            </div>
            <div className="mt-1 text-[0.62rem] font-semibold uppercase tracking-widest text-cream-dim">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-white/10 bg-charcoal">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Today&apos;s Schedule</h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-sm text-cream-dim">Loading…</p>
        ) : appts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cream-dim">
            No appointments today.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {appts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-neon-yellow">
                    {fmtTime(a.startTime)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{a.customerName}</p>
                    <p className="text-xs text-cream-dim">
                      {a.service.name} · {a.barber.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider ${
                    STATUS_STYLES[a.status] ?? ""
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
