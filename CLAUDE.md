# Action Plan Barbershop (plan-saloon)

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind 3, Prisma 6 + **Postgres (Supabase)**, Auth.js v5 beta (JWT credentials), Resend (optional email), Zod
- Bilingual EN/AR with RTL; UI strings in `lib/i18n.ts`, `_ar` columns in DB
- `DATABASE_URL` = Supabase pooled (6543), `DIRECT_URL` = direct (5432, for `db push`)
- Local dev Postgres: throwaway cluster at `/tmp/plansaloon-pg`, port 54330 (`pg_ctl -D /tmp/plansaloon-pg start`); `.env` points there until the client's Supabase project exists

## Architecture
- Public: one-page site (`/`) → booking **page** at `/book` (5 steps, deep links `?service=`/`?barber=`) → customer self-service at `/booking/[token]` (view/reschedule/cancel via unguessable `manageToken` cuid)
- Booking engine (`lib/slots.ts` + `lib/booking.ts`): **duration-aware interval overlap** (busy = appointments' real start/end + time off), past/too-soon cutoff (`LEAD_MINUTES=30`, Riyadh), serializable transaction overlap re-check + `@@unique([barberId, startTime])` backstop; max 3 open bookings per phone (public route)
- Slot grid steps 45 min (`SLOT_MINUTES`) but services may run longer (`durationMin`) — availability takes `serviceId`
- Admin: timeline calendar (per-barber columns from real WorkingHours, px-per-minute positioning — off-grid times stay visible), SidePanel (right slide-over) instead of modals, Toast with Undo instead of alert()/confirm(), staff detail pages `/admin/staff/[id]` + `/new`
- Icons: `components/icons.tsx` SVG set; service icons are DB keys (`scissors|beard|combo|razor|kid`), `ServiceIcon` falls back to rendering legacy emoji strings
- Live open/closed pill computed client-side from `lib/data.ts` hours (`openStatus()`), refreshed each minute

## Conventions
- Design: client's palette + photos are fixed (charcoal/cream/neon-yellow from storefront). Glow effects reserved for primary CTA + logo only; no emoji in UI chrome
- No popups: public flow = pages; admin = side panels, undo-toasts, two-step inline `DangerButton`
- Statuses are string unions in `lib/types.ts`; `ACTIVE_STATUSES` block slots, `COMPLETED` counts revenue (captured at check-in)
- Admin writes guarded by `requireUser({owner})`; barbers scoped to own barberId
- `lib/data.ts` = seed source + instant-paint fallback for the public site (DB is the live truth)
- Shop is in Dammam — all "today"/weekday logic must use Asia/Riyadh (`riyadhToday()`, `todayStr()`), never the visitor's clock

## Current State (2026-06-12)
- Full redesign + engine fixes + post-audit hardening shipped in PR #1 (`feat/booking-engine-redesign` → main): https://github.com/HXSmc/plan-saloon/pull/1
- Audit fixes included: reschedule self-exclusion (`excludeAppointmentId` / `excludeToken`), serializable transactions on reschedule + admin move, revenue reset on un-complete, interval-overlap admin day query + day-relative calendar positioning, phone normalization parity, stale deep-link guard in BookingFlow, module-level useCatalog cache, barber↔service auto-link on barber create, walk-in phone stored as "" (sentinel removed)
- WhatsApp notifications deliberately deferred (user request); `NotifyAdapter` interface ready in `lib/notify.ts`, `manageToken` already passed in

## Known Issues / TODO
- Walk-ins without a phone store `customerPhone: "walk-in"` (admin panel hides it)
- Barber photos are URL-paste only (no upload — Supabase Storage is the natural next step)
- Google reviews is a link (`shopInfo.googleReviewsUrl` placeholder query) — replace with the shop's real place URL
- Shop coordinates in `lib/data.ts` (`SHOP_LAT/LON`) are approximate Ash Shati Al Gharbi — confirm with client
- No rate limiting beyond the per-phone cap (consider IP-based at the proxy)
