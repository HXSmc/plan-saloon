import { prisma } from "./db";
import { SLOT_MINUTES, type Slot } from "./data";
import { ACTIVE_STATUSES } from "./types";

// Action Plan is in Dammam (Asia/Riyadh, UTC+3, no DST).
export const TZ_OFFSET = "+03:00";

// Online bookings must start at least this many minutes from now.
export const LEAD_MINUTES = 30;

/** Build the absolute Date for a wall-clock slot (e.g. date="2026-06-12", value="22:30"). */
export function buildStartTime(date: string, value: string): Date {
  return new Date(`${date}T${value}:00${TZ_OFFSET}`);
}

/** Weekday index (0=Sun..6=Sat) for a YYYY-MM-DD date in shop-local time. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
}

/** True if a slot start is too soon (or already past) to book online. */
export function isTooSoon(start: Date, now: Date = new Date()): boolean {
  return start.getTime() < now.getTime() + LEAD_MINUTES * 60 * 1000;
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

/** Slot starts stepping by SLOT_MINUTES; the service must fully fit before close. */
function candidateSlots(
  startMin: number,
  endMin: number,
  durationMin: number
): Slot[] {
  const out: Slot[] = [];
  for (let m = startMin; m + durationMin <= endMin; m += SLOT_MINUTES) {
    out.push(minutesToSlot(m));
  }
  return out;
}

type Interval = { start: number; end: number }; // epoch ms

/**
 * Free slots for one barber on a date, for a service of `durationMin` minutes:
 * working hours − overlapping bookings − time-off − already-elapsed times.
 * A slot is free only if the whole [start, start+duration) interval is clear.
 * `excludeAppointmentId` ignores one booking — used when rescheduling it, so
 * it doesn't block its own new time.
 */
export async function slotsForBarber(
  barberId: string,
  date: string,
  durationMin: number = SLOT_MINUTES,
  excludeAppointmentId?: string
): Promise<Slot[]> {
  const weekday = weekdayOf(date);
  const wh = await prisma.workingHours.findUnique({
    where: { barberId_weekday: { barberId, weekday } },
  });
  if (!wh || wh.isOff) return [];

  const candidates = candidateSlots(wh.startMin, wh.endMin, durationMin);

  const dayStart = buildStartTime(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [appointments, timeOff] = await Promise.all([
    prisma.appointment.findMany({
      // Anything overlapping the day, including long bookings started before it.
      where: {
        barberId,
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
        status: { in: ACTIVE_STATUSES },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.timeOff.findMany({
      where: { barberId, start: { lt: dayEnd }, end: { gt: dayStart } },
      select: { start: true, end: true },
    }),
  ]);

  const busy: Interval[] = [
    ...appointments.map((a) => ({
      start: a.startTime.getTime(),
      end: a.endTime.getTime(),
    })),
    ...timeOff.map((t) => ({ start: t.start.getTime(), end: t.end.getTime() })),
  ];

  const now = new Date();
  return candidates.filter((slot) => {
    const startDate = buildStartTime(date, slot.value);
    if (isTooSoon(startDate, now)) return false;
    const start = startDate.getTime();
    const end = start + durationMin * 60 * 1000;
    return busy.every((b) => start >= b.end || end <= b.start);
  });
}

/** Duration of a service in minutes (falls back to one slot if unknown). */
export async function serviceDuration(
  serviceId: string | null
): Promise<number> {
  if (!serviceId) return SLOT_MINUTES;
  const svc = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { durationMin: true },
  });
  return svc?.durationMin ?? SLOT_MINUTES;
}

/**
 * Availability for the booking flow.
 * - barberId given → that barber's free slots.
 * - barberId null ("First Available") → union of all active barbers' free slots.
 * Duration-aware when serviceId is provided.
 */
export async function availability(
  date: string,
  barberId: string | null,
  serviceId: string | null = null,
  excludeAppointmentId?: string
): Promise<Slot[]> {
  const durationMin = await serviceDuration(serviceId);
  if (barberId)
    return slotsForBarber(barberId, date, durationMin, excludeAppointmentId);

  const barbers = await prisma.barber.findMany({
    where: { active: true },
    select: { id: true },
  });
  const perBarber = await Promise.all(
    barbers.map((b) => slotsForBarber(b.id, date, durationMin))
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
  value: string,
  durationMin: number = SLOT_MINUTES
): Promise<string | null> {
  const barbers = await prisma.barber.findMany({
    where: { active: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  for (const b of barbers) {
    const free = await slotsForBarber(b.id, date, durationMin);
    if (free.some((s) => s.value === value)) return b.id;
  }
  return null;
}
