import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const barbers = await prisma.barber.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    include: { services: { select: { serviceId: true } } },
  });

  return NextResponse.json(
    barbers.map((b) => ({
      id: b.id,
      name: b.name,
      name_ar: b.name_ar,
      title: b.title,
      title_ar: b.title_ar,
      bio: b.bio,
      bio_ar: b.bio_ar,
      initials: b.initials,
      imageUrl: b.imageUrl,
      specialties: JSON.parse(b.specialties) as string[],
      specialties_ar: JSON.parse(b.specialties_ar) as string[],
      serviceIds: b.services.map((s) => s.serviceId),
    }))
  );
}
