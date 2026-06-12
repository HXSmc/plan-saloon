import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  hours: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        startMin: z.number().int().min(0).max(1440),
        endMin: z.number().int().min(0).max(1440),
        isOff: z.boolean(),
      })
    )
    .length(7),
});

// Barbers may edit their own schedule; owner may edit anyone's.
export async function PUT(req: NextRequest, { params }: Ctx) {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  if (guard.user.role !== "OWNER" && guard.user.barberId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid hours." }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.hours.map((h) =>
      prisma.workingHours.upsert({
        where: { barberId_weekday: { barberId: id, weekday: h.weekday } },
        create: { barberId: id, ...h },
        update: { startMin: h.startMin, endMin: h.endMin, isOff: h.isOff },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
