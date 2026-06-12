import { prisma } from "./db";
import { SLOT_MINUTES, type Slot } from "./data";
import { ACTIVE_STATUSES } from "./types";

// Action Plan is in Dammam (Asia/Riyadh, UTC+3, no DST).
export const TZ_OFFSET = "+03:00";

/** Build the absolute Date for a wall-clock slot (e.g. date="2026-06-12", value="22:30"). */
export function buildStartTime(date: string, value: string): Date {
  return new Date(`${date}T${value}:00${TZ_OFFSET}`);
}

/** Weekday index (0=Sun..6=Sat) for a YYYY-MM-DD date in shop-local time. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
}

function minutesToSlot(m: number): Slot {
  const mod = ((m % 1440) + 1440) % 1440;
  const h24 = Math.floor(mod / 60);
  const min = mod % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    value: `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
    label: `${h12}:${String(min).padStart(2, "0")} ${period}`,
  };
}

function candidateSlots(startMin: number, endMin: number): Slot[] {
  const out: Slot[] = [];
  for (let m = startMin; m + SLOT_MINUTES <= endMin; m += SLOT_MINUTES) {
    out.push(minutesToSlot(m));
  }
  return out;
}

/** Free slots for one barber on a date: working hours − booked − time-off. */
export async function slotsForBarber(
  barberId: string,
  date: string
): Promise<Slot[]> {
  const weekday = weekdayOf(date);
  const wh = await prisma.workingHours.findUnique({
    where: { barberId_weekday: { barberId, weekday } },
  });
  if (!wh || wh.isOff) return [];

  const candidates = candidateSlots(wh.startMin, wh.endMin);

  const dayStart = buildStartTime(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [appointments, timeOff] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId,
        startTime: { gte: dayStart, lt: dayEnd },
        status: { in: ACTIVE_STATUSES },
      },
      select: { startTime: true },
    }),
    prisma.timeOff.findMany({
      where: { barberId, start: { lt: dayEnd }, end: { gt: dayStart } },
      select: { start: true, end: true },
    }),
  ]);

  const taken = new Set(appointments.map((a) => a.startTime.getTime()));

  return candidates.filter((slot) => {
    const start = buildStartTime(date, slot.value).getTime();
    const end = start + SLOT_MINUTES * 60 * 1000;
    if (taken.has(start)) return false;
    for (const off of timeOff) {
      if (start < off.end.getTime() && end > off.start.getTime()) return false;
    }
    return true;
  });
}

/**
 * Availability for the booking flow.
 * - barberId given → that barber's free slots.
 * - barberId null ("First Available") → union of all active barbers' free slots.
 */
export async function availability(
  date: string,
  barberId: string | null
): Promise<Slot[]> {
  if (barberId) return slotsForBarber(barberId, date);

  const barbers = await prisma.barber.findMany({
    where: { active: true },
    select: { id: true },
  });
  const perBarber = await Promise.all(
    barbers.map((b) => slotsForBarber(b.id, date))
  );

  const byValue = new Map<string, Slot>();
  for (const slots of perBarber) {
    for (const s of slots) byValue.set(s.value, s);
  }
  return [...byValue.values()].sort((a, b) => a.value.localeCompare(b.value));
}

/** First active barber free at a given date+slot (for "First Available" booking). */
export async function firstFreeBarber(
  date: string,
  value: string
): Promise<string | null> {
  const barbers = await prisma.barber.findMany({
    where: { active: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  for (const b of barbers) {
    const free = await slotsForBarber(b.id, date);
    if (free.some((s) => s.value === value)) return b.id;
  }
  return null;
}
