# Action Plan Barbershop

Full-stack marketing site + booking engine + admin dashboard.
Next.js 15 (App Router) · TypeScript · Tailwind · Prisma + SQLite · Auth.js.

## Quick start

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then set AUTH_SECRET (openssl rand -base64 32)
npm run db:push        # create the SQLite schema (prisma/dev.db)
npm run db:seed        # seed services, barbers, hours, owner + barber logins
npm run dev            # http://localhost:3000
```

Marketing site + booking modal: `/`  ·  Admin dashboard: `/admin`

### Logins (from seed)
- **Owner:** `owner@actionplan.sa` / `changeme` (override via `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- **Barbers:** `<id>@actionplan.sa` / `barber123` (e.g. `mohamed@actionplan.sa`)

## Architecture

- **DB** (`prisma/schema.prisma`): `User, Barber, Service, BarberService, WorkingHours,
  TimeOff, Appointment`. Double-booking is prevented at the database level by
  `@@unique([barberId, startTime])` — concurrent inserts on the same slot raise Prisma
  `P2002`, which the API maps to **HTTP 409**.
- **Scheduling:** fixed **45-minute** slots. Shop tz is Asia/Riyadh (+03:00).
- **Public API:** `GET /api/services`, `GET /api/barbers`,
  `GET /api/availability?date&barberId`, `POST /api/bookings`.
- **Notifications** (`lib/notify.ts`): provider-agnostic pipeline fired after a successful
  booking. Console adapter by default; set `RESEND_API_KEY` to also send a styled email.
  Swap in SMS/WhatsApp by adding another adapter.
- **Auth:** Auth.js v5 Credentials (bcrypt) + JWT cookie, roles `OWNER` / `BARBER`.
  `middleware.ts` guards `/admin` (redirect to login) and `/api/admin` (401).
- **Admin** (`/admin`): dashboard, calendar (walk-in insert / reschedule / cancel /
  check-in), staff CRUD + weekly hours + time-off, services CRUD, analytics
  (revenue by day/week/month, per-barber, top services — owner only).

## How the frontend demo was bridged to the API

The Pass-1 booking modal held everything in React state and logged a stub. It now talks to
the backend:

| Step | Before | After |
|------|--------|-------|
| Service / Barber | static `lib/data.ts` | `useCatalog()` → `GET /api/services` + `/api/barbers` (active only) |
| Calendar | client `slotsForDate` | `GET /api/availability` — booked/off slots disappear live |
| Confirm | `console.log(payload)` | `POST /api/bookings` → 201 success badge, **409** routes back to pick another slot |
| State | `time` held a display label | `time` = 24h `value` sent to API; `timeLabel` for display |

`createAppointment()` in `lib/booking.ts` is the shared write path used by both the public
`POST /api/bookings` and the admin walk-in insert (admins may override published hours).

> Note: the marketing **Services**/**Team** sections still render curated static content from
> `lib/data.ts` (the DB seed mirrors it). The **booking flow** and **admin** are the live DB.
> To make landing-page cards reflect admin price edits, switch those sections to fetch the API
> too.

## Scripts
`dev` · `build` · `start` · `db:push` · `db:seed` · `db:studio`

## Deploy notes
SQLite is for local/dev. For production, point `DATABASE_URL` at Postgres and change the
Prisma datasource `provider` to `postgresql` — no model changes needed.
