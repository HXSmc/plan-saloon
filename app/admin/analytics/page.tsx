"use client";

import { useEffect, useState } from "react";
import { fmtMoney } from "@/components/admin/util";

type Analytics = {
  range: string;
  totalRevenue: number;
  totalCompleted: number;
  byBarber: { barberId: string; name: string; revenue: number; count: number }[];
  topServices: { serviceId: string; name: string; revenue: number; count: number }[];
};

const RANGES = [
  { key: "day", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("week");
  const [data, setData] = useState<Analytics | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/analytics?range=${range}`).then(async (r) => {
      if (r.status === 403) {
        setDenied(true);
        return;
      }
      setData(await r.json());
    });
  }, [range]);

  if (denied) {
    return (
      <p className="text-sm text-cream-dim">
        Analytics are available to the shop owner only.
      </p>
    );
  }

  const maxBarber = Math.max(1, ...(data?.byBarber.map((b) => b.revenue) ?? [1]));
  const maxService = Math.max(1, ...(data?.topServices.map((s) => s.count) ?? [1]));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Analytics</h1>
          <p className="mt-1 text-sm text-cream-dim">
            Revenue from completed appointments.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                range === r.key
                  ? "bg-neon-yellow text-charcoal-deep"
                  : "text-cream-dim hover:text-cream"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total Revenue" value={data ? fmtMoney(data.totalRevenue) : "—"} big />
        <Stat label="Completed" value={data ? String(data.totalCompleted) : "—"} />
        <Stat
          label="Avg Ticket"
          value={
            data && data.totalCompleted > 0
              ? fmtMoney(Math.round(data.totalRevenue / data.totalCompleted))
              : "—"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue by Barber">
          {data?.byBarber.length ? (
            data.byBarber.map((b) => (
              <Bar
                key={b.barberId}
                label={b.name}
                sub={`${b.count} cuts`}
                value={fmtMoney(b.revenue)}
                pct={(b.revenue / maxBarber) * 100}
              />
            ))
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel title="Most Booked Services">
          {data?.topServices.length ? (
            data.topServices.map((s) => (
              <Bar
                key={s.serviceId}
                label={s.name}
                sub={fmtMoney(s.revenue)}
                value={`${s.count}×`}
                pct={(s.count / maxService) * 100}
              />
            ))
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-charcoal p-5">
      <div className={`font-display font-extrabold text-neon-yellow ${big ? "text-3xl" : "text-2xl"}`}>
        {value}
      </div>
      <div className="mt-1 text-[0.62rem] font-semibold uppercase tracking-widest text-cream-dim">
        {label}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-charcoal p-5">
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Bar({
  label,
  sub,
  value,
  pct,
}: {
  label: string;
  sub: string;
  value: string;
  pct: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-cream">
          {label} <span className="text-xs text-cream-dim">· {sub}</span>
        </span>
        <span className="font-semibold text-neon-yellow">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-neon-yellow shadow-glow-yellow"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-cream-dim/60">No completed appointments yet.</p>;
}
