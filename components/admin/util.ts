// Small client helpers shared across admin pages.

export const RIYADH = "Asia/Riyadh";

/** Today as YYYY-MM-DD in shop-local time. */
export function todayStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RIYADH,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

/** ISO → minutes since midnight, shop-local. */
export function minuteOf(iso: string): number {
  const [h, m] = slotValueOf(iso).split(":").map(Number);
  return h * 60 + m;
}

/** Minutes since midnight → "HH:MM" (1440 wraps to 00:00). */
export function minToHHMM(m: number): string {
  const mod = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(mod / 60)).padStart(2, "0")}:${String(mod % 60).padStart(2, "0")}`;
}

/** Minutes since midnight → "h:MM AM/PM" label. */
export function minToLabel(m: number): string {
  const mod = ((m % 1440) + 1440) % 1440;
  const h24 = Math.floor(mod / 60);
  const min = mod % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${period}`;
}

/** Weekday index (0=Sun..6=Sat) of a YYYY-MM-DD date. */
export function weekdayOfDate(dateStr: string): number {
  return new Date(dateStr + "T12:00:00Z").getUTCDay();
}

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-white/10 text-cream-dim",
  CONFIRMED: "bg-neon-blue/15 text-neon-blue",
  COMPLETED: "bg-neon-yellow/15 text-neon-yellow",
  NO_SHOW: "bg-neon-red/15 text-neon-red",
  CANCELLED: "bg-white/5 text-cream-dim/60 line-through",
};

/** Solid block styles for the timeline calendar. */
export const BLOCK_STYLES: Record<string, string> = {
  PENDING: "border-white/20 bg-white/10 text-cream",
  CONFIRMED: "border-neon-blue/50 bg-neon-blue/20 text-cream",
  COMPLETED: "border-neon-yellow/50 bg-neon-yellow/15 text-cream",
  NO_SHOW: "border-neon-red/50 bg-neon-red/15 text-cream-dim",
};
