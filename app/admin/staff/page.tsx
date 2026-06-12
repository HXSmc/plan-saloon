"use client";

import { useEffect, useState } from "react";
import type { AdminBarber } from "@/components/admin/types";
import { fmtDate } from "@/components/admin/util";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const minToTime = (m: number) =>
  m >= 1440 ? "00:00" : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const timeToStart = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const timeToEnd = (s: string) => {
  const v = timeToStart(s);
  return v === 0 ? 1440 : v;
};

type ProfileDraft = Partial<AdminBarber> & { password?: string };

const emptyProfile: ProfileDraft = {
  name: "",
  name_ar: "",
  title: "Barber",
  title_ar: "حلّاق",
  initials: "",
  phone: "",
  bio: "",
  bio_ar: "",
  specialties: [],
  specialties_ar: [],
};

export default function StaffPage() {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDraft | null>(null);
  const [schedule, setSchedule] = useState<AdminBarber | null>(null);

  async function load() {
    const r = await fetch("/api/admin/barbers");
    setBarbers(await r.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function saveProfile() {
    if (!profile) return;
    const isEdit = !!profile.id;
    // Credential field name differs: POST expects `password`, PATCH `newPassword`.
    const creds = isEdit
      ? {
          email: profile.loginEmail || "",
          newPassword: profile.password || "",
        }
      : {
          email: profile.loginEmail || "",
          password: profile.password || "",
        };

    const res = await fetch(
      isEdit ? `/api/admin/barbers/${profile.id}` : "/api/admin/barbers",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          name_ar: profile.name_ar,
          title: profile.title,
          title_ar: profile.title_ar,
          initials: profile.initials,
          phone: profile.phone || "",
          bio: profile.bio ?? "",
          bio_ar: profile.bio_ar ?? "",
          specialties:
            typeof profile.specialties === "string"
              ? (profile.specialties as string).split(",").map((s) => s.trim())
              : profile.specialties,
          specialties_ar:
            typeof profile.specialties_ar === "string"
              ? (profile.specialties_ar as string).split(",").map((s) => s.trim())
              : profile.specialties_ar,
          ...creds,
        }),
      }
    );
    if (res.ok) {
      setProfile(null);
      load();
    } else {
      const msg = await res.json().catch(() => null);
      alert(msg?.error ?? "Save failed.");
    }
  }

  async function toggleActive(b: AdminBarber) {
    await fetch(`/api/admin/barbers/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    load();
  }

  async function remove(b: AdminBarber) {
    if (!confirm(`Delete ${b.name}? (deactivates if they have bookings)`)) return;
    await fetch(`/api/admin/barbers/${b.id}`, { method: "DELETE" });
    load();
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
        <button
          onClick={() => setProfile({ ...emptyProfile })}
          className="rounded-md bg-neon-yellow px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-charcoal-deep shadow-glow-yellow hover:bg-neon-glow"
        >
          + Add Barber
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-charcoal">
        {loading ? (
          <p className="px-5 py-8 text-sm text-cream-dim">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-[0.62rem] uppercase tracking-widest text-cream-dim">
              <tr>
                <th className="px-5 py-3">Barber</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {barbers.map((b) => (
                <tr key={b.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neon-yellow/40 text-xs font-bold text-neon-yellow">
                        {b.initials}
                      </span>
                      <div>
                        <div>{b.name}</div>
                        <div className="text-[0.65rem] text-cream-dim">
                          {b.loginEmail ?? "no login"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-cream-dim">{b.title}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(b)}
                      className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider ${
                        b.active
                          ? "bg-neon-yellow/15 text-neon-yellow"
                          : "bg-white/5 text-cream-dim"
                      }`}
                    >
                      {b.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSchedule(b)}
                      className="mr-3 text-xs text-cream-dim hover:text-neon-yellow"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => setProfile({ ...b })}
                      className="mr-3 text-xs text-cream-dim hover:text-neon-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(b)}
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

      {profile && (
        <ProfileModal
          draft={profile}
          setDraft={setProfile}
          onSave={saveProfile}
          onClose={() => setProfile(null)}
        />
      )}
      {schedule && (
        <ScheduleModal
          barber={schedule}
          onClose={() => {
            setSchedule(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProfileModal({
  draft,
  setDraft,
  onSave,
  onClose,
}: {
  draft: ProfileDraft;
  setDraft: (d: ProfileDraft) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const sp = Array.isArray(draft.specialties)
    ? draft.specialties.join(", ")
    : (draft.specialties as unknown as string) ?? "";
  const spAr = Array.isArray(draft.specialties_ar)
    ? draft.specialties_ar.join(", ")
    : (draft.specialties_ar as unknown as string) ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-charcoal p-6">
        <h2 className="font-display text-xl font-bold">
          {draft.id ? "Edit Barber" : "New Barber"}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <In label="Name (EN)" v={draft.name ?? ""} on={(v) => setDraft({ ...draft, name: v })} />
          <In label="Name (AR)" v={draft.name_ar ?? ""} on={(v) => setDraft({ ...draft, name_ar: v })} />
          <In label="Title (EN)" v={draft.title ?? ""} on={(v) => setDraft({ ...draft, title: v })} />
          <In label="Title (AR)" v={draft.title_ar ?? ""} on={(v) => setDraft({ ...draft, title_ar: v })} />
          <In label="Initials" v={draft.initials ?? ""} on={(v) => setDraft({ ...draft, initials: v })} />
          <In label="Phone" v={draft.phone ?? ""} on={(v) => setDraft({ ...draft, phone: v })} />
          <In label="Specialties (EN, comma-sep)" v={sp} on={(v) => setDraft({ ...draft, specialties: v as unknown as string[] })} />
          <In label="Specialties (AR, comma-sep)" v={spAr} on={(v) => setDraft({ ...draft, specialties_ar: v as unknown as string[] })} />
        </div>

        {/* Login credentials */}
        <div className="mt-5 rounded-lg border border-white/10 p-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-neon-yellow">
            Login Credentials
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <In
              label="Login Email"
              v={draft.loginEmail ?? ""}
              on={(v) => setDraft({ ...draft, loginEmail: v })}
            />
            <label className="block">
              <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-cream-dim">
                {draft.id ? "New Password (blank = keep)" : "Password"}
              </span>
              <input
                type="password"
                value={draft.password ?? ""}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                placeholder="min 6 chars"
                className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream outline-none focus:border-neon-yellow"
              />
            </label>
          </div>
          <p className="mt-2 text-[0.62rem] text-cream-dim/70">
            {draft.id
              ? "Change the email or set a new password to update this barber's login."
              : "Set an email + password so this barber can sign in to the dashboard."}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-cream-dim hover:text-cream">
            Cancel
          </button>
          <button onClick={onSave} className="rounded-md bg-neon-yellow px-5 py-2 text-xs font-semibold uppercase tracking-widest text-charcoal-deep hover:bg-neon-glow">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({
  barber,
  onClose,
}: {
  barber: AdminBarber;
  onClose: () => void;
}) {
  // Seed a full 7-day grid from existing hours (default 12:00–00:00).
  const [rows, setRows] = useState(() =>
    WEEKDAYS.map((_, weekday) => {
      const wh = barber.workingHours.find((h) => h.weekday === weekday);
      return wh ?? { weekday, startMin: 720, endMin: 1440, isOff: false, id: "" };
    })
  );
  const [timeOff, setTimeOff] = useState(barber.timeOff);
  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveHours() {
    setSaving(true);
    await fetch(`/api/admin/barbers/${barber.id}/hours`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hours: rows.map((r) => ({
          weekday: r.weekday,
          startMin: r.startMin,
          endMin: r.endMin,
          isOff: r.isOff,
        })),
      }),
    });
    setSaving(false);
  }

  async function addTimeOff() {
    if (!offStart || !offEnd) return;
    const res = await fetch(`/api/admin/barbers/${barber.id}/timeoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: new Date(offStart + "+03:00").toISOString(),
        end: new Date(offEnd + "+03:00").toISOString(),
      }),
    });
    if (res.ok) {
      setTimeOff([...timeOff, await res.json()]);
      setOffStart("");
      setOffEnd("");
    }
  }

  async function removeTimeOff(id: string) {
    await fetch(`/api/admin/barbers/${barber.id}/timeoff?timeOffId=${id}`, {
      method: "DELETE",
    });
    setTimeOff(timeOff.filter((t) => t.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-charcoal p-6">
        <h2 className="font-display text-xl font-bold">
          {barber.name} — Schedule
        </h2>

        <h3 className="mt-5 text-[0.62rem] font-semibold uppercase tracking-widest text-cream-dim">
          Weekly Hours
        </h3>
        <div className="mt-2 space-y-1.5">
          {rows.map((r, i) => (
            <div key={r.weekday} className="flex items-center gap-3">
              <span className="w-10 text-sm text-cream-dim">
                {WEEKDAYS[r.weekday]}
              </span>
              <input
                type="time"
                value={minToTime(r.startMin)}
                disabled={r.isOff}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...r, startMin: timeToStart(e.target.value) };
                  setRows(next);
                }}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream disabled:opacity-40"
              />
              <span className="text-cream-dim">–</span>
              <input
                type="time"
                value={minToTime(r.endMin)}
                disabled={r.isOff}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...r, endMin: timeToEnd(e.target.value) };
                  setRows(next);
                }}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream disabled:opacity-40"
              />
              <label className="ml-auto flex items-center gap-2 text-xs text-cream-dim">
                <input
                  type="checkbox"
                  checked={r.isOff}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...r, isOff: e.target.checked };
                    setRows(next);
                  }}
                />
                Off
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={saveHours}
          disabled={saving}
          className="mt-3 rounded-md bg-neon-yellow px-4 py-2 text-xs font-semibold uppercase tracking-widest text-charcoal-deep hover:bg-neon-glow disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Hours"}
        </button>

        <h3 className="mt-6 text-[0.62rem] font-semibold uppercase tracking-widest text-cream-dim">
          Time Off
        </h3>
        <div className="mt-2 space-y-1.5">
          {timeOff.length === 0 && (
            <p className="text-sm text-cream-dim/60">None scheduled.</p>
          )}
          {timeOff.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm"
            >
              <span className="text-cream-dim">
                {fmtDate(t.start)} → {fmtDate(t.end)}
              </span>
              <button
                onClick={() => removeTimeOff(t.id)}
                className="text-xs text-cream-dim hover:text-neon-red"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-xs text-cream-dim">
            Start
            <input
              type="datetime-local"
              value={offStart}
              onChange={(e) => setOffStart(e.target.value)}
              className="mt-1 block rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream"
            />
          </label>
          <label className="text-xs text-cream-dim">
            End
            <input
              type="datetime-local"
              value={offEnd}
              onChange={(e) => setOffEnd(e.target.value)}
              className="mt-1 block rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream"
            />
          </label>
          <button
            onClick={addTimeOff}
            className="rounded-md border border-neon-yellow/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-neon-yellow hover:bg-neon-yellow/10"
          >
            Add
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 px-5 py-2 text-xs uppercase tracking-widest text-cream-dim hover:text-cream"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function In({ label, v, on }: { label: string; v: string; on: (s: string) => void }) {
  return (
    <label className="block">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-cream-dim">
        {label}
      </span>
      <input
        value={v}
        onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-cream outline-none focus:border-neon-yellow"
      />
    </label>
  );
}
