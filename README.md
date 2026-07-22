# RoyalwayCC Booking Engine — Beta

## Install dependencies

```powershell
cd C:\Repo\Space_Rental
npm install stripe mysql2 zod server-only
```

## Drop-in files

Copy every folder from this package into the root of the Next.js project.

The package includes:

```text
lib/env.ts
lib/db.ts
lib/stripe.ts
lib/booking-schema.ts
lib/booking-reference.ts
lib/booking-service.ts

app/api/bookings/route.ts
app/api/stripe/webhook/route.ts

app/booking/success/page.tsx
app/booking/cancel/page.tsx

database/001-normalize-collation.sql
.env.production.example
booking-page-with-booking-engine.tsx
```

Replace the current booking page with:

```text
booking-page-with-booking-engine.tsx
```

Place it at the route currently used by your project, likely:

```text
app/book/page.tsx
```

Do not create both `app/book/page.tsx` and `app/booking/page.tsx` unless both
routes are intentionally needed.

## Database migration

In phpMyAdmin, select `royalwaycc_space_booking`, open SQL, and run:

```text
database/001-normalize-collation.sql
```

The four main tables must already exist from Phase 1.

## Local environment

Ensure `.env.local` includes:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=royalwaycc_space_booking
DB_USER=...
DB_PASSWORD=...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

BOOKING_ADMIN_EMAIL=bookings@royalwaycc.org
```

## Stripe local webhook test

After installing Stripe CLI and signing in:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the displayed `whsec_...` value into `.env.local`, restart `npm run dev`,
then use a Stripe test card through Checkout.

## Stripe dashboard webhook for cPanel beta

Create an endpoint at:

```text
https://YOUR-BETA-DOMAIN/api/stripe/webhook
```

Subscribe to:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
```

Copy that endpoint's signing secret into the cPanel environment variable:

```text
STRIPE_WEBHOOK_SECRET
```

## Required Stripe mode

Use `sk_test_...` and Stripe test mode during beta. Do not use live keys until:

- SSL works
- webhook processing works
- duplicate booking tests pass
- cancellation and expiration tests pass
- customer confirmation email is implemented
- admin access is protected

## Current behavior

- The server validates all booking fields.
- The server recalculates all prices.
- Pending bookings hold the selected time for 30 minutes.
- Conflicting active bookings are rejected.
- Stripe Checkout receives only server-calculated line items.
- Stripe webhooks mark paid bookings as confirmed.
- Duplicate Stripe webhook events are ignored safely.
- Booking and payment status changes are recorded in the audit table.
