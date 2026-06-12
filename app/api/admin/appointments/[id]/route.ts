import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { buildStartTime } from "@/lib/slots";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  revenue: z.number().int().min(0).optional(),
  // Reschedule (explicit time edit / drag-drop both post these):
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  value: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  barberId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;
  const { id } = await params;

  const existing = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (guard.user.role !== "OWNER" && guard.user.barberId !== existing.barberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }
  const d = parsed.data;
  const data: Prisma.AppointmentUpdateInput = {};

  // Status + check-in revenue logic.
  if (d.status) {
    const status = d.status as AppointmentStatus;
    data.status = status;
    if (status === "COMPLETED") {
      // Revenue captured at checkout: explicit value, else the service price.
      data.revenue = d.revenue ?? existing.service.price;
    } else if (status === "CANCELLED" || status === "NO_SHOW") {
      data.revenue = 0;
    }
  } else if (d.revenue !== undefined) {
    data.revenue = d.revenue;
  }

  // Reschedule.
  if (d.date && d.value) {
    const start = buildStartTime(d.date, d.value);
    data.startTime = start;
    data.endTime = new Date(start.getTime() + existing.service.durationMin * 60000);
  }
  if (d.barberId && guard.user.role === "OWNER") {
    data.barber = { connect: { id: d.barberId } };
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: { service: true, barber: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That barber already has an appointment at that time." },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;
  const { id } = await params;

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (guard.user.role !== "OWNER" && guard.user.barberId !== existing.barberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
