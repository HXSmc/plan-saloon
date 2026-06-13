import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { BookingError, createAppointment } from "@/lib/booking";
import { ACTIVE_STATUSES } from "@/lib/types";

// Most active future bookings one phone number may hold at once.
const MAX_OPEN_BOOKINGS_PER_PHONE = 3;

const schema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.string().regex(/^\d{2}:\d{2}$/), // 24h HH:MM
  customerName: z.string().trim().min(2),
  customerPhone: z
    .string()
    .trim()
    // Normalize: keep digits and a leading "+", drop dots/dashes/spaces/etc.
    .transform((s) => (s.startsWith("+") ? "+" : "") + s.replace(/\D/g, ""))
    .pipe(z.string().regex(/^(\+?\d{7,15})$/, "Invalid phone number")),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking details.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;

  // Light abuse guard: a phone number can only hold a few open bookings.
  const open = await prisma.appointment.count({
    where: {
      customerPhone: d.customerPhone,
      status: { in: ACTIVE_STATUSES },
      startTime: { gte: new Date() },
    },
  });
  if (open >= MAX_OPEN_BOOKINGS_PER_PHONE) {
    return NextResponse.json(
      { error: "This phone number already has the maximum number of open bookings." },
      { status: 429 }
    );
  }

  try {
    const appt = await createAppointment({
      serviceId: d.serviceId,
      barberId: d.barberId ?? null,
      date: d.date,
      value: d.value,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail || null,
      source: "ONLINE",
    });

    return NextResponse.json(
      {
        id: appt.id,
        manageToken: appt.manageToken,
        service: appt.service.name,
        service_ar: appt.service.name_ar,
        barber: appt.barber.name,
        barber_ar: appt.barber.name_ar,
        startTime: appt.startTime,
        durationMin: appt.service.durationMin,
        price: appt.service.price,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[bookings] unexpected error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
