import { prisma } from "./db";
import { TZ_OFFSET } from "./slots";

export type AnalyticsRange = "day" | "week" | "month";

// Start of the analytics window, in shop-local time (Asia/Riyadh).
function windowStart(range: AnalyticsRange): Date {
  // "Now" as a Riyadh wall-clock date string.
  const nowRiyadh = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const y = nowRiyadh.getFullYear();
  const m = nowRiyadh.getMonth();
  const d = nowRiyadh.getDate();
  const startOfToday = new Date(
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00${TZ_OFFSET}`
  );
  if (range === "day") return startOfToday;
  const days = range === "week" ? 7 : 30;
  return new Date(startOfToday.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
}

/**
 * Aggregates COMPLETED appointments in the window into:
 * total revenue/count, per-barber revenue, and most-booked services.
 */
export async function analytics(range: AnalyticsRange) {
  const start = windowStart(range);

  const completed = await prisma.appointment.findMany({
    where: { status: "COMPLETED", startTime: { gte: start } },
    include: { barber: true, service: true },
  });

  let totalRevenue = 0;
  const byBarber = new Map<
    string,
    { barberId: string; name: string; revenue: number; count: number }
  >();
  const byService = new Map<
    string,
    { serviceId: string; name: string; revenue: number; count: number }
  >();

  for (const a of completed) {
    totalRevenue += a.revenue;

    const b = byBarber.get(a.barberId) ?? {
      barberId: a.barberId,
      name: a.barber.name,
      revenue: 0,
      count: 0,
    };
    b.revenue += a.revenue;
    b.count += 1;
    byBarber.set(a.barberId, b);

    const s = byService.get(a.serviceId) ?? {
      serviceId: a.serviceId,
      name: a.service.name,
      revenue: 0,
      count: 0,
    };
    s.revenue += a.revenue;
    s.count += 1;
    byService.set(a.serviceId, s);
  }

  return {
    range,
    start,
    totalRevenue,
    totalCompleted: completed.length,
    byBarber: [...byBarber.values()].sort((a, b) => b.revenue - a.revenue),
    topServices: [...byService.values()].sort((a, b) => b.count - a.count),
  };
}
