import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { buildStartTime, firstFreeBarber, slotsForBarber } from "./slots";
import { notify } from "./notify";
import type { AppointmentSource } from "./types";

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
 * - resolves "First Available" to a concrete free barber,
 * - relies on the @@unique([barberId, startTime]) DB constraint to reject any
 *   racing double-book (Prisma P2002 → BookingError 409).
 * Fires the notification pipeline on success.
 */
export async function createAppointment(input: CreateBookingInput) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });
  if (!service) throw new BookingError("Service not found.", 404);

  // Resolve barber.
  let barberId = input.barberId;
  if (!barberId) {
    barberId = await firstFreeBarber(input.date, input.value);
    if (!barberId)
      throw new BookingError("No barber is available at that time.", 409);
  }

  const barber = await prisma.barber.findFirst({
    where: { id: barberId, active: true },
  });
  if (!barber) throw new BookingError("Barber not found.", 404);

  // For online bookings, the slot must be within the barber's real availability.
  if (!input.allowOutsideHours) {
    const free = await slotsForBarber(barberId, input.date);
    if (!free.some((s) => s.value === input.value)) {
      throw new BookingError("That slot is no longer available.", 409);
    }
  }

  const startTime = buildStartTime(input.date, input.value);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60 * 1000);

  let appointment;
  try {
    appointment = await prisma.appointment.create({
      data: {
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail ?? null,
        serviceId: service.id,
        barberId,
        startTime,
        endTime,
        status: "CONFIRMED",
        source: input.source ?? "ONLINE",
      },
      include: { service: true, barber: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
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
  });

  return appointment;
}
