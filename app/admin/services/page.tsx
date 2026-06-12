"use client";

import { useEffect, useState } from "react";
import { fmtMoney } from "@/components/admin/util";
import type { AdminService } from "@/components/admin/types";

type Draft = Partial<AdminService>;

const empty: Draft = {
  name: "",
  name_ar: "",
  description: "",
  description_ar: "",
  price: 30,
  icon: "✂️",
  durationMin: 45,
  popular: false,
};

export default function ServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

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
    const isEdit = !!editing.id;
    const url = isEdit
      ? `/api/admin/services/${editing.id}`
      : "/api/admin/services";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        name_ar: editing.name_ar,
        description: editing.description ?? "",
        description_ar: editing.description_ar ?? "",
        price: Number(editing.price),
        icon: editing.icon || "✂️",
        durationMin: Number(editing.durationMin) || 45,
        popular: !!editing.popular,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      alert("Save failed.");
    }
  }

  async function toggleActive(s: AdminService) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    load();
  }

  async function remove(s: AdminService) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
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
          className="rounded-md bg-neon-yellow px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-charcoal-deep shadow-glow-yellow hover:bg-neon-glow"
        >
          + Add Service
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-charcoal">
        {loading ? (
          <p className="px-5 py-8 text-sm text-cream-dim">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-[0.62rem] uppercase tracking-widest text-cream-dim">
              <tr>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3">
                    <span className="mr-2">{s.icon}</span>
                    {s.name}
                    {s.popular && (
                      <span className="ml-2 rounded-full bg-neon-yellow/15 px-2 py-0.5 text-[0.55rem] uppercase tracking-wider text-neon-yellow">
                        Popular
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream-dim">{s.durationMin}m</td>
                  <td className="px-5 py-3 text-neon-yellow">{fmtMoney(s.price)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider ${
                        s.active
                          ? "bg-neon-yellow/15 text-neon-yellow"
                          : "bg-white/5 text-cream-dim"
                      }`}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setEditing({ ...s })}
                      className="mr-3 text-xs text-cream-dim hover:text-neon-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(s)}
                      className="text-xs text-cream-dim hover:text-neon-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-charcoal p-6">
            <h2 className="font-display text-xl font-bold">
              {editing.id ? "Edit Service" : "New Service"}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Name (EN)" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Name (AR)" value={editing.name_ar ?? ""} onChange={(v) => setEditing({ ...editing, name_ar: v })} />
              <Field label="Description (EN)" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
              <Field label="Description (AR)" value={editing.description_ar ?? ""} onChange={(v) => setEditing({ ...editing, description_ar: v })} />
              <Field label="Price (SAR)" type="number" value={String(editing.price ?? 0)} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
              <Field label="Duration (min)" type="number" value={String(editing.durationMin ?? 45)} onChange={(v) => setEditing({ ...editing, durationMin: Number(v) })} />
              <Field label="Icon (emoji)" value={editing.icon ?? ""} onChange={(v) => setEditing({ ...editing, icon: v })} />
              <label className="flex items-end gap-2 pb-2 text-sm text-cream-dim">
                <input
                  type="checkbox"
                  checked={!!editing.popular}
                  onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
                />
                Popular
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-cream-dim hover:text-cream"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-md bg-neon-yellow px-5 py-2 text-xs font-semibold uppercase tracking-widest text-charcoal-deep hover:bg-neon-glow disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-cream-dim">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream outline-none focus:border-neon-yellow"
      />
    </label>
  );
}
