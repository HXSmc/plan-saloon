import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  BookingError,
  cancelAppointment,
  rescheduleAppointment,
} from "@/lib/booking";

type Ctx = { params: Promise<{ token: string }> };

// The token is an unguessable cuid issued at booking time — it IS the auth.
function shape(a: {
  status: string;
  startTime: Date;
  customerName: string;
  serviceId: string;
  service: {
    name: string;
    name_ar: string;
    price: number;
    durationMin: number;
  };
  barber: { id: string; name: string; name_ar: string };
}) {
  return {
    status: a.status,
    startTime: a.startTime,
    customerName: a.customerName,
    serviceId: a.serviceId,
    service: a.service.name,
    service_ar: a.service.name_ar,
    price: a.service.price,
    durationMin: a.service.durationMin,
    barberId: a.barber.id,
    barber: a.barber.name,
    barber_ar: a.barber.name_ar,
  };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const appt = await prisma.appointment.findUnique({
    where: { manageToken: token },
    include: { service: true, barber: true },
  });
  if (!appt) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json(shape(appt));
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reschedule"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    value: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  z.object({ action: z.literal("cancel") }),
]);

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const appt =
      parsed.data.action === "cancel"
        ? await cancelAppointment(token)
        : await rescheduleAppointment(token, parsed.data.date, parsed.data.value);
    return NextResponse.json(shape(appt));
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[booking manage] unexpected error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
