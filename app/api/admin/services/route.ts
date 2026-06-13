import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";

export async function GET() {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(services);
}

const schema = z.object({
  name: z.string().trim().min(1),
  name_ar: z.string().trim().min(1),
  description: z.string().trim().default(""),
  description_ar: z.string().trim().default(""),
  price: z.number().int().min(0),
  icon: z.string().default("scissors"),
  category: z.string().trim().min(1).default("Hair"),
  category_ar: z.string().trim().min(1).default("الشعر"),
  popular: z.boolean().default(false),
  durationMin: z.number().int().min(15).max(240).default(45),
});

export async function POST(req: NextRequest) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  }

  // Link the new service to every existing barber by default.
  const barbers = await prisma.barber.findMany({ select: { id: true } });
  const service = await prisma.service.create({
    data: {
      ...parsed.data,
      barbers: { create: barbers.map((b) => ({ barberId: b.id })) },
    },
  });
  return NextResponse.json(service, { status: 201 });
}
