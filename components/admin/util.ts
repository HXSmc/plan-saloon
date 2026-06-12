// Small client helpers shared across admin pages.

export const RIYADH = "Asia/Riyadh";

/** Today as YYYY-MM-DD in shop-local time. */
export function todayStr(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: RIYADH,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts; // en-CA yields YYYY-MM-DD
}

/** Shift a YYYY-MM-DD string by n days. */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: RIYADH,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: RIYADH,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtMoney(n: number): string {
  return `SAR ${n.toLocaleString("en-US")}`;
}

/** ISO → "HH:MM" 24h slot value in shop-local time. */
export function slotValueOf(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RIYADH,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Day-grid slot values + labels (12:00 → 23:15, 45-min steps). */
export function daySlots(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let m = 12 * 60; m + 45 <= 1440; m += 45) {
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    out.push({
      value: `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      label: `${h12}:${String(min).padStart(2, "0")} ${period}`,
    });
  }
  return out;
}

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-white/10 text-cream-dim",
  CONFIRMED: "bg-neon-blue/15 text-neon-blue",
  COMPLETED: "bg-neon-yellow/15 text-neon-yellow",
  NO_SHOW: "bg-neon-red/15 text-neon-red",
  CANCELLED: "bg-white/5 text-cream-dim/60 line-through",
};
