# WhatsApp AI Sales Agent

A production-grade WhatsApp AI sales agent with a business dashboard. Inbound WhatsApp messages are answered automatically by GPT-4o using business-specific context; staff can view every conversation live and take over from the AI at any time.

**Stack:** Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Supabase (Postgres + Auth + Realtime), OpenAI GPT-4o, Meta WhatsApp Cloud API, deployed on Vercel.

## Features

- **Automatic AI replies** — inbound WhatsApp messages are answered by GPT-4o, grounded in your business's own name, tone, and system prompt.
- **Live conversations dashboard** — every conversation and message updates in real time via Supabase Realtime, no polling or refreshing.
- **Human take-over** — a staff member can take over any conversation with one click, reply manually from the dashboard, and hand it back to the AI when done.
- **New-message alerts** — a toast notification fires the moment a customer messages in, even if you're not currently looking at that conversation.
- **Masked phone numbers** — customer numbers are partially redacted in the UI for privacy.
- **3 selectable dashboard themes** (Boba Green, Milk Tea, Classic Slate), each with its own color palette and typography, switchable from Settings.
- **Auth-gated staff dashboard** — Supabase Auth email/password sign-in, no public sign-up.

## Prerequisites

- Node.js 22+ (24 LTS recommended)
- A [Supabase](https://supabase.com) project
- A [Meta developer app](https://developers.facebook.com) with the WhatsApp product added, and a phone number (test or production)
- An [OpenAI](https://platform.openai.com) API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the env file and fill in every variable:
   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Where to find it |
   |---|---|
   | `WHATSAPP_ACCESS_TOKEN` | Meta App Dashboard → WhatsApp → API Setup (temporary token, or a permanent token from a System User) |
   | `WHATSAPP_PHONE_NUMBER_ID` | Meta App Dashboard → WhatsApp → API Setup |
   | `WHATSAPP_VERIFY_TOKEN` | Any string you choose — used to verify the webhook (see below) |
   | `OPENAI_API_KEY` | OpenAI dashboard → API keys |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (keep secret — never expose to the browser) |

3. Set up the database: open the Supabase SQL editor and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates `conversations`, `messages`, and `business_config`, enables RLS, and adds `conversations`/`messages` to the Realtime publication.

4. Enable Email/Password sign-in in Supabase Auth settings, then manually create one or more staff users (Authentication → Users → Add user). There is no self-service sign-up UI.

5. Run the app locally:
   ```bash
   npm run dev
   ```

## Configuring the Meta webhook

The webhook needs a public HTTPS URL, so you'll need either a deployed instance or a tunnel (e.g. `ngrok http 3000`) during local development.

1. In the Meta App Dashboard → WhatsApp → Configuration, set:
   - **Callback URL**: `https://<your-domain>/api/webhook/whatsapp`
   - **Verify token**: the same value you set for `WHATSAPP_VERIFY_TOKEN`
2. Click **Verify and save** — this triggers a `GET` request that the app answers using `WHATSAPP_VERIFY_TOKEN`.
3. Subscribe to the **messages** webhook field.

## Deploying to Vercel

```bash
vercel link
vercel env add WHATSAPP_ACCESS_TOKEN
vercel env add WHATSAPP_PHONE_NUMBER_ID
vercel env add WHATSAPP_VERIFY_TOKEN
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

Then point the Meta webhook Callback URL at your production domain.

## Testing end to end

1. `npm run dev` and confirm `/` redirects to `/login` when signed out.
2. Sign in with a Supabase Auth user you created above — you should land on `/dashboard/conversations`.
3. Send a WhatsApp message to your configured number. A conversation should appear in the dashboard and an AI reply should arrive on WhatsApp within a few seconds.
4. Click **Take Over** on a conversation, send a manual reply from the dashboard, and confirm the AI stops auto-replying until you click **Resume AI**.
5. Edit `/dashboard/settings` (business name, tone, system prompt) and confirm the next AI reply reflects the change.

## Notes

- The webhook always returns `200` to Meta (even on internal errors) to avoid unnecessary retries; duplicate deliveries are deduplicated on `messages.wa_message_id`.
- The AI reply is dispatched via `waitUntil` so the webhook can acknowledge Meta immediately while the OpenAI call and WhatsApp send happen in the background (bounded by `maxDuration = 30` on the route).
- `X-Hub-Signature-256` webhook signature verification is not implemented in this version — only the `hub.verify_token` check on the `GET` handshake. Add it later if you need stronger authenticity guarantees on inbound webhook calls.
