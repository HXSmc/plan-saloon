import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { services, barbers, hours } from "../lib/data";

const prisma = new PrismaClient();

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  let mins = h * 60 + m;
  if (mins === 0) mins = 1440; // midnight close
  return mins;
}

async function main() {
  console.log("Seeding database…");

  // Clean slate (idempotent re-seed).
  await prisma.appointment.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();

  // Services — keep the curated lib/data.ts ids so marketing + booking align.
  for (const s of services) {
    await prisma.service.create({
      data: {
        id: s.id,
        name: s.name,
        name_ar: s.name_ar,
        description: s.description,
        description_ar: s.description_ar,
        price: s.price,
        icon: s.icon,
        category: s.category,
        category_ar: s.category_ar,
        popular: s.popular ?? false,
        durationMin: s.durationMin,
        active: true,
      },
    });
  }

  // Barbers + their weekly hours + service links.
  for (const b of barbers) {
    await prisma.barber.create({
      data: {
        id: b.id,
        name: b.name,
        name_ar: b.name_ar,
        title: b.title,
        title_ar: b.title_ar,
        bio: b.bio,
        bio_ar: b.bio_ar,
        initials: b.initials,
        active: true,
        specialties: JSON.stringify(b.specialties),
        specialties_ar: JSON.stringify(b.specialties_ar),
      },
    });

    // Weekly working hours from the shop's open/close table.
    for (const h of hours) {
      await prisma.workingHours.create({
        data: {
          barberId: b.id,
          weekday: WEEKDAY_INDEX[h.day],
          startMin: toMinutes(h.open),
          endMin: toMinutes(h.close),
          isOff: h.closed ?? false,
        },
      });
    }

    // Every barber offers every service by default.
    for (const s of services) {
      await prisma.barberService.create({
        data: { barberId: b.id, serviceId: s.id },
      });
    }
  }

  // Owner account.
  const ownerEmail = process.env.ADMIN_EMAIL ?? "owner@actionplan.sa";
  const ownerPassword = process.env.ADMIN_PASSWORD ?? "changeme";
  await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash: await bcrypt.hash(ownerPassword, 10),
      role: "OWNER",
    },
  });

  // One login per barber (email = <id>@actionplan.sa, password = barber123).
  for (const b of barbers) {
    await prisma.user.create({
      data: {
        email: `${b.id}@actionplan.sa`,
        passwordHash: await bcrypt.hash("barber123", 10),
        role: "BARBER",
        barberId: b.id,
      },
    });
  }

  console.log(`Seeded ${services.length} services, ${barbers.length} barbers.`);
  console.log(`Owner login: ${ownerEmail} / ${ownerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
