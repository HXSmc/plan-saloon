import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";

type Ctx = { params: Promise<{ id: string }> };

async function canManage(barberId: string) {
  const guard = await requireUser();
  if ("response" in guard) return guard;
  if (guard.user.role !== "OWNER" && guard.user.barberId !== barberId) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return guard;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const guard = await canManage(id);
  if ("response" in guard) return guard.response;

  const schema = z.object({
    start: z.string().datetime({ offset: true }),
    end: z.string().datetime({ offset: true }),
    reason: z.string().optional(),
  });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid time-off." }, { status: 400 });
  }
  const t = await prisma.timeOff.create({
    data: {
      barberId: id,
      start: new Date(parsed.data.start),
      end: new Date(parsed.data.end),
      reason: parsed.data.reason,
    },
  });
  return NextResponse.json(t, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const guard = await canManage(id);
  if ("response" in guard) return guard.response;

  const { searchParams } = new URL(req.url);
  const timeOffId = searchParams.get("timeOffId");
  if (!timeOffId) {
    return NextResponse.json({ error: "timeOffId required." }, { status: 400 });
  }
  await prisma.timeOff.deleteMany({ where: { id: timeOffId, barberId: id } });
  return NextResponse.json({ ok: true });
}
