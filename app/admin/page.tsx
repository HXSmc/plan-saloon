"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fmtMoney,
  fmtTime,
  STATUS_STYLES,
  todayStr,
} from "@/components/admin/util";
import type { AdminAppointment } from "@/components/admin/types";
import { btn } from "@/components/admin/ui";
import { Calendar, Check, Clock, Chart } from "@/components/icons";

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

  const active = appts.filter((a) => a.status !== "CANCELLED");
  const completed = active.filter((a) => a.status === "COMPLETED").length;
  const upcoming = active.filter((a) =>
    ["CONFIRMED", "PENDING"].includes(a.status)
  ).length;

  const stats = [
    { label: "Today's Appointments", value: active.length, Icon: Calendar },
    { label: "Upcoming Today", value: upcoming, Icon: Clock },
    { label: "Completed Today", value: completed, Icon: Check },
    {
      label: "Revenue Today",
      value: revenue === null ? "—" : fmtMoney(revenue),
      Icon: Chart,
    },
  ];

  // The next appointment still ahead of us, for the hero strip.
  const next = active
    .filter(
      (a) =>
        ["CONFIRMED", "PENDING"].includes(a.status) &&
        new Date(a.startTime).getTime() > Date.now()
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )[0];

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-cream-dim">
            {next
              ? `Next up: ${next.customerName} · ${next.service.name} at ${fmtTime(next.startTime)} with ${next.barber.name}`
              : "Today at a glance."}
          </p>
        </div>
        <Link href="/admin/calendar" className={btn.primary}>
          Open Calendar
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-charcoal p-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-3xl font-extrabold text-neon-yellow">
                {value}
              </div>
              <span className="text-cream-dim/40">
                <Icon size={20} />
              </span>
            </div>
            <div className="mt-1 text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
              {label}
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
        ) : active.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cream-dim">
            No appointments today.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {active.map((a) => (
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
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
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
