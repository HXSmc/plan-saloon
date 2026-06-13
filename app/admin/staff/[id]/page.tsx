"use client";

// Barber detail page — profile, login, weekly hours, and time off in one
// place. Replaces the old profile + schedule modals. `/admin/staff/new`
// renders the same page in create mode.

import { useCallback, useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminBarber } from "@/components/admin/types";
import { useToast } from "@/components/admin/Toast";
import { btn, Field, inputCls, DangerButton } from "@/components/admin/ui";
import { fmtDate, minToHHMM } from "@/components/admin/util";
import { ChevronLeft } from "@/components/icons";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type HoursRow = { weekday: number; startMin: number; endMin: number; isOff: boolean };

const timeToStart = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const timeToEnd = (s: string) => {
  const v = timeToStart(s);
  return v === 0 ? 1440 : v; // "00:00" close = end of day
};

const DEFAULT_HOURS: HoursRow[] = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  startMin: 720,
  endMin: 1440,
  isOff: false,
}));

type Draft = {
  name: string;
  name_ar: string;
  title: string;
  title_ar: string;
  initials: string;
  phone: string;
  imageUrl: string;
  bio: string;
  bio_ar: string;
  specialties: string;
  specialties_ar: string;
  loginEmail: string;
  password: string;
};

const emptyDraft: Draft = {
  name: "",
  name_ar: "",
  title: "Barber",
  title_ar: "حلّاق",
  initials: "",
  phone: "",
  imageUrl: "",
  bio: "",
  bio_ar: "",
  specialties: "",
  specialties_ar: "",
  loginEmail: "",
  password: "",
};

export default function BarberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const { toast } = useToast();

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hours, setHours] = useState<HoursRow[]>(DEFAULT_HOURS);
  const [timeOff, setTimeOff] = useState<AdminBarber["timeOff"]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [offReason, setOffReason] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/barbers");
    const all = (await r.json()) as AdminBarber[];
    const b = all.find((x) => x.id === id);
    if (!b) {
      router.replace("/admin/staff");
      return;
    }
    setDraft({
      name: b.name,
      name_ar: b.name_ar,
      title: b.title,
      title_ar: b.title_ar,
      initials: b.initials,
      phone: b.phone ?? "",
      imageUrl: b.imageUrl ?? "",
      bio: b.bio,
      bio_ar: b.bio_ar,
      specialties: b.specialties.join(", "),
      specialties_ar: b.specialties_ar.join(", "),
      loginEmail: b.loginEmail ?? "",
      password: "",
    });
    setHours(
      DEFAULT_HOURS.map(
        (d) => b.workingHours.find((h) => h.weekday === d.weekday) ?? d
      )
    );
    setTimeOff(b.timeOff);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    if (!isNew) load();
  }, [isNew, load]);

  const profileBody = useMemo(
    () => ({
      name: draft.name,
      name_ar: draft.name_ar,
      title: draft.title,
      title_ar: draft.title_ar,
      initials: draft.initials,
      phone: draft.phone,
      imageUrl: draft.imageUrl || "",
      bio: draft.bio,
      bio_ar: draft.bio_ar,
      specialties: draft.specialties.split(",").map((s) => s.trim()).filter(Boolean),
      specialties_ar: draft.specialties_ar.split(",").map((s) => s.trim()).filter(Boolean),
      email: draft.loginEmail || "",
    }),
    [draft]
  );

  async function saveProfile() {
    setSaving(true);
    setErr(null);
    // Credential field name differs: POST expects `password`, PATCH `newPassword`.
    const creds = isNew
      ? { password: draft.password || "" }
      : { newPassword: draft.password || "" };
    const res = await fetch(
      isNew ? "/api/admin/barbers" : `/api/admin/barbers/${id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileBody, ...creds }),
      }
    );
    setSaving(false);
    if (res.ok) {
      if (isNew) {
        const created = await res.json();
        toast(`${draft.name} added to the team.`);
        router.replace(`/admin/staff/${created.id}`);
      } else {
        toast("Profile saved.");
        load();
      }
    } else {
      setErr((await res.json().catch(() => null))?.error ?? "Save failed.");
    }
  }

  async function saveHours() {
    setSavingHours(true);
    const res = await fetch(`/api/admin/barbers/${id}/hours`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    setSavingHours(false);
    if (res.ok) toast("Weekly hours saved.");
    else toast("Could not save hours.", { tone: "error" });
  }

  async function addTimeOff() {
    if (!offStart || !offEnd) return;
    const res = await fetch(`/api/admin/barbers/${id}/timeoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: new Date(offStart + "+03:00").toISOString(),
        end: new Date(offEnd + "+03:00").toISOString(),
        reason: offReason || undefined,
      }),
    });
    if (res.ok) {
      setTimeOff([...timeOff, await res.json()]);
      setOffStart("");
      setOffEnd("");
      setOffReason("");
      toast("Time off added.");
    } else {
      toast("Could not add time off.", { tone: "error" });
    }
  }

  async function removeTimeOff(tid: string) {
    await fetch(`/api/admin/barbers/${id}/timeoff?timeOffId=${tid}`, {
      method: "DELETE",
    });
    setTimeOff(timeOff.filter((t) => t.id !== tid));
    toast("Time off removed.");
  }

  if (loading) {
    return <p className="py-10 text-sm text-cream-dim">Loading…</p>;
  }

  return (
    <div>
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-cream-dim hover:text-neon-yellow"
      >
        <ChevronLeft size={13} /> Staff
      </Link>

      <header className="mt-3 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {draft.imageUrl ? (
            <img src={draft.imageUrl} alt="" className="h-14 w-14 rounded-full border-2 border-neon-yellow/40 object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neon-yellow/40 font-display text-xl font-extrabold text-neon-yellow">
              {draft.initials || "?"}
            </span>
          )}
          <div>
            <h1 className="font-display text-3xl font-extrabold">
              {isNew ? "New Barber" : draft.name}
            </h1>
            {!isNew && <p className="mt-0.5 text-sm text-cream-dim">{draft.title}</p>}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-xl border border-white/10 bg-charcoal p-6">
          <h2 className="font-display text-lg font-bold">Profile</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Name (EN)" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Name (AR)" value={draft.name_ar} onChange={(v) => setDraft({ ...draft, name_ar: v })} dir="rtl" />
            <Field label="Title (EN)" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            <Field label="Title (AR)" value={draft.title_ar} onChange={(v) => setDraft({ ...draft, title_ar: v })} dir="rtl" />
            <Field label="Initials" value={draft.initials} onChange={(v) => setDraft({ ...draft, initials: v })} />
            <Field label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} dir="ltr" />
          </div>
          <div className="mt-3">
            <Field
              label="Photo URL"
              value={draft.imageUrl}
              onChange={(v) => setDraft({ ...draft, imageUrl: v })}
              placeholder="https://…  (square photo works best)"
              dir="ltr"
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <label className="block">
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">Bio (EN)</span>
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={2}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">Bio (AR)</span>
              <textarea
                value={draft.bio_ar}
                onChange={(e) => setDraft({ ...draft, bio_ar: e.target.value })}
                rows={2}
                dir="rtl"
                className={inputCls}
              />
            </label>
            <Field label="Specialties (EN, comma-sep)" value={draft.specialties} onChange={(v) => setDraft({ ...draft, specialties: v })} />
            <Field label="Specialties (AR, comma-sep)" value={draft.specialties_ar} onChange={(v) => setDraft({ ...draft, specialties_ar: v })} dir="rtl" />
          </div>

          {/* Login */}
          <div className="mt-5 rounded-lg border border-white/10 p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-neon-yellow">
              Login Credentials
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Login Email" value={draft.loginEmail} onChange={(v) => setDraft({ ...draft, loginEmail: v })} dir="ltr" />
              <Field
                label={isNew ? "Password" : "New Password (blank = keep)"}
                type="password"
                value={draft.password}
                onChange={(v) => setDraft({ ...draft, password: v })}
                placeholder="min 6 chars"
              />
            </div>
          </div>

          {err && <p className="mt-3 text-sm text-neon-red">{err}</p>}
          <div className="mt-5 flex justify-end">
            <button onClick={saveProfile} disabled={saving} className={btn.primary}>
              {saving ? "Saving…" : isNew ? "Create barber" : "Save profile"}
            </button>
          </div>
        </section>

        <div className="space-y-6">
          {/* Weekly hours */}
          <section className={`rounded-xl border border-white/10 bg-charcoal p-6 ${isNew ? "opacity-40" : ""}`}>
            <h2 className="font-display text-lg font-bold">Weekly Hours</h2>
            {isNew ? (
              <p className="mt-2 text-sm text-cream-dim">
                Create the barber first — default hours (12:00–00:00) are applied automatically.
              </p>
            ) : (
              <>
                <div className="mt-4 space-y-1.5">
                  {hours.map((r, i) => (
                    <div key={r.weekday} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-cream-dim">
                        {WEEKDAYS[r.weekday].slice(0, 3)}
                      </span>
                      <input
                        type="time"
                        value={minToHHMM(r.startMin)}
                        disabled={r.isOff}
                        onChange={(e) => {
                          const next = [...hours];
                          next[i] = { ...r, startMin: timeToStart(e.target.value) };
                          setHours(next);
                        }}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream disabled:opacity-40"
                      />
                      <span className="text-cream-dim">–</span>
                      <input
                        type="time"
                        value={minToHHMM(r.endMin)}
                        disabled={r.isOff}
                        onChange={(e) => {
                          const next = [...hours];
                          next[i] = { ...r, endMin: timeToEnd(e.target.value) };
                          setHours(next);
                        }}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream disabled:opacity-40"
                      />
                      <label className="ml-auto flex items-center gap-2 text-xs text-cream-dim">
                        <input
                          type="checkbox"
                          checked={r.isOff}
                          onChange={(e) => {
                            const next = [...hours];
                            next[i] = { ...r, isOff: e.target.checked };
                            setHours(next);
                          }}
                        />
                        Off
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={saveHours} disabled={savingHours} className={btn.outline}>
                    {savingHours ? "Saving…" : "Save hours"}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Time off */}
          <section className={`rounded-xl border border-white/10 bg-charcoal p-6 ${isNew ? "opacity-40" : ""}`}>
            <h2 className="font-display text-lg font-bold">Time Off</h2>
            {isNew ? (
              <p className="mt-2 text-sm text-cream-dim">Available after creating the barber.</p>
            ) : (
              <>
                <div className="mt-4 space-y-1.5">
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
                        {t.reason && <span className="text-cream-dim/60"> · {t.reason}</span>}
                      </span>
                      <DangerButton
                        label="Remove"
                        confirmLabel="Remove?"
                        onConfirm={() => removeTimeOff(t.id)}
                        className="!border-0 !px-2 !py-1 !text-xs !font-normal !normal-case !tracking-normal"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-2">
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
                  <label className="text-xs text-cream-dim">
                    Reason
                    <input
                      value={offReason}
                      onChange={(e) => setOffReason(e.target.value)}
                      placeholder="optional"
                      className="mt-1 block rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-cream"
                    />
                  </label>
                  <button onClick={addTimeOff} className={btn.outline}>
                    Add
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
