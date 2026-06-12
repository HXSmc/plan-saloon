// App-level unions for the String columns SQLite can't express as enums.

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_SOURCES = ["ONLINE", "WALK_IN"] as const;
export type AppointmentSource = (typeof APPOINTMENT_SOURCES)[number];

export const USER_ROLES = ["OWNER", "BARBER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Statuses that count toward revenue analytics.
export const REVENUE_STATUSES: AppointmentStatus[] = ["COMPLETED"];

// Statuses that still occupy a slot (block double-booking).
export const ACTIVE_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
];
