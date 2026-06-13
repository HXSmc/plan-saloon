"use client";

// Staff list — each barber opens a full detail page (/admin/staff/[id]);
// no modals. Deactivation is a single toggle with toast feedback.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminBarber } from "@/components/admin/types";
import { useToast } from "@/components/admin/Toast";
import { btn, DangerButton } from "@/components/admin/ui";
import { minToHHMM, todayStr, weekdayOfDate } from "@/components/admin/util";
import { Plus } from "@/components/icons";

export default function StaffPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch("/api/admin/barbers");
    setBarbers(await r.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleActive(b: AdminBarber) {
    await fetch(`/api/admin/barbers/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    toast(`${b.name} is now ${b.active ? "inactive" : "active"}.`, {
      undo: async () => {
        await fetch(`/api/admin/barbers/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: b.active }),
        });
        load();
      },
    });
    load();
  }

  async function remove(b: AdminBarber) {
    const res = await fetch(`/api/admin/barbers/${b.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    toast(
      data?.softDeleted
        ? `${b.name} has bookings — deactivated instead of deleted.`
        : `${b.name} deleted.`
    );
    load();
  }

  function todayHours(b: AdminBarber): string {
    const weekday = weekdayOfDate(todayStr()); // shop-local weekday
    const wh = b.workingHours.find((h) => h.weekday === weekday);
    if (!wh || wh.isOff) return "Off today";
    return `${minToHHMM(wh.startMin)} – ${minToHHMM(wh.endMin)}`;
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Staff</h1>
          <p className="mt-1 text-sm text-cream-dim">
            Barbers, schedules &amp; time-off.
          </p>
        </div>
        <Link href="/admin/staff/new" className={`${btn.primary} inline-flex items-center gap-2`}>
          <Plus size={14} /> Add Barber
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-charcoal">
        {loading ? (
          <p className="px-5 py-8 text-sm text-cream-dim">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-[0.65rem] uppercase tracking-widest text-cream-dim">
              <tr>
                <th className="px-5 py-3">Barber</th>
                <th className="hidden px-5 py-3 sm:table-cell">Today</th>
                <th className="hidden px-5 py-3 md:table-cell">Time off</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {barbers.map((b) => (
                <tr
                  key={b.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                  onClick={() => router.push(`/admin/staff/${b.id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? (
                        <img src={b.imageUrl} alt="" className="h-9 w-9 rounded-full border border-neon-yellow/40 object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neon-yellow/40 text-xs font-bold text-neon-yellow">
                          {b.initials}
                        </span>
                      )}
                      <div>
                        <div className="font-medium text-cream">{b.name}</div>
                        <div className="text-[0.7rem] text-cream-dim">
                          {b.loginEmail ?? "no login"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-cream-dim sm:table-cell" dir="ltr">
                    {todayHours(b)}
                  </td>
                  <td className="hidden px-5 py-3 text-cream-dim md:table-cell">
                    {b.timeOff.length === 0 ? "—" : `${b.timeOff.length} scheduled`}
                  </td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleActive(b)}
                      className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        b.active
                          ? "bg-neon-yellow/15 text-neon-yellow"
                          : "bg-white/5 text-cream-dim"
                      }`}
                    >
                      {b.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/staff/${b.id}`}
                        className="text-xs text-cream-dim hover:text-neon-yellow"
                      >
                        Manage
                      </Link>
                      <DangerButton
                        label="Delete"
                        confirmLabel="Delete?"
                        onConfirm={() => remove(b)}
                        className="!border-0 !px-2 !py-1 !text-xs !font-normal !normal-case !tracking-normal"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
