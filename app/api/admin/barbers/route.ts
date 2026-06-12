import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";

// Default weekly hours for a new barber (12:00–00:00, mirrors the shop).
const DEFAULT_HOURS = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  startMin: 12 * 60,
  endMin: 1440,
  isOff: false,
}));

export async function GET() {
  const guard = await requireUser();
  if ("response" in guard) return guard.response;

  const barbers = await prisma.barber.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      workingHours: { orderBy: { weekday: "asc" } },
      timeOff: { orderBy: { start: "asc" } },
      services: { select: { serviceId: true } },
      user: { select: { email: true } },
    },
  });
  return NextResponse.json(
    barbers.map((b) => ({
      ...b,
      specialties: JSON.parse(b.specialties),
      specialties_ar: JSON.parse(b.specialties_ar),
      serviceIds: b.services.map((s) => s.serviceId),
      loginEmail: b.user?.email ?? null,
    }))
  );
}

const createSchema = z.object({
  name: z.string().trim().min(1),
  name_ar: z.string().trim().min(1),
  title: z.string().trim().default("Barber"),
  title_ar: z.string().trim().default("حلّاق"),
  bio: z.string().trim().default(""),
  bio_ar: z.string().trim().default(""),
  initials: z.string().trim().min(1).max(3),
  phone: z.string().trim().nullable().optional(),
  specialties: z.array(z.string()).default([]),
  specialties_ar: z.array(z.string()).default([]),
  // Optional login credentials for the new barber.
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid barber." }, { status: 400 });
  }
  const d = parsed.data;
  const wantLogin = !!(d.email && d.password);

  if (wantLogin) {
    const existing = await prisma.user.findUnique({ where: { email: d.email! } });
    if (existing) {
      return NextResponse.json(
        { error: "That login email is already in use." },
        { status: 409 }
      );
    }
  }

  const barber = await prisma.$transaction(async (tx) => {
    const b = await tx.barber.create({
      data: {
        name: d.name,
        name_ar: d.name_ar,
        title: d.title,
        title_ar: d.title_ar,
        bio: d.bio,
        bio_ar: d.bio_ar,
        initials: d.initials.toUpperCase(),
        phone: d.phone || null,
        specialties: JSON.stringify(d.specialties),
        specialties_ar: JSON.stringify(d.specialties_ar),
        workingHours: { create: DEFAULT_HOURS },
      },
    });
    if (wantLogin) {
      await tx.user.create({
        data: {
          email: d.email!,
          passwordHash: await bcrypt.hash(d.password!, 10),
          role: "BARBER",
          barberId: b.id,
        },
      });
    }
    return b;
  });

  return NextResponse.json(barber, { status: 201 });
}
