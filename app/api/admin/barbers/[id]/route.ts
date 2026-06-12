import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guard";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  name_ar: z.string().trim().min(1).optional(),
  title: z.string().trim().optional(),
  title_ar: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  bio_ar: z.string().trim().optional(),
  initials: z.string().trim().min(1).max(3).optional(),
  phone: z.string().trim().nullable().optional(),
  active: z.boolean().optional(),
  specialties: z.array(z.string()).optional(),
  specialties_ar: z.array(z.string()).optional(),
  // Login credential changes.
  email: z.string().email().optional().or(z.literal("")),
  newPassword: z.string().min(6).optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }
  const d = parsed.data;

  // Update / create the linked login if email or newPassword were provided.
  if ((d.email && d.email.length) || (d.newPassword && d.newPassword.length)) {
    const existingUser = await prisma.user.findUnique({ where: { barberId: id } });

    // Guard against assigning an email already used by another account.
    if (d.email) {
      const clash = await prisma.user.findUnique({ where: { email: d.email } });
      if (clash && clash.barberId !== id) {
        return NextResponse.json(
          { error: "That login email is already in use." },
          { status: 409 }
        );
      }
    }

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(d.email ? { email: d.email } : {}),
          ...(d.newPassword
            ? { passwordHash: await bcrypt.hash(d.newPassword, 10) }
            : {}),
        },
      });
    } else if (d.email && d.newPassword) {
      // No login yet (e.g. legacy barber) — create one.
      await prisma.user.create({
        data: {
          email: d.email,
          passwordHash: await bcrypt.hash(d.newPassword, 10),
          role: "BARBER",
          barberId: id,
        },
      });
    }
  }

  const barber = await prisma.barber.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.name_ar !== undefined && { name_ar: d.name_ar }),
      ...(d.title !== undefined && { title: d.title }),
      ...(d.title_ar !== undefined && { title_ar: d.title_ar }),
      ...(d.bio !== undefined && { bio: d.bio }),
      ...(d.bio_ar !== undefined && { bio_ar: d.bio_ar }),
      ...(d.initials !== undefined && { initials: d.initials.toUpperCase() }),
      ...(d.phone !== undefined && { phone: d.phone || null }),
      ...(d.active !== undefined && { active: d.active }),
      ...(d.specialties !== undefined && {
        specialties: JSON.stringify(d.specialties),
      }),
      ...(d.specialties_ar !== undefined && {
        specialties_ar: JSON.stringify(d.specialties_ar),
      }),
    },
  });
  return NextResponse.json(barber);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;
  const { id } = await params;

  // A removed barber should never retain a login — drop it in both paths.
  await prisma.user.deleteMany({ where: { barberId: id } });

  // Block hard-delete if the barber has appointments — deactivate instead.
  const appts = await prisma.appointment.count({ where: { barberId: id } });
  if (appts > 0) {
    const barber = await prisma.barber.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ...barber, softDeleted: true });
  }

  await prisma.barber.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
