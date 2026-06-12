# Action Plan Barbershop

A responsive, bilingual (English / Arabic), full-stack marketing **and** booking website for a
real barbershop — plus a secured **admin dashboard** for the owner and barbers to run the
business. One Next.js app holds the public site, the booking engine, the REST API, and the
back-office.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · Auth.js (v5).

---

## The idea

A customer lands on a dark, neon-lit one-page site themed after the shop's storefront, browses
services and barbers, and books an appointment through a 5-step flow — choosing a service, a
barber (or "first available"), a date and time, then entering their details. The booking is
written to a database with **real double-booking protection**, and a confirmation is fired
through a notification pipeline.

Behind a login, the **owner** manages the whole shop: staff, schedules, time-off, services and
prices, a live appointment calendar (with walk-in insertion, rescheduling, cancellation, and
arrival check-in), and revenue analytics. Each **barber** gets a scoped view of their own
calendar and schedule.

Everything is one codebase, runs locally with zero external services (SQLite + console
notifications), and is production-ready by swapping two env values.

---

## Design & theme

Sampled from the storefront photo (`IMG_6897.jpg`):

- **Palette:** deep charcoal base, cream/off-white text, a glowing **neon-yellow** accent (the
  illuminated "A"), and neon red/blue reserved strictly for status indicators (the "OPEN" sign).
- **Typography:** bold sans (Archivo) for headers, spaced labels (Montserrat), serif body (Lora),
  plus Cairo as an Arabic-capable fallback.
- **Texture & glow:** subtle stone grain, warm amber chandelier glow, reusable `.glow-yellow`.
- **Logo:** the wordmark is recreated as inline SVG — a glowing yellow "A" with integrated
  scissors + "ction plan" / "BARBERSHOP".

### Bilingual (EN / AR)
A 🌐 toggle in the header flips the entire site between English and Arabic, including full
**RTL** layout (`dir="rtl"`), localized content, locale-aware dates, and direction-aware arrows.
Language choice persists in `localStorage`. UI strings live in `lib/i18n.ts`; content (service
names, barber bios, day names) carries `_ar` fields in the database.

---

## Quick start

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then set AUTH_SECRET (openssl rand -base64 32)
npm run db:push        # create the SQLite schema (prisma/dev.db)
npm run db:seed        # seed services, barbers, hours, owner + barber logins
npm run dev            # http://localhost:3000
```

- Customer site + booking: **`/`**
- Admin dashboard: **`/admin`**

> `AUTH_SECRET` must be non-empty or login throws `MissingSecret`. Generate one with
> `openssl rand -base64 32`. Env vars load at boot — restart `npm run dev` after editing `.env`.

### Logins (from seed)
- **Owner:** `owner@actionplan.sa` / `changeme` (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Barbers:** `<id>@actionplan.sa` / `barber123` (e.g. `mohamed@actionplan.sa`)

---

## What's built

### 1. Customer marketing site (`/`)
- Sticky header (logo, nav, language toggle, BOOK NOW), full-screen hero, services grid,
  about/gallery, team, footer with hours + dark-themed map + today's hours highlighted.
- **Services** and **Team** grids read **live from the API** (`useCatalog()`), so admin edits and
  active/inactive toggles show up after a reload (seed data is the instant-paint fallback).
- Reusable `openBooking({ serviceId?, barberId? })` opens the booking modal from any CTA.

### 2. Booking flow (5-step modal)
Service → Barber (or First Available) → Date & Time → Details → Confirmation.
- Slots come live from `GET /api/availability` — booked / off / out-of-hours times don't appear.
- Submit calls `POST /api/bookings`; on success shows a neon success badge, on **409** routes
  back to pick another slot (someone took it first).

### 3. Booking engine & API
- **Public:** `GET /api/services`, `GET /api/barbers`, `GET /api/availability?date&barberId`,
  `POST /api/bookings`.
- **Concurrency:** the `Appointment` table has `@@unique([barberId, startTime])`. Two racing
  bookings for the same barber+time → one succeeds, the other hits Prisma `P2002` → **HTTP 409**.
- **First Available:** resolved server-side to a concrete free barber before insert.
- **Scheduling:** fixed **45-minute** slots; shop timezone Asia/Riyadh (+03:00).
- **Shared write path:** `createAppointment()` in `lib/booking.ts` powers both public bookings
  and admin walk-ins (admins may override published hours).

### 4. Notifications
`lib/notify.ts` is a provider-agnostic pipeline fired after a successful booking. Ships a
**console adapter** (no account needed) and a **Resend email adapter** that activates when
`RESEND_API_KEY` is set. Add an SMS/WhatsApp adapter by implementing the same interface.

### 5. Authentication
Auth.js v5, **Credentials** provider, bcrypt-hashed passwords, JWT cookie sessions, roles
`OWNER` / `BARBER`. `middleware.ts` guards `/admin` (redirect to login) and `/api/admin` (401).
`auth.config.ts` is the edge-safe config (used by middleware); `auth.ts` adds the Prisma-backed
credential check.

### 6. Admin dashboard (`/admin`)
- **Dashboard** — today's appointments + quick stats (count, upcoming, completed, revenue).
- **Calendar** — daily grid (time rows × barber columns). Click an empty slot → insert a
  **walk-in**; click a booking → **check-in (complete)**, no-show, confirm, cancel, reschedule
  (time edit), or delete. Same 409 conflict protection.
- **Staff** — barber CRUD, active/inactive toggle, per-barber **weekly hours** + **time-off**
  editor, and **login credential management**: set an email + password to create a barber's
  login, reset it on edit, and the login is removed when the barber is deleted.
- **Services** — service CRUD (name EN/AR, description EN/AR, price, duration, icon, popular),
  active toggle.
- **Analytics** *(owner only)* — total revenue + completed + avg ticket, filterable by
  day / week / month, with **revenue per barber** and **most-booked services** bar charts. Built
  from `COMPLETED` appointments; revenue is captured at check-in from the service price.

Barbers are **scoped** to their own data (calendar, schedule); owners see everything.

---

## Data model (`prisma/schema.prisma`)

| Model | Purpose |
|-------|---------|
| `User` | Login accounts. `role` OWNER/BARBER, optional `barberId` link. |
| `Barber` | Profile (EN/AR), `initials`, `phone`, `active`, JSON `specialties`. |
| `Service` | Menu item (EN/AR), `price`, `durationMin`, `popular`, `active`. |
| `BarberService` | Which services each barber offers (M:N). |
| `WorkingHours` | Per-barber weekly shift (weekday, start/end minutes, off). |
| `TimeOff` | Per-barber blocked date ranges. |
| `Appointment` | Booking: customer, service, barber, start/end, `status`, `revenue`, `source`. **`@@unique([barberId, startTime])`**. |

SQLite has no enums/arrays, so statuses are string unions (`lib/types.ts`) and lists are JSON
strings.

---

## Project structure

```
app/
  layout.tsx, page.tsx, globals.css      # fonts, theme tokens, landing page
  api/
    services, barbers, availability, bookings   # public booking API
    auth/[...nextauth]                           # Auth.js handlers
    admin/                                        # protected admin API
      barbers (+[id], /hours, /timeoff), services, appointments, analytics
  admin/
    layout.tsx, login, page (dashboard), calendar, staff, services, analytics
components/
  Header, Hero, Services, About, Team, Footer, Logo, GlowButton
  booking/   BookingContext, BookingModal, Step{Service,Barber,Calendar,Info,Confirm}, useCatalog
  i18n/      LanguageContext
  admin/     Sidebar, util, types
lib/
  db, data, i18n, types, slots, booking, notify, analytics, guard
auth.ts, auth.config.ts, middleware.ts
prisma/    schema.prisma, seed.ts, dev.db
```

Key reusables: `lib/db.ts` (Prisma singleton), `lib/slots.ts` (availability math),
`lib/booking.ts` (`createAppointment`), `lib/guard.ts` (`requireUser({ owner })` for API routes),
`components/booking/useCatalog.ts` (live services/barbers fetch).

---

## How the frontend demo was bridged to the API

The site was built front-end first (a booking modal that only logged a stub), then wired to the
real backend:

| Step | Before | After |
|------|--------|-------|
| Service / Barber | static `lib/data.ts` | `useCatalog()` → `GET /api/services` + `/api/barbers` (active only) |
| Calendar | client `slotsForDate` | `GET /api/availability` — booked/off slots disappear live |
| Confirm | `console.log(payload)` | `POST /api/bookings` → 201 success, **409** → pick another slot |
| State | `time` held a display label | `time` = 24h value sent to API; `timeLabel` for display |

---

## Build history (how we got here)

1. **Marketing site** — themed one-page site, recreated SVG logo, 5-step booking modal as a
   client-side demo.
2. **Bilingual layer** — EN/AR toggle, full RTL, localized content + dates, Arabic font.
3. **Backend + admin** — Prisma/SQLite schema, booking engine with double-booking protection,
   notification pipeline, Auth.js with roles + middleware, and the full admin dashboard (staff,
   calendar/check-in, services, analytics). Bridged the modal to the live API.
4. **Live marketing data** — Services/Team grids switched from static seed to the live API.
5. **Barber credentials + fixes** — create/reset/remove barber logins from the dashboard; fixed a
   save bug where barbers with a null phone couldn't be edited.

---

## Scripts
`dev` · `build` · `start` · `db:push` · `db:seed` · `db:studio`

## Environment (`.env`)
`DATABASE_URL`, `AUTH_SECRET` (required, non-empty), `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
optional `RESEND_API_KEY` + `RESEND_FROM`.

## Deploy notes
SQLite is for local/dev. For production, point `DATABASE_URL` at Postgres and change the Prisma
datasource `provider` to `postgresql` — no model changes needed. Set a strong `AUTH_SECRET` and a
real notification provider before going live.
