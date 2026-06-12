import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { BookingError, createAppointment } from "@/lib/booking";
import { TZ_OFFSET } from "@/lib/slots";

// GET /api/admin/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&barberId=
export async function GET(req: NextRequest) {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let barberId = searchParams.get("barberId") || undefined;

  // Barbers are scoped to their own appointments.
  if (user.role !== "OWNER") barberId = user.barberId ?? "__none__";

  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(`${from ?? today}T00:00:00${TZ_OFFSET}`);
  const end = new Date(`${to ?? from ?? today}T00:00:00${TZ_OFFSET}`);
  end.setUTCDate(end.getUTCDate() + 1); // inclusive of the `to` day

  const appointments = await prisma.appointment.findMany({
    // Interval overlap, not start-only: a late walk-in spilling past midnight
    // must still show on the next day's calendar.
    where: {
      startTime: { lt: end },
      endTime: { gt: start },
      ...(barberId ? { barberId } : {}),
    },
    include: { service: true, barber: true },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(appointments);
}

const walkInSchema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(1),
  // Walk-ins may have no phone — stored as "" (never a placeholder value).
  customerPhone: z.string().trim().default(""),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

// POST = manual walk-in / phone booking inserted by admin.
export async function POST(req: NextRequest) {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;

  const parsed = walkInSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid appointment." }, { status: 400 });
  }
  const d = parsed.data;

  // Barbers may only insert onto their own chair.
  if (guard.user.role !== "OWNER" && guard.user.barberId !== d.barberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const appt = await createAppointment({
      serviceId: d.serviceId,
      barberId: d.barberId,
      date: d.date,
      value: d.value,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail || null,
      source: "WALK_IN",
      allowOutsideHours: true, // admins can override published hours
    });
    return NextResponse.json(appt, { status: 201 });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin appointments] error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
