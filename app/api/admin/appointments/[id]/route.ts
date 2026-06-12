import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { buildStartTime } from "@/lib/slots";
import {
  ACTIVE_STATUSES,
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/lib/types";

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
    } else {
      // Any non-completed status (incl. undoing a check-in) carries no revenue.
      data.revenue = 0;
    }
  } else if (d.revenue !== undefined) {
    data.revenue = d.revenue;
  }

  // Reschedule and/or reassign — validate interval overlap, not just exact start.
  const targetBarberId =
    d.barberId && guard.user.role === "OWNER" ? d.barberId : existing.barberId;
  let newStart = existing.startTime;
  let newEnd = existing.endTime;
  if (d.date && d.value) {
    newStart = buildStartTime(d.date, d.value);
    newEnd = new Date(newStart.getTime() + existing.service.durationMin * 60000);
    data.startTime = newStart;
    data.endTime = newEnd;
  }
  if (d.barberId && guard.user.role === "OWNER") {
    data.barber = { connect: { id: d.barberId } };
  }
  const movesInterval =
    (d.date && d.value) || (d.barberId && guard.user.role === "OWNER");

  try {
    // Clash check + update in one serializable transaction — the unique
    // constraint alone can't see different-start overlaps.
    const updated = await prisma.$transaction(
      async (tx) => {
        if (movesInterval) {
          const clash = await tx.appointment.findFirst({
            where: {
              id: { not: id },
              barberId: targetBarberId,
              status: { in: ACTIVE_STATUSES },
              startTime: { lt: newEnd },
              endTime: { gt: newStart },
            },
            select: { id: true },
          });
          if (clash) throw new ClashError();
        }
        return tx.appointment.update({
          where: { id },
          data,
          include: { service: true, barber: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    return NextResponse.json(updated);
  } catch (err) {
    if (
      err instanceof ClashError ||
      (err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === "P2002" || err.code === "P2034"))
    ) {
      return NextResponse.json(
        { error: "That barber already has an appointment at that time." },
        { status: 409 }
      );
    }
    throw err;
  }
}

class ClashError extends Error {}

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
