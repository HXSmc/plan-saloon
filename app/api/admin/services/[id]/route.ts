import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  name: z.string().trim().min(1).optional(),
  name_ar: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  description_ar: z.string().trim().optional(),
  price: z.number().int().min(0).optional(),
  icon: z.string().optional(),
  category: z.string().trim().min(1).optional(),
  category_ar: z.string().trim().min(1).optional(),
  popular: z.boolean().optional(),
  durationMin: z.number().int().min(15).max(240).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }
  const service = await prisma.service.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(service);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;
  const { id } = await params;

  const appts = await prisma.appointment.count({ where: { serviceId: id } });
  if (appts > 0) {
    const service = await prisma.service.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ...service, softDeleted: true });
  }
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
