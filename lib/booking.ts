import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  buildStartTime,
  firstFreeBarber,
  isTooSoon,
  slotsForBarber,
} from "./slots";
import { notify } from "./notify";
import { ACTIVE_STATUSES, type AppointmentSource } from "./types";

export class BookingError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type CreateBookingInput = {
  serviceId: string;
  barberId: string | null; // null = First Available
  date: string; // YYYY-MM-DD
  value: string; // 24h "HH:MM"
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  source?: AppointmentSource;
  /** Admin walk-ins may book outside published hours; online bookings may not. */
  allowOutsideHours?: boolean;
};

/**
 * Creates an appointment with strict concurrency control:
 * - rejects past / too-soon start times for online bookings,
 * - resolves "First Available" to a concrete free barber,
 * - re-checks interval overlap inside a serializable transaction (duration-aware),
 * - relies on @@unique([barberId, startTime]) as a second guard for exact-start races.
 * Fires the notification pipeline on success.
 */
export async function createAppointment(input: CreateBookingInput) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });
  if (!service) throw new BookingError("Service not found.", 404);

  const startTime = buildStartTime(input.date, input.value);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60 * 1000);

  // Walk-ins may be logged for "now"/earlier today, but never on a wrong-looking
  // far-past date; online bookings need the full lead time.
  if (input.allowOutsideHours) {
    if (endTime.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      throw new BookingError("That time is in the past.", 400);
    }
  } else if (isTooSoon(startTime)) {
    throw new BookingError("That time has already passed.", 409);
  }

  // Resolve barber.
  let barberId = input.barberId;
  if (!barberId) {
    barberId = await firstFreeBarber(input.date, input.value, service.durationMin);
    if (!barberId)
      throw new BookingError("No barber is available at that time.", 409);
  }

  const barber = await prisma.barber.findFirst({
    where: { id: barberId, active: true },
  });
  if (!barber) throw new BookingError("Barber not found.", 404);

  // For online bookings, the slot must be within the barber's real availability.
  if (!input.allowOutsideHours) {
    const free = await slotsForBarber(barberId, input.date, service.durationMin);
    if (!free.some((s) => s.value === input.value)) {
      throw new BookingError("That slot is no longer available.", 409);
    }
  }

  let appointment;
  try {
    appointment = await prisma.$transaction(
      async (tx) => {
        // Duration-aware overlap re-check; serializable isolation closes the
        // race the exact-start unique constraint can't see.
        const clash = await tx.appointment.findFirst({
          where: {
            barberId: barberId!,
            status: { in: ACTIVE_STATUSES },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          select: { id: true },
        });
        if (clash) {
          throw new BookingError(
            "That slot was just taken. Please pick another.",
            409
          );
        }
        return tx.appointment.create({
          data: {
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerEmail: input.customerEmail ?? null,
            serviceId: service.id,
            barberId: barberId!,
            startTime,
            endTime,
            status: "CONFIRMED",
            source: input.source ?? "ONLINE",
          },
          include: { service: true, barber: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    if (err instanceof BookingError) throw err;
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2002" || err.code === "P2034") // unique clash / write conflict
    ) {
      throw new BookingError(
        "That slot was just taken. Please pick another.",
        409
      );
    }
    throw err;
  }

  await notify({
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    customerEmail: appointment.customerEmail,
    serviceName: appointment.service.name,
    barberName: appointment.barber.name,
    startTime: appointment.startTime,
    price: appointment.service.price,
    manageToken: appointment.manageToken,
  });

  return appointment;
}

/**
 * Customer-initiated reschedule via the manage token. Re-runs the same
 * availability rules as a fresh online booking.
 */
export async function rescheduleAppointment(
  manageToken: string,
  date: string,
  value: string
) {
  const appt = await prisma.appointment.findUnique({
    where: { manageToken },
    include: { service: true },
  });
  if (!appt) throw new BookingError("Booking not found.", 404);
  if (appt.status === "CANCELLED")
    throw new BookingError("This booking was cancelled.", 409);
  if (appt.status === "COMPLETED")
    throw new BookingError("This booking is already completed.", 409);
  if (appt.startTime.getTime() < Date.now())
    throw new BookingError("This booking has already started.", 409);

  const startTime = buildStartTime(date, value);
  if (isTooSoon(startTime))
    throw new BookingError("That time has already passed.", 409);

  const barber = await prisma.barber.findFirst({
    where: { id: appt.barberId, active: true },
  });
  if (!barber)
    throw new BookingError(
      "This barber is no longer taking bookings — please call the shop.",
      409
    );

  // Exclude the booking itself so it doesn't block its own new time.
  const free = await slotsForBarber(
    appt.barberId,
    date,
    appt.service.durationMin,
    appt.id
  );
  if (!free.some((s) => s.value === value)) {
    throw new BookingError("That slot is no longer available.", 409);
  }

  const endTime = new Date(
    startTime.getTime() + appt.service.durationMin * 60 * 1000
  );

  try {
    // Same serializable overlap re-check as createAppointment — the unique
    // constraint alone can't see different-start overlaps.
    return await prisma.$transaction(
      async (tx) => {
        const clash = await tx.appointment.findFirst({
          where: {
            id: { not: appt.id },
            barberId: appt.barberId,
            status: { in: ACTIVE_STATUSES },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          select: { id: true },
        });
        if (clash) {
          throw new BookingError(
            "That slot was just taken. Please pick another.",
            409
          );
        }
        return tx.appointment.update({
          where: { manageToken },
          data: { startTime, endTime, status: "CONFIRMED" },
          include: { service: true, barber: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    if (err instanceof BookingError) throw err;
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2002" || err.code === "P2034")
    ) {
      throw new BookingError(
        "That slot was just taken. Please pick another.",
        409
      );
    }
    throw err;
  }
}

/** Customer-initiated cancellation via the manage token. */
export async function cancelAppointment(manageToken: string) {
  const appt = await prisma.appointment.findUnique({ where: { manageToken } });
  if (!appt) throw new BookingError("Booking not found.", 404);
  if (appt.status === "COMPLETED")
    throw new BookingError("This booking is already completed.", 409);
  if (appt.startTime.getTime() < Date.now())
    throw new BookingError("This booking has already started.", 409);

  return prisma.appointment.update({
    where: { manageToken },
    data: { status: "CANCELLED", revenue: 0 },
    include: { service: true, barber: true },
  });
}
