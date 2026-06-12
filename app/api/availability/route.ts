import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { availability } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");
  // Manage-page reschedule: exclude the customer's own booking (proven by its
  // unguessable token) so it doesn't block its own new time. Sent as a header
  // so the token never appears in URLs / access logs.
  const excludeToken = req.headers.get("x-manage-token");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Valid `date` (YYYY-MM-DD) is required." },
      { status: 400 }
    );
  }

  let excludeAppointmentId: string | undefined;
  if (excludeToken) {
    const appt = await prisma.appointment.findUnique({
      where: { manageToken: excludeToken },
      select: { id: true },
    });
    excludeAppointmentId = appt?.id;
  }

  const slots = await availability(
    date,
    barberId || null,
    serviceId || null,
    excludeAppointmentId
  );
  return NextResponse.json({
    date,
    barberId: barberId || null,
    serviceId: serviceId || null,
    slots,
  });
}
