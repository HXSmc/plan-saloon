# Action Plan Barbershop

A responsive, bilingual (English / Arabic), full-stack marketing **and** booking website for a
real barbershop — plus a secured **admin dashboard** for the owner and barbers to run the
business. One Next.js app holds the public site, the booking engine, the REST API, and the
back-office.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + Postgres (Supabase) · Auth.js (v5).

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

Everything is one codebase. The database is Postgres (Supabase in production, any local
Postgres in dev); notifications log to the console until Resend is configured.

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
cp .env.example .env   # set DATABASE_URL/DIRECT_URL (Supabase) + AUTH_SECRET
npm run db:push        # create the Postgres schema
npm run db:seed        # seed services, barbers, hours, owner + barber logins
npm run dev            # http://localhost:3000
```

- Customer site: **`/`** · booking flow: **`/book`** · manage a booking: **`/booking/<token>`**
- Admin dashboard: **`/admin`**

> `AUTH_SECRET` must be non-empty or login throws `MissingSecret`. Generate one with
> `openssl rand -base64 32`. Env vars load at boot — restart `npm run dev` after editing `.env`.

### Logins (from seed)
- **Owner:** `owner@actionplan.sa` / `changeme` (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Barbers:** `<id>@actionplan.sa` / `barber123` (e.g. `mohamed@actionplan.sa`)

---

## What's built

### 1. Customer marketing site (`/`)
- Sticky header (logo, nav, language toggle, BOOK NOW), full-screen hero with a **live
  open/closed pill** computed from the published hours, services grouped by **category** with
  **durations**, about/gallery + Google-reviews link, team (real photos via `imageUrl`, initials
  fallback), footer with hours + Dammam map + today highlighted (shop-local).
- **Services** and **Team** grids read **live from the API** (`useCatalog()`), so admin edits and
  active/inactive toggles show up after a reload (seed data is the instant-paint fallback).
- Every CTA deep-links into the booking page: `/book?service=<id>` / `/book?barber=<id>`.

### 2. Booking flow (`/book` — a page, not a popup)
Service → Barber (or First Available) → Date & Time → Details → Confirmation, with a sticky
summary rail and a clickable progress bar. Shareable/bookmarkable URL; back button works.
- Slots come live from `GET /api/availability?date&barberId&serviceId` — **duration-aware**:
  a 90-min combo only shows starts where the full interval is free, and already-elapsed times
  never appear (30-min booking lead, shop-local).
- Submit calls `POST /api/bookings`; success shows the booking summary **plus a private
  manage link** (`/booking/<token>`) to view / reschedule / cancel — no account needed. The
  same link is included in the confirmation email. On **409** the flow routes back to pick
  another slot.

### 3. Booking engine & API
- **Public:** `GET /api/services`, `GET /api/barbers`,
  `GET /api/availability?date&barberId&serviceId`, `POST /api/bookings`,
  `GET|PATCH /api/bookings/<manageToken>` (reschedule / cancel).
- **Concurrency:** duration-aware interval overlap check inside a **serializable transaction**,
  backed by `@@unique([barberId, startTime])` for exact-start races → losers get **HTTP 409**.
- **Validity:** past/too-soon starts rejected; online bookings must match real availability
  (working hours − bookings − time off); a phone number may hold at most 3 open bookings.
- **First Available:** resolved server-side to a concrete free barber before insert.
- **Scheduling:** 45-minute slot grid, but services may run longer (`durationMin`) — the engine
  blocks the full interval. Shop timezone Asia/Riyadh (+03:00).
- **Shared write path:** `createAppointment()` in `lib/booking.ts` powers both public bookings
  and admin walk-ins (admins may override published hours, never overlap).

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
- **Calendar** — a **day timeline** (one column per barber, drawn from each barber's real
  working hours): appointments are positioned by actual start + duration, so off-grid times and
  long services render true-to-size; time-off shows as hatched blocks; outside-hours is shaded.
  Click empty space → **walk-in side panel** (time snapped to 15 min); click a booking → side
  panel with check-in, no-show, cancel (**instant with Undo toast** — no confirm popups),
  move (time + barber), and a two-step inline delete.
- **Staff** — list + **full detail pages** (`/admin/staff/<id>`, `/admin/staff/new`): profile
  EN/AR, photo URL, weekly hours, time-off (with reason), and login credential management.
- **Services** — side-panel editor (name/description EN/AR, **category EN/AR**, price, duration,
  **icon picker**, popular), active toggle with Undo.
- **Analytics** *(owner only)* — total revenue + completed + avg ticket, filterable by
  day / week / month, with **revenue per barber** and **most-booked services** bar charts. Built
  from `COMPLETED` appointments; revenue is captured at check-in from the service price.

Barbers are **scoped** to their own data (calendar, schedule); owners see everything.

---

## Data model (`prisma/schema.prisma`)

| Model | Purpose |
|-------|---------|
| `User` | Login accounts. `role` OWNER/BARBER, optional `barberId` link. |
| `Barber` | Profile (EN/AR), `initials`, `imageUrl`, `phone`, `active`, JSON `specialties`. |
| `Service` | Menu item (EN/AR), `price`, `durationMin`, `category` (EN/AR), `popular`, `active`. |
| `BarberService` | Which services each barber offers (M:N). |
| `WorkingHours` | Per-barber weekly shift (weekday, start/end minutes, off). |
| `TimeOff` | Per-barber blocked date ranges. |
| `Appointment` | Booking: customer, service, barber, start/end, `status`, `revenue`, `source`, **`manageToken`** (customer self-service link). **`@@unique([barberId, startTime])`**. |

Statuses are app-level string unions (`lib/types.ts`); specialty lists are JSON strings.

---

## Project structure

```
app/
  layout.tsx, page.tsx, globals.css      # fonts, theme tokens, landing page
  book/                                   # 5-step booking flow (page, not modal)
  booking/[token]/                        # customer self-service (view/reschedule/cancel)
  api/
    services, barbers, availability, bookings (+[token])   # public booking API
    auth/[...nextauth]                           # Auth.js handlers
    admin/                                        # protected admin API
      barbers (+[id], /hours, /timeoff), services, appointments, analytics
  admin/
    layout.tsx, login, page (dashboard), calendar, staff, services, analytics
components/
  Header, Hero, Services, About, Team, Footer, Logo, GlowButton, OpenStatusPill, LangToggle, icons
  booking/   BookingContext, BookingFlow, SlotPicker, ManageBooking,
             Step{Service,Barber,Calendar,Info,Confirm}, useCatalog
  i18n/      LanguageContext
  admin/     Sidebar, SidePanel, Toast, ui, util, types
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
`DATABASE_URL` (Supabase pooled), `DIRECT_URL` (Supabase direct, for `db push`),
`AUTH_SECRET` (required, non-empty), `NEXT_PUBLIC_SITE_URL` (manage-link base),
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, optional `RESEND_API_KEY` + `RESEND_FROM`.

## Deploy notes (Supabase)
1. Create a Supabase project → copy the **pooled** (6543) and **direct** (5432) connection
   strings into `DATABASE_URL` / `DIRECT_URL`.
2. `npm run db:push && npm run db:seed` (set `ADMIN_EMAIL`/`ADMIN_PASSWORD` first — never ship
   the `changeme` default).
3. Set `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` (production domain), and Resend keys if email
   confirmations are wanted.
