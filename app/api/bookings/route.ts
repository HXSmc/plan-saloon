import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BookingError, createAppointment } from "@/lib/booking";

const schema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.string().regex(/^\d{2}:\d{2}$/), // 24h HH:MM
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(7),
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
        service: appt.service.name,
        barber: appt.barber.name,
        startTime: appt.startTime,
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
