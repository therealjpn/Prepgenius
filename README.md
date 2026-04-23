# PrepGenius

PrepGenius is a dual-platform AI exam prep product for Nigerian learners preparing for WAEC, JAMB, NECO, and ICAN. This scaffold includes:

- A Next.js App Router web app with mobile-first pages for landing, dashboard, practice, tutor, analytics, study plan, subscriptions, and WhatsApp connect
- Shared business services under [`/Users/jpn/Documents/Prepgenius/lib/services`](/Users/jpn/Documents/Prepgenius/lib/services)
- WhatsApp webhook/session routing under [`/Users/jpn/Documents/Prepgenius/lib/whatsapp/router.ts`](/Users/jpn/Documents/Prepgenius/lib/whatsapp/router.ts)
- Supabase schema and seed files under [`/Users/jpn/Documents/Prepgenius/db/schema.sql`](/Users/jpn/Documents/Prepgenius/db/schema.sql) and [`/Users/jpn/Documents/Prepgenius/db/seed.sql`](/Users/jpn/Documents/Prepgenius/db/seed.sql)

## What’s implemented

- Demo-mode data and in-memory fallbacks so the app structure works before infra is connected
- Shared service layer for questions, practice, tutor, analytics, study plans, referrals, notifications, and subscriptions
- API routes for practice, tutor, analytics, subscriptions, WhatsApp linking, and both Paystack/WhatsApp webhooks
- WhatsApp state machine for onboarding, practice, tutor, progress, study plan, and subscription flows

## Local setup

1. Copy [`.env.example`](/Users/jpn/Documents/Prepgenius/.env.example) to `.env.local`.
2. Fill in your Supabase, Anthropic, Paystack, Meta WhatsApp Cloud API, and Upstash keys.
3. Install dependencies with `npm install`.
4. Run the app with `npm run dev`.

## Important notes

- The current scaffold uses demo-memory data until Supabase integration is completed inside each service.
- The webhook routes are already placed at `/api/webhooks/paystack` and `/api/webhooks/whatsapp`.
- WhatsApp practice currently uses the same shared services as the web flow, which is the critical architecture goal for the MVP.

## Recommended next implementation steps

1. Replace the in-memory store in [`/Users/jpn/Documents/Prepgenius/lib/server/memory-store.ts`](/Users/jpn/Documents/Prepgenius/lib/server/memory-store.ts) with Supabase reads/writes.
2. Add authenticated Supabase session handling for real user accounts and phone linking.
3. Finish WhatsApp-specific media support for voice notes, photos, and group sessions.
4. Add cron endpoints for daily resets, reminders, and weekly reports.
5. Replace the demo-mode subscription verification response with real Paystack confirmation and entitlement updates.
