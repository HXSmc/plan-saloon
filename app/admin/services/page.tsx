"use client";

// Services management — side-panel editor (no center modal), icon picker,
// category grouping, undo-friendly deletes.

import { useEffect, useState } from "react";
import type { AdminService } from "@/components/admin/types";
import SidePanel from "@/components/admin/SidePanel";
import { useToast } from "@/components/admin/Toast";
import { btn, Field, DangerButton } from "@/components/admin/ui";
import { fmtMoney } from "@/components/admin/util";
import { ServiceIcon, SERVICE_ICON_KEYS, Plus, Clock } from "@/components/icons";

type Draft = Partial<AdminService>;

const empty: Draft = {
  name: "",
  name_ar: "",
  description: "",
  description_ar: "",
  category: "Hair",
  category_ar: "الشعر",
  price: 30,
  icon: "scissors",
  durationMin: 45,
  popular: false,
};

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/services");
    setServices(await r.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setErr(null);
    const isEdit = !!editing.id;
    const res = await fetch(
      isEdit ? `/api/admin/services/${editing.id}` : "/api/admin/services",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          name_ar: editing.name_ar,
          description: editing.description ?? "",
          description_ar: editing.description_ar ?? "",
          category: editing.category || "Hair",
          category_ar: editing.category_ar || "الشعر",
          price: Number(editing.price),
          icon: editing.icon || "scissors",
          durationMin: Number(editing.durationMin) || 45,
          popular: !!editing.popular,
        }),
      }
    );
    setSaving(false);
    if (res.ok) {
      toast(isEdit ? "Service saved." : "Service added.");
      setEditing(null);
      load();
    } else {
      setErr((await res.json().catch(() => null))?.error ?? "Save failed.");
    }
  }

  async function toggleActive(s: AdminService) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    toast(`"${s.name}" is now ${s.active ? "hidden from" : "visible in"} the booking flow.`, {
      undo: async () => {
        await fetch(`/api/admin/services/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: s.active }),
        });
        load();
      },
    });
    load();
  }

  async function remove(s: AdminService) {
    const res = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    toast(
      data?.softDeleted
        ? `"${s.name}" has bookings — deactivated instead of deleted.`
        : `"${s.name}" deleted.`
    );
    load();
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Services</h1>
          <p className="mt-1 text-sm text-cream-dim">Manage the menu &amp; pricing.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className={`${btn.primary} inline-flex items-center gap-2`}
        >
          <Plus size={14} /> Add Service
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-charcoal">
        {loading ? (
          <p className="px-5 py-8 text-sm text-cream-dim">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-[0.65rem] uppercase tracking-widest text-cream-dim">
              <tr>
                <th className="px-5 py-3">Service</th>
                <th className="hidden px-5 py-3 sm:table-cell">Category</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {services.map((s) => (
                <tr key={s.id} className={s.active ? "" : "opacity-50"}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <span className="text-neon-yellow">
                        <ServiceIcon icon={s.icon} size={18} />
                      </span>
                      <span className="font-medium text-cream">{s.name}</span>
                      {s.popular && (
                        <span className="rounded-full bg-neon-yellow/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-neon-yellow">
                          Popular
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-cream-dim sm:table-cell">{s.category}</td>
                  <td className="px-5 py-3 text-cream-dim">{s.durationMin}m</td>
                  <td className="px-5 py-3 text-neon-yellow">{fmtMoney(s.price)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        s.active
                          ? "bg-neon-yellow/15 text-neon-yellow"
                          : "bg-white/5 text-cream-dim"
                      }`}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing({ ...s })}
                        className="text-xs text-cream-dim hover:text-neon-yellow"
                      >
                        Edit
                      </button>
                      <DangerButton
                        label="Delete"
                        confirmLabel="Delete?"
                        onConfirm={() => remove(s)}
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

      {editing && (
        <SidePanel
          title={editing.id ? "Edit service" : "New service"}
          subtitle={editing.id ? editing.name : undefined}
          onClose={() => setEditing(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className={btn.ghost}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} className={btn.primary}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name (EN)" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Name (AR)" value={editing.name_ar ?? ""} onChange={(v) => setEditing({ ...editing, name_ar: v })} dir="rtl" />
              <Field label="Description (EN)" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
              <Field label="Description (AR)" value={editing.description_ar ?? ""} onChange={(v) => setEditing({ ...editing, description_ar: v })} dir="rtl" />
              <Field label="Category (EN)" value={editing.category ?? ""} onChange={(v) => setEditing({ ...editing, category: v })} />
              <Field label="Category (AR)" value={editing.category_ar ?? ""} onChange={(v) => setEditing({ ...editing, category_ar: v })} dir="rtl" />
              <Field label="Price (SAR)" type="number" value={String(editing.price ?? 0)} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
              <Field label="Duration (min)" type="number" value={String(editing.durationMin ?? 45)} onChange={(v) => setEditing({ ...editing, durationMin: Number(v) })} />
            </div>

            {/* Icon picker */}
            <div>
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
                Icon
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVICE_ICON_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setEditing({ ...editing, icon: key })}
                    aria-label={key}
                    className={`flex h-11 w-11 items-center justify-center rounded-md border transition-colors ${
                      editing.icon === key
                        ? "border-neon-yellow bg-neon-yellow/10 text-neon-yellow"
                        : "border-white/10 text-cream-dim hover:border-neon-yellow/50 hover:text-neon-yellow"
                    }`}
                  >
                    <ServiceIcon icon={key} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-cream-dim">
              <input
                type="checkbox"
                checked={!!editing.popular}
                onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
              />
              Mark as popular
            </label>

            {typeof editing.durationMin === "number" && editing.durationMin > 45 && (
              <p className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-cream-dim">
                <Clock size={13} className="shrink-0 text-neon-yellow" />
                Longer than one 45-min slot — availability automatically blocks
                the full {editing.durationMin} minutes.
              </p>
            )}

            {err && <p className="text-sm text-neon-red">{err}</p>}
          </div>
        </SidePanel>
      )}
    </div>
  );
}
